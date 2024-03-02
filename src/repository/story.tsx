import { subscribeWithSelector } from "zustand/middleware"
import { BaseCRUDRepository, BaseRepository, ItemIdentifiable } from "./tauri_repository"
import { create } from "zustand"
import { fs, path, tauri } from "@tauri-apps/api"
import { ComfyUIRepository } from "./comfyui"
import { v4 as uuid } from "uuid"
import { AudioOption, TTSApi } from "./tts_api"
import { GPTRepository } from "./gpt"
import { ImageGenerate, SRTGenerate, VideoFragmentConcat } from "./generate_utils"
import { BaisicSettingRepository } from "./setting"
import { JYMetaDraftExport, KeyFragment, KeyFragmentEffect } from "./drafts"

export type ImportType = "input" | "file"

export type BoardType = "ai" | "line"

export interface Script {
    fileId: string
    path: string
    input: string
    type: ImportType
}



export interface ChapterBoardingOutput {
    //剧本
    original?: string,
    //场景
    scene: string,
    //角色集
    characters: string[],
    //场景描述
    description: string,
    //台词集
    dialogues: string[]
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
    boardWithAi = async (gptRepo: GPTRepository, importType: ImportType, path: string, text: string) => {
        let gptApi = await gptRepo.newClient()
        this.boardType = "ai"
        //上传文本
        if (importType === "file") {
            this.fileId = await gptApi.fileUpload("file", path)
            this.path = path
        } else {
            this.fileId = await gptApi.scriptUpload("", text)
            this.input = text
        }

        //添加分镜
        let chapterObjects = await gptApi.scriptBoarding(this.fileId, gptRepo)
        return chapterObjects.flatMap((message, idx) => {
            let record = message as ChapterBoardingOutput
            return {
                id: idx,
                name: "",
                draft: record.original!,
                scene: record.scene,
                description: record.description,
                srt: record.dialogues.join(","),
                actors: record.characters,
                image: {
                    history: [] as string[]
                },
                effect: { orientation: "default" }
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
                name: "",
                draft: line.trim(),
                scene: "",
                description: "",
                dialogue: "",
                actors: [],
                image: {
                    history: [] as string[]
                },
                effect: { orientation: "default" }
            } as Chapter
        })
    }

}
export const useScriptRepository = create<ScriptRepository>()(subscribeWithSelector((set, get) => new ScriptRepository("script.json", set, get)))



export interface Chapter extends ItemIdentifiable {
    id: number,
    name: string,

    //草稿
    draft: string
    //场景名称
    scene: string,
    //场景描写
    description: string,
    //字幕台词
    srt?: string
    //角色集
    actors: string[]

    //场景关键词
    prompt?: string,

    //生成图片信息
    image: {
        path?: string
        history: string[]
    },

    srt_actor?: string

    //原字幕信息
    srt_duration?: number
    srt_audio_path?: string
    srt_video_path?: string

    //效果
    effect: KeyFragmentEffect
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

    //解析原稿
    handleResolveChapter = async (index: number, gptRepo: GPTRepository, actorRepo: ActorRepository) => {
        let chapter = this.items[index];
        let api = await gptRepo.newClient()
        let outputs = await api.chapterBoarding("", chapter.draft, gptRepo)
        if (!outputs) {
            throw new Error("推理异常")
        }
        //解析
        let result = outputs[0] as ChapterBoardingOutput


        //判断是否有新角色加入，则添加默认角色
        await actorRepo.mergeActors(result.characters)

        //覆盖数据
        this.items[index].actors = result.characters
        this.items[index].description = result.description

        //TODO 翻译场景关键词
        this.items[index].prompt = ""
        //保存
        this.sync()
    }

    //生成图片
    handleGenerateImage = async (index: number, style: string, comyuiRepo: ComfyUIRepository, actorRepo: ActorRepository) => {
        let chapter = this.items[index]

        //获取所有角色关键词
        let actor_prompt = actorRepo.toPrompt(chapter.actors)

        //角色关键词 + 场景关键词
        let prompt = [actor_prompt, chapter.prompt].join(",")

        //生成图片
        let outputs = await ImageGenerate(prompt, style, comyuiRepo, async (idx, fileBuffer) => {
            let fileName = index + "-" + uuid() + ".png"
            return await this.saveFile("outputs", fileName, fileBuffer)
        })

        //记录当前图片，和历史图片
        chapter.image.path = outputs[0]
        chapter.image.history = [...chapter.image!.history.concat(...outputs)]

        //save
        this.sync()
    }
    handleGenerateAudio = async (index: number, audio: AudioOption, api: TTSApi) => {
        //生成音频
        let item = this.items[index]
        let resp = await api.translate(item.srt!, audio)

        //保存音频
        let audioName = index + "-new-" + uuid() + ".mp3"
        let audioPath = await this.saveFile("temp-audios", audioName, resp.data)

        //记录时长
        this.items[index].srt_duration = resp.duration
        this.items[index].srt_audio_path = audioPath

        this.sync()
        return audioPath
    }
    handleGenerateVideo = async (index: number, settingRepo: BaisicSettingRepository) => {
        let item = this.items[index]

        //临时存储目录
        let videoDir = await path.join(this.repoDir, "temp-videos")
        await fs.createDir(videoDir, { dir: this.baseDir(), recursive: true })

        //参数
        let videoPath = "temp-videos" + path.sep + index + "-" + uuid() + ".mp4";
        let fragment = await this.convertFragment(index, item);

        //rewrite 参数
        fragment.video_path = await this.absulotePath(videoPath)
        fragment.effect.orientation = settingRepo.formatEffectOrientation(fragment.effect.orientation);

        //图片+音频 合成视频
        let outputs = await tauri.invoke("key_video_generate", { parameters: [fragment] })
        console.info("outputs", outputs);

        //更新
        this.items[index].srt_video_path = videoPath;
        this.sync()
        return videoPath
    }

