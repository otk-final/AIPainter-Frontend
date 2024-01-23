import { subscribeWithSelector } from "zustand/middleware"
import { BaseCRUDRepository, BaseRepository, Directory, ItemIdentifiable } from "./tauri_repository"
import { create } from "zustand"
import { GPTAssistantsApi } from "./gpt"
import { fs, path } from "@tauri-apps/api"
import { Text2ImageHandle, WFScript, registerComfyUIPromptCallback } from "./comfyui_api"
import { ComfyUIRepository } from "./comfyui"
import { v4 as uuid } from "uuid"

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

    free() {
        this.fileId = undefined
        this.path = undefined
        this.input = undefined
        this.importType = undefined
        this.boardType = undefined
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
                id: uuid(),
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
                id: uuid(),
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



export interface Chapter extends ItemIdentifiable {
    id: string
    original: string
    actors: string[]
    ai?: {
        dialogues: string[],
        scene?: string
        actors: string[]
        description?: string
    }
    image?: {
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

    //初始化
    initialization = async (chapters: Chapter[]) => {
        this.items = [...chapters]
        this.sync()
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

                let history = chapter.image?.history || []
                history.push(filePath)
                chapter.image = {
                    path: filePath,
                    history: history
                }
            })
            //save
            this.sync()
        }

        //监听任务
        registerComfyUIPromptCallback({ jobId: "", promptId: job.prompt_id, handle: callback })
    }
}

export const useChapterRepository = create<ChapterRepository>()(subscribeWithSelector((set, get) => new ChapterRepository("chapters.json", set, get)))


export interface Actor extends ItemIdentifiable {
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

    free(): ActorRepository {
        this.items = [{ id: 0, name: "角色1", alias: "角色1", style: "", traits: [] }]
        return this
    }

    //初始化
    mergeActors = async (newActors: Actor[]) => {
        this.items.push(...newActors)
        this.sync()
    }

    //生成图片
    handleGenerateImage = async (traits: TraitsOption[], comyuiRepo: ComfyUIRepository, tempCallBack: (filepath: string) => void) => {

        // this.items[index]
        let prompt = traits.map(item => item.value).join(",")
        //api
        let api = comyuiRepo.newClient()
        let text = await comyuiRepo.buildModePrompt(comyuiRepo.items[0].name)
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
            tempCallBack(filePath)
        }

        //监听任务
        registerComfyUIPromptCallback({ jobId: "", promptId: job.prompt_id, handle: callback })
    }
}

export const useActorRepository = create<ActorRepository>()(subscribeWithSelector((set, get) => new ActorRepository("actors.json", set, get)))
