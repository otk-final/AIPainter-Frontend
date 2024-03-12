import { subscribeWithSelector } from "zustand/middleware"
import { BaseCRUDRepository, BaseRepository, ItemIdentifiable } from "./tauri_repository"
import { create } from "zustand"
import { fs, path, tauri } from "@tauri-apps/api"
import { ComfyUIRepository } from "./comfyui"
import { v4 as uuid } from "uuid"
import { AudioOption, DEFAULT_AUDIO_OPTION } from "./tts_api"
import { GPTRepository } from "./gpt"
import { ImageGenerate, ImageGenerateParameter, ImageScale, KeyImage, SRTGenerate, VideoFragmentConcat } from "./generate_utils"
import { JYDraftRepository } from "./draft"
import { JYDraftExport, KeyFragment, KeyFragmentEffect } from "./draft_utils"
import { TTSRepository } from "./tts"
import { TranslateRepository } from "./translate"
import { Project } from "./workspace"

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
                effect: { orientation: "random" }
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
                effect: { orientation: "random" }
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
    //场景
    scene: string,
    //角色集
    actors: string[]


    //字幕台词
    srt?: string


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
    handleResolveChapter = async (index: number, gptRepo: GPTRepository) => {
        let chapter = this.items[index];
        let api = await gptRepo.newClient()
        let scene = await api.chapterBoarding(chapter.draft, gptRepo)
        if (!scene) {
            throw new Error("推理异常")
        }
        //覆盖数据
        this.items[index].scene = scene

        //保存
        this.sync()
    }

    //生成场景关键词
    handleGeneratePrompt = async (index: number) => {
        console.info(index)
    }

    //翻译场景关键词
    handleTranslatePrompt = async (index: number, translateRepo: TranslateRepository) => {
        let api = await translateRepo.newClient()
        //翻译
        let enResp = await api.translate(this.items[index].scene)
        this.items[index].prompt = enResp.result.trans_result.map(i => i.dst).join(",")

        this.sync()
    }


    //批量图片放大
    batchScaleImage = async (start_idx: number) => {
        let scaleArray = [] as KeyImage[]
        for (let i = start_idx; i < this.items.length; i++) {
            let frame = this.items[i]
            //未生成，或者已经放大
            if (!frame.image.path || frame.image.path.includes("scale")) {
                continue;
            }
            let output_name = "outputs" + path.sep + (frame.id + "-scale-" + uuid() + ".png")
            scaleArray.push({
                id: i,
                image_path: await this.absulotePath(frame.image.path),
                scale: 2,
                output_name: output_name,
                output_path: await this.absulotePath(output_name)
            })
        }
        let results = await ImageScale(scaleArray);

        //替换数据
        for (let i = 0; i < results.length; i++) {
            this.items[i].image.path = results[i].output_name
        }

        //更新
        await this.sync()
    }

    //单张图片放大
    handleScaleImage = async (index: number) => {
        let frame = this.items[index]
        if (!frame.image.path || frame.image.path.includes("scale")) {
            throw new Error("当前图片已放大")
        }

        let output_name = "outputs" + path.sep + (frame.id + "-scale-" + uuid() + ".png")
        let arg = {
            id: frame.id,
            image_path: await this.absulotePath(frame.image.path),
            scale: 2,
            output_name: output_name,
            output_path: await this.absulotePath(output_name)
        } as KeyImage

        let results = await ImageScale([arg]);
        this.items[index].image.path = results[0].output_name

        this.sync()
    }



    //生成图片
    handleGenerateImage = async (index: number, style: string, project: Project, comyuiRepo: ComfyUIRepository, actorRepo: ActorRepository) => {
        let chapter = this.items[index]

        //获取所有角色关键词
        let actor_prompt = actorRepo.toPrompt(chapter.actors)

        //角色关键词 + 场景关键词
        let prompt = [actor_prompt, chapter.prompt].join(",")


        //生成图片（以项目配置为准）
        let cp: ImageGenerateParameter = {
            prompt: prompt,
            style: style,
            canvas_size: project.canvas_size
        }


        //生成图片
        let outputs = await ImageGenerate(cp, comyuiRepo, async (idx, fileBuffer) => {
            let fileName = index + "-" + uuid() + ".png"
            return await this.saveFile("outputs", fileName, fileBuffer)
        })

        //记录当前图片，和历史图片
        chapter.image.path = outputs[0]
        chapter.image.history = [...chapter.image!.history.concat(...outputs)]

        //save
        this.sync()
    }

    handleGenerateAudio = async (index: number, audio: AudioOption, actorRepo: ActorRepository, ttsRepo: TTSRepository) => {

        let audioOption: AudioOption
        let chapter = this.items[index]
        if (chapter.srt_actor) {
            //获取角色设置配音
            let actors = actorRepo.items.filter(item => item.alias === chapter.srt_actor)
            if (!actors) {
                throw new Error("角色不存在")
            }
            let actor = actors[0]
            if (!actor.voice) {
                throw new Error("角色未配置配音")
            }
            audioOption = actor.voice!
        } else {
            audioOption = { ...audio }
        }

        //生成音频
        let api = await ttsRepo.newClient()
        let resp = await api.translate(chapter.srt!, audioOption)


        //保存音频
        let audioName = index + "-new-" + uuid() + ".mp3"
        let audioPath = await this.saveFile("temp-audios", audioName, resp.data)

        //记录时长
        this.items[index].srt_duration = resp.duration
        this.items[index].srt_audio_path = audioPath

        this.sync()
        return audioPath
    }
    handleGenerateVideo = async (index: number, settingRepo: JYDraftRepository) => {
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
    handleConcatVideo = async (savePath: string, settingRepo: JYDraftRepository) => {
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
    handleConcatJYDraft = async (save_dir_path: string, settingRepo: JYDraftRepository) => {
        let draft_name = await path.basename(save_dir_path)
        console.info("draft_name", draft_name)

        //有效帧片段
        let fragments = await this.formatFragments()
        fragments.forEach(e => e.effect.orientation = settingRepo.formatEffectOrientation(e.effect.orientation))

        //生成字幕文件
        let srt_path = await this.absulotePath("video.srt")
        await SRTGenerate(srt_path, fragments)


        //根据第一张图确认导出尺寸
        let { width, height } = await tauri.invoke("measure_image_dimensions", { imagePath: fragments[0].image_path }) as { width: number, height: number }

        //参数
        let param = {
            draft_path: save_dir_path,
            srt_path: srt_path,
            items: fragments,
            canvas_size: {
                width: width,
                height: height
            }
        }
        //导出
        await JYDraftExport(param, settingRepo)
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
        this.items = [{ id: uuid(), name: "角色1", alias: "角色1", style: "", traits: [], voice: { ...DEFAULT_AUDIO_OPTION } }]
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

    handleConfirmTraitsOption = async (index: number, traits: TraitsOption[]) => {
        this.items[index].traits = [...traits]
        this.sync()
    }

    //生成图片
    handleGenerateImage = async (traits: TraitsOption[], comyuiRepo: ComfyUIRepository) => {

        // this.items[index]
        let prompt = traits.map(item => item.value).join(",")

        //生成图片
        let cp = {
            prompt: prompt,
            style: comyuiRepo.items[0].name
        } as ImageGenerateParameter


        let outputs = await ImageGenerate(cp, comyuiRepo, async (idx, fileBuffer) => {
            return await this.saveFile("outputs", "ac_" + uuid() + ".png", fileBuffer)
        })

        //渲染页面
        return outputs[0]
    }

    toPrompt = (checkActors: string[]) => {
        return this.items.filter(item => checkActors.indexOf(item.alias) !== -1).map(item => {
            return item.traits.map(f => f.value).join(",")
        }).join(";")
    }
}

export const useActorRepository = create<ActorRepository>()(subscribeWithSelector((set, get) => new ActorRepository("actors.json", set, get)))