    //过滤有效片段
    formatFragments = async () => {
        let fragments = [] as KeyFragment[]
        for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i]
            let fragment = await this.convertFragment(i, item)
            fragments.push(fragment)
        }
        return fragments
    }

    private convertFragment = async (index: number, item: Chapter) => {
        return {
            id: item.id,
            name: index + "",
            srt: item.srt,
            duration: item.srt_duration,
            image_path: item.image.path ? await this.absulotePath(item.image.path) : "",
            audio_path: item.srt_audio_path ? await this.absulotePath(item.srt_audio_path) : "",
            video_path: item.srt_video_path ? await this.absulotePath(item.srt_video_path) : "",
            effect: { ...item.effect }
        } as KeyFragment
    }

    //合并导出视频
    handleConcatVideo = async (savePath: string, settingRepo: BaisicSettingRepository) => {
        //有效片段
        let fragments = await this.formatFragments()
        fragments = fragments.slice(0, 3)

        //rewrite 参数
        for (let i = 0; i < fragments.length; i++) {
            fragments[i].effect.orientation = settingRepo.formatEffectOrientation(fragments[i].effect.orientation);
            fragments[i].video_path = await this.absulotePath("temp-videos" + path.sep + fragments[i].name + ".mp4")
        }

        //生成字幕文件
        let srt_path = await this.absulotePath("video.srt")
        await SRTGenerate(srt_path, fragments)

        //临时存储目录
        let concats_path = await this.absulotePath("video.concats")
        let video_path = await this.absulotePath("output-" + uuid() + ".mp4")
        return await VideoFragmentConcat(concats_path, srt_path, video_path, savePath, fragments)
    }

    //导出剪映草稿
    handleConcatJYDraft = async (saveDir: string, settingRepo: BaisicSettingRepository) => {
        let draft_name = await path.basename(saveDir)
        console.info("draft_name", draft_name)

        //有效帧片段
        let fragments = await this.formatFragments()
        fragments.forEach(e => e.effect.orientation = settingRepo.formatEffectOrientation(e.effect.orientation))

        //生成字幕文件
        let srt_path = await this.absulotePath("video.srt")
        await SRTGenerate(srt_path, fragments)

        //导出
        await JYMetaDraftExport(saveDir, fragments, srt_path, settingRepo)
    }
}

export const useChapterRepository = create<ChapterRepository>()(subscribeWithSelector((set, get) => new ChapterRepository("chapters.json", set, get)))


export interface Actor extends ItemIdentifiable {
    id: string
    name: string
    alias: string
    style: string
    image?: string
    voice?: AudioOption
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

    override free() {
        this.items = [{ id: uuid(), name: "角色1", alias: "角色1", style: "", traits: [] }]
    }

    //初始化
    initialization = async (newActors: Actor[]) => {
        this.items.push(...newActors)
        this.sync()
    }

    mergeActors = async (newActors: string[]) => {
        for (let i = 0; i < newActors.length; i++) {
            let exist = this.items.some(actor => actor.alias === newActors[i])
            if (exist) {
                continue
            }
            this.items.push({ id: uuid(), name: newActors[i], alias: newActors[i], style: "", traits: [] })
        }
        this.sync()
    }

    handleConfirmTraitsOption = async (index: number,traits: TraitsOption[]) => {
        this.items[index].traits = [...traits]
        this.sync()
    }

    //生成图片
    handleGenerateImage = async (index: number, traits: TraitsOption[], comyuiRepo: ComfyUIRepository) => {

        // this.items[index]
        let prompt = traits.map(item => item.value).join(",")

        //生成图片
        let style = comyuiRepo.items[0].name;
        let outputs = await ImageGenerate(prompt, style, comyuiRepo, async (idx, fileBuffer) => {
            return await this.saveFile("outputs", "ac_" + uuid() + ".png", fileBuffer)
        })

        this.items[index].image = outputs[0];
        this.sync()

        //渲染页面
        return this.absulotePath(outputs[0])
    }

    toPrompt = (checkActors: string[]) => {
        return this.items.filter(item => checkActors.indexOf(item.alias) !== -1).map(item => {
            return item.traits.map(f => f.value).join(",")
        }).join(";")
    }
}

export const useActorRepository = create<ActorRepository>()(subscribeWithSelector((set, get) => new ActorRepository("actors.json", set, get)))
