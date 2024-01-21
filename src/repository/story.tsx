import { subscribeWithSelector } from "zustand/middleware"
import { BaseCRUDRepository, BaseRepository, Directory } from "./tauri_repository"
import { create } from "zustand"
import { GPTAssistantsApi } from "./gpt"
import { fs, path } from "@tauri-apps/api"
import { Text2ImageHandle, WFScript, registerComfyUIPromptCallback } from "./comfyui_api"
import { ComfyUIRepository } from "./comfyui"

export type ImportType = "input" | "file"

export type BoardType = "ai" | "line"

export interface Script {
    fileId: string
    path: string
    input: string
    type: ImportType
}


//剧本
export class ScriptRepository extends BaseRepository<ScriptRepository> {
    
    repoInitialization(thisData: ScriptRepository): void {
        this.fileId = thisData.fileId
        this.path = thisData.path
        this.input = thisData.input
        this.importType = thisData.importType
        this.boardType = thisData.boardType
    }

    repoEmpty(): ScriptRepository {
        return this
    }

    fileId?: string
    path?: string
    input?: string
    importType?: ImportType
    boardType?: BoardType

    //分镜
    boardWithAi = async (gptApi: GPTAssistantsApi, importType: ImportType, path: string, text: string) => {
        this.boardType = "ai"
        //上传文本
        if (importType === "file") {
            this.fileId = await gptApi.fileUpload("file", path)
            this.path = path
        } else {
            this.fileId = await gptApi.scriptUpload("", text)
            this.input = text
        }

        //添加任务
        let chapterObjects = await gptApi.scriptBoarding(this.fileId)
        return chapterObjects.flatMap((message, idx) => {
            return {
                id: idx,
                original: message["original"] || "",
                ai: {
                    actors: message["characters"] || [],
                    scene: message["scene"] || "",
                    description: message["description"] || "",
                    dialogues: message["dialogues"] || [],
                },
                image: {
                    history: [] as string[]
                }
            } as Chapter
        })
    }

    boardWithLine = async (importType: ImportType, path: string, text: string) => {
        this.boardType = "line"
        //换行 本地解析
        let scriptText = ""
        if (importType === "file") {
            scriptText = await fs.readTextFile(path)
            this.path = path
        } else {
            scriptText = text
            this.input = text
        }

        let lines = scriptText.split("\n")
        return lines.filter(line => line !== "").map((line, idx) => {
            return {
                id: idx,
                original: line.trim(),
                image: {
                    history: [] as string[]
                }
            } as Chapter
        })
    }

    //其他角色信息
    handleCollectActors = async () => {

    }

}
export const useScriptRepository = create<ScriptRepository>()(subscribeWithSelector((set, get) => new ScriptRepository("script.json", set, get)))



export interface Chapter {
    id: number
    original: string
    actors: string[]
    ai: {
        dialogues: string[],
        scene?: string
        actors: string[]
        description?: string
    }
    image: {
        style?: string
        prompt?: string
        path?: string
        history: string[]
    }
    prompt?: {
        cn: string
        en: string
    }
}


export class ChapterRepository extends BaseCRUDRepository<Chapter, ChapterRepository> {

    repoInitialization(thisData: ChapterRepository): void {
        this.items = thisData.items
    }

    repoEmpty(): ChapterRepository {
        this.items = []
        return this
    }

    //初始化
    initialization = async (chapters: Chapter[]) => {
        this.items = [...chapters]

        //写入文件
        let chaptersJsonPath = await path.join(this.repoDir, "chapters.json")
        await fs.writeTextFile(chaptersJsonPath, JSON.stringify(this, null, '\t'), { dir: this.baseDir(), append: false })
    }

    //提取关键词
    handleAnalysisPrompt = async (index: number) => {
        let chapter = this.items[index]
        console.info(chapter)
    }

    //生成图片
    handleGenerateImage = async (index: number, style: string, comyuiRepo: ComfyUIRepository) => {
        let chapter = this.items[index]

        //comyui api
        let api = comyuiRepo.newClient()
        let text = comyuiRepo.buildModePrompt(style)
        let script = new WFScript(text)

        //add prompt task
        let job = await api.prompt(script, { positive: chapter.prompt!.en || comyuiRepo.positivePrompt, negative: comyuiRepo.negativePrompt || "" }, Text2ImageHandle)

        //获取 当前流程中 输出图片节点位置
        let step = script.getOutputImageStep()
        const callback = async (promptId: string, respData: any) => {

            //下载文件
            let images = respData[promptId]!.outputs![step].images! as { filename: string, subfolder: string, type: string }[]
            images.forEach(async (imageItem) => {
                //保存
                let fileBuffer = await api.download(imageItem.subfolder, imageItem.filename)
                let filePath = await this.saveImage("outputs", imageItem.filename, fileBuffer)

                chapter.image.history.push(filePath)
                chapter.image.path = filePath
            })
            this.reactived(true)
        }

        //监听任务
        registerComfyUIPromptCallback({ jobId: "", promptId: job.prompt_id, handle: callback })
    }
}

export const useChapterRepository = create<ChapterRepository>()(subscribeWithSelector((set, get) => new ChapterRepository("chapters.json", set, get)))


export interface Actor {
    id: number
    name: string
    alias: string
    style: string
    image?: string
    traits: TraitsOption[]
}

export interface TraitsConfig {
    key: string
    name: string
    requirement?: string
    options: TraitsOption[]
}

export interface TraitsOption {
    key: string
    label: string
    value?: string
    image?: string
    weight?: string
}


export class ActorRepository extends BaseCRUDRepository<Actor, ActorRepository> {
    repoInitialization(thisData: ActorRepository): void {
        this.items = thisData.items
    }
    repoEmpty(): ActorRepository {
        this.items = [{ id: 0, name: "角色1", alias: "角色1", style: "", traits: [] }]
        return this
    }

    //生成图片
    handleGenerateImage = async (index: number, traits: TraitsOption[], comyuiRepo: ComfyUIRepository) => {

        // this.items[index]
        let itemActor = this.items[index]
        let prompt = traits.map(item => item.value).join(",")

        //api
        let api = comyuiRepo.newClient()
        let text = comyuiRepo.buildReversePrompt()
        let script = new WFScript(text)

        //add prompt task
        let job = await api.prompt(script, { positive: prompt || comyuiRepo.positivePrompt, negative: comyuiRepo.negativePrompt || "" }, Text2ImageHandle)

        //获取 当前流程中 输出图片节点位置
        let step = script.getOutputImageStep()
        const callback = async (promptId: string, respData: any) => {

            //下载文件
            let imageItem = respData[promptId]!.outputs![step].images! as { filename: string, subfolder: string, type: string }[][0]
            //下载，保存
            let fileBuffer = await api.download(imageItem.subfolder, imageItem.filename)
            let filePath = await this.saveImage("outputs", imageItem.filename, fileBuffer)
            //更新状态
            itemActor.image = filePath
        }

        //监听任务
        registerComfyUIPromptCallback({ jobId: "", promptId: job.prompt_id, handle: callback })
    }
}

export const useActorRepository = create<ActorRepository>()(subscribeWithSelector((set, get) => new ActorRepository("actors.json", set, get)))
