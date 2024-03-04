import { create } from "zustand"
import { BaseCRUDRepository, ItemIdentifiable } from "./tauri_repository"
import { subscribeWithSelector } from "zustand/middleware"
import { fs, path, tauri } from "@tauri-apps/api"
import { Image2TextHandle, WFScript } from "./comfyui_api"
import { ComfyUIRepository } from "./comfyui"
import { createWorker } from "tesseract.js"
import { v4 as uuid } from "uuid"
import { AudioOption } from "./tts_api"
import { JYMetaDraftExport, KeyFragment, KeyFragmentEffect } from "./drafts"
import { BaisicSettingRepository } from "./setting"
import { GPTRepository } from "./gpt"
import { ImageGenerate, SRTGenerate, VideoFragmentConcat } from "./generate_utils"
import { TTSRepository } from "./tts"

export interface KeyFrame extends ItemIdentifiable {
    id: number
    name: string,

    //关键帧 + 所处视频
    path: string,


    prompt?: string,
    image: {
        path?: string
        history: string[]
    }


    //原字幕信息
    srt?: string
    srt_duration?: number
    srt_audio_path?: string
    srt_video_path?: string


    //字幕改写信息
    srt_rewrite?: string
    srt_rewrite_duration?: number
    srt_rewrite_audio_path?: string
    srt_rewrite_video_path?: string

    //效果
    effect: KeyFragmentEffect
}

export class KeyFrameRepository extends BaseCRUDRepository<KeyFrame, KeyFrameRepository> {

    //初始化
    initialization = async (frames: KeyFrame[]) => {
        this.items = [...frames]
        this.sync()
    }

    //重写台词
    handleRewriteContent = async (index: number, gptRepo: GPTRepository) => {
        let gptApi = await gptRepo.newClient();
        let rewrite = await gptApi.rewritePrompt(this.items[index].srt!, gptRepo)
        this.items[index].srt_rewrite = rewrite
        await this.sync()
    }

    //识别图片字幕
    recognizeContent = async (index: number) => {
        let targetPath = this.items[index].path

        let worker = await createWorker('chi_sim')
        let imageBytes = await fs.readBinaryFile(await this.absulotePath(targetPath))


        //添加矩阵后，效果不好，后期优化
        // let size = 1024
        //导出帧均以1024*1024为准，计算有效字幕比例
        // let rectangle = {
        //     left: size * 0.1,
        //     top: size * 0.5,
        //     width: size * 0.9,
        //     height: size * 0.5,
        // }


        const ret = await worker.recognize(Buffer.from(imageBytes.buffer), { rectangle: undefined })
        this.items[index].srt = ret.data.text.replaceAll('\n', "").replaceAll(' ', '')

        await this.sync()
        await worker.terminate();
    }

    //反推关键词
    handleGeneratePrompt = async (index: number, comyuiRepo: ComfyUIRepository) => {
        let frame = this.items[index]
        let api = await comyuiRepo.newClient()
        let text = await comyuiRepo.buildReversePrompt()
        let script = new WFScript(text)

        //上传文件
        await api.upload(api.clientId, await this.absulotePath(frame.path), frame.name)

        //提交任务
        let { promptId, promptResult } = await api.prompt(script, { subfolder: api.clientId, filename: frame.name }, Image2TextHandle)
        //关键词所在的节点数
        let step = script.getWD14TaggerStep()
        //定位结果
        let reversePrompts = promptResult[promptId]!.outputs![step]!.tags! as string[]

        //存在返回结果，则更新
        if (reversePrompts) {
            this.items[index].prompt = reversePrompts.join(",")
            this.sync()
        }
    }

    //生成图片
    handleGenerateImage = async (index: number, style: string, comyuiRepo: ComfyUIRepository) => {
        let frame = this.items[index]

        //生成图片
        let outputs = await ImageGenerate(frame.prompt!, style, comyuiRepo, async (idx, fileBuffer) => {
            //保存文件
            let fileName = frame.id + "-" + uuid() + ".png"
            return await this.saveFile("outputs", fileName, fileBuffer)
        }, async (api) => {
            //上传文件
            await api.upload(api.clientId, await this.absulotePath(frame.path), frame.name)
            return { subfolder: api.clientId, filename: frame.name }
        })

        //记录当前图片，和历史图片
        frame.image.path = outputs[0]
        frame.image.history = [...frame.image.history.concat(...outputs)]

        //save
        this.sync()
    }

    //在线生成音频
    handleGenerateAudio = async (index: number, audio: AudioOption, ttsRepo: TTSRepository) => {
        let api = await ttsRepo.newClient()

        //生成音频
        let item = this.items[index]
        let resp = await api.translate(item.srt_rewrite!, audio)

        //保存音频
        let audioName = item.id + "-new-" + uuid() + ".mp3"
        let audioPath = await this.saveFile("temp-audios", audioName, resp.data)

        //记录时长
        this.items[index].srt_rewrite_duration = resp.duration
        this.items[index].srt_rewrite_audio_path = audioPath

        this.sync()
        return audioPath
    }

    //本地生成视频
    handleGenerateVideo = async (index: number, settingRepo: BaisicSettingRepository) => {
        let item = this.items[index]

        //临时存储目录
        let videoDir = await path.join(this.repoDir, "temp-videos")
        await fs.createDir(videoDir, { dir: this.baseDir(), recursive: true })

        //参数
        let videoPath = "temp-videos" + path.sep + item.name + "-" + uuid() + ".mp4";
        let fragment = await this.convertFragment(item);

        //rewrite 参数
        fragment.video_path = await this.absulotePath(videoPath)
        fragment.effect.orientation = settingRepo.formatEffectOrientation(fragment.effect.orientation);

        //图片+音频 合成视频
        let outputs = await tauri.invoke("key_video_generate", { parameters: [fragment] })
        console.info("outputs", outputs);

        //更新
        this.items[index].srt_rewrite_video_path = videoPath;
        this.sync()
        return videoPath
    }


    //过滤有效片段
    formatFragments = async () => {
        let fragments = [] as KeyFragment[]
        for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i]
            let fragment = await this.convertFragment(item)
            fragments.push(fragment)
        }
        return fragments
    }

    private convertFragment = async (item: KeyFrame) => {
        return {
            id: item.id,
            name: item.name,
            srt: item.srt_rewrite_audio_path ? item.srt_rewrite : item.srt,
            duration: item.srt_rewrite_audio_path ? item.srt_rewrite_duration : item.srt_duration,
            image_path: await this.absulotePath(item.image.path ? item.image.path : item.path),
            audio_path: await this.absulotePath(item.srt_rewrite_audio_path ? item.srt_rewrite_audio_path : item.srt_audio_path!),
            video_path: await this.absulotePath(item.srt_rewrite_video_path ? item.srt_rewrite_video_path : item.srt_video_path!),
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


export const useKeyFrameRepository = create<KeyFrameRepository>()(subscribeWithSelector((set, get) => new KeyFrameRepository("frames.json", set, get)))

