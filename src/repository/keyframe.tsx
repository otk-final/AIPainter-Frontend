import { create } from "zustand"
import { BaseCRUDRepository, ItemIdentifiable } from "./tauri_repository"
import { subscribeWithSelector } from "zustand/middleware"
import { Image2TextHandle, ApiPrompt, ComfyUIApi, ComfyUIImageLocation, ComfyUIImageDimensions } from "../api/comfyui_api"
import { ComfyUIRepository, KeyImage } from "./comfyui"
import { v4 as uuid } from "uuid"
import { JYDraftExport, KeyFragment, KeyFragmentEffect } from "./draft_utils"
import { JYDraftRepository } from "./draft"
import { AudioOption, BytedanceApi } from "../api/bytedance_api"

import { path } from "@tauri-apps/api";
import tauri from "@tauri-apps/api/core";
import fs from "@tauri-apps/plugin-fs";
import { GPTAssistantsApi } from "@/api/gpt_api"
import { SRTGenerate } from "./srt"
import { ConcatFragments } from "./video"


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
    handleRewriteContent = async (index: number) => {
        let api = new GPTAssistantsApi()
        let rewrite = await api.rewritePrompt(this.items[index].srt!)
        this.items[index].srt_rewrite = rewrite
        await this.sync()
    }

    //识别图片字幕
    // recognizeContent = async (index: number) => {
    //     let targetPath = this.items[index].path

    //     let worker = await createWorker('chi_sim')
    //     let imageBytes = await fs.readBinaryFile(await this.absulotePath(targetPath))


    //     //添加矩阵后，效果不好，后期优化
    //     // let size = 1024
    //     //导出帧均以1024*1024为准，计算有效字幕比例
    //     // let rectangle = {
    //     //     left: size * 0.1,
    //     //     top: size * 0.5,
    //     //     width: size * 0.9,
    //     //     height: size * 0.5,
    //     // }


    //     const ret = await worker.recognize(Buffer.from(imageBytes.buffer), { rectangle: undefined })
    //     this.items[index].srt = ret.data.text.replaceAll('\n', "").replaceAll(' ', '')

    //     await this.sync()
    //     await worker.terminate();
    // }

    //批量图片放大
    batchScaleImage = async (start_idx: number) => {
        let scaleArray = [] as KeyImage[]
        for (let i = start_idx; i < this.items.length; i++) {
            let frame = this.items[i]
            //未生成，或者已经放大
            if (!frame.image.path || frame.image.path.includes("scale")) {
                continue;
            }
            let output_name = "outputs" + path.sep() + (frame.id + "-scale-" + uuid() + ".png")
            scaleArray.push({
                id: i,
                image_path: await this.absulotePath(frame.image.path),
                scale: 2,
                output_name: output_name,
                output_path: await this.absulotePath(output_name)
            })
        }

        let results =  await tauri.invoke('key_image_scale_handler', { parameters: scaleArray }) as KeyImage[]

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

        let output_name = "outputs" + path.sep() + (frame.id + "-scale-" + uuid() + ".png")
        let arg = {
            id: frame.id,
            image_path: await this.absulotePath(frame.image.path),
            scale: 2,
            output_name: output_name,
            output_path: await this.absulotePath(output_name)
        } as KeyImage


        let results = await tauri.invoke('key_image_scale_handler', { parameters: [arg] }) as KeyImage[]
        this.items[index].image.path = results[0].output_name

        this.sync()
    }

    //反推关键词
    handleGeneratePrompt = async (index: number, comyuiRepo: ComfyUIRepository) => {

        let frame = this.items[index]
        let api = new ComfyUIApi()

        //根据模型选择脚本
        let text = await comyuiRepo.buildReversePrompt()
        let script = new ApiPrompt(text)

        //上传文件，子目录使用当前用户ID
        let locate = { filename: frame.name, type: "input", subfolder: api.clientId };
        await api.upload(locate, await this.absulotePath(frame.path))

        //提交任务
        let { promptId, promptResult } = await api.prompt(script, locate, Image2TextHandle)

        //关键词所在的节点数
        let step = script.getWD14TaggerStep()
        //定位结果
        let reversePrompts = promptResult[promptId]!.outputs![step]!.tags! as string[]
        reversePrompts = reversePrompts.join(",").split(",")

        //存在返回结果，则更新
        if (reversePrompts) {
            //基于敏感词做过滤
            this.items[index].prompt = comyuiRepo.sensitivePromptsFilter(reversePrompts).join(",")
            this.sync()
        }
    }

    //生成图片
    handleGenerateImage = async (index: number, style: string, comyuiRepo: ComfyUIRepository) => {
        let frame = this.items[index]

        let api = new ComfyUIApi()

        //加载脚本
        let text = await comyuiRepo.buildModePrompt(style)
        let script = new ApiPrompt(text)

        let locate: ComfyUIImageLocation;
        //判断流程是否需要上传默认图片
        if (script.hasInputImageStep()) {
            //上传文件，子目录使用当前用户ID
            locate = { filename: frame.name, type: "input", subfolder: api.clientId };
            await api.upload(locate, await this.absulotePath(frame.path))
        }
        //生成图片
        let outputs = await comyuiRepo.generateImage(script, frame.prompt!, undefined, locate!)

        //下载图片
        let downloads = [] as string[]
        for (let i = 0; i < outputs.length; i++) {
            //相对路径
            let savepath = "image-outputs/" + frame.id + "-new-" + uuid() + outputs[i].filename;
            //下载图片并存储
            await api.download(outputs[i], await this.absulotePath(savepath))
            downloads.push(savepath);
        }

        //记录当前图片，和历史图片
        frame.image.path = downloads[0]
        frame.image.history = [...frame.image.history.concat(...downloads)]

        //save
        this.sync()
    }

    //在线生成音频
    handleGenerateAudio = async (index: number, audio: AudioOption) => {
        let api = new BytedanceApi()

        //生成音频
        let item = this.items[index]
        let srtText = item.srt_rewrite! || item.srt!
        let resp = await api.translate(srtText, audio)

        //保存音频
        let audioName = item.id + "-new-" + uuid() + ".mp3"
        let audioPath = await this.saveFile("audio-outputs", audioName, resp.data)

        //记录时长
        this.items[index].srt_rewrite_duration = resp.duration
        this.items[index].srt_rewrite_audio_path = audioPath
        
        this.sync()
        return audioPath
    }

    //本地生成视频
    handleGenerateVideo = async (index: number, settingRepo: JYDraftRepository) => {
        let item = this.items[index]

        //临时存储目录
        let videoDir = await path.join(this.repoDir, "temp-videos")
        await fs.mkdir(videoDir, { recursive: true })

        //参数
        let videoPath = "temp-videos" + path.sep() + item.name + "-" + uuid() + ".mp4";
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
            srt: item.srt_rewrite_audio_path ? (item.srt_rewrite || item.srt) : item.srt,
            duration: item.srt_rewrite_audio_path ? item.srt_rewrite_duration : item.srt_duration,
            image_path: await this.absulotePath(item.image.path ? item.image.path : item.path),
            audio_path: await this.absulotePath(item.srt_rewrite_audio_path ? item.srt_rewrite_audio_path : item.srt_audio_path!),
            video_path: await this.absulotePath(item.srt_rewrite_video_path ? item.srt_rewrite_video_path : item.srt_video_path!),
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
            fragments[i].video_path = await this.absulotePath("temp-videos" + path.sep() + fragments[i].name + ".mp4")
        }

        //生成字幕文件
        let srt_path = await this.absulotePath("video.srt")
        await SRTGenerate(srt_path, fragments)

        //临时存储目录
        let concats_path = await this.absulotePath("video.concats")
        let video_path = await this.absulotePath("output-" + uuid() + ".mp4")
        return await ConcatFragments(concats_path, srt_path, video_path, savePath, fragments)
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
        let { width, height } = await tauri.invoke("measure_image_dimensions", { imagePath: fragments[0].image_path }) as ComfyUIImageDimensions

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


export const useKeyFrameRepository = create<KeyFrameRepository>()(subscribeWithSelector((set, get) => new KeyFrameRepository("frames.json", set, get)))

