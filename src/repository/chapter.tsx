import { subscribeWithSelector } from "zustand/middleware"
import { BaseCRUDRepository, ItemIdentifiable } from "./tauri_repository"
import { create } from "zustand"

import * as path from "@tauri-apps/api/path";
import * as tauri from "@tauri-apps/api/core";
import * as fs from "@tauri-apps/plugin-fs";

import { ComfyUIRepository, KeyImage } from "./comfyui"
import { v4 as uuid } from "uuid"
import { AudioOption, BytedanceApi } from "../api/bytedance_api"
import { JYDraftRepository } from "./draft"
import { JYDraftExport, KeyFragment, KeyFragmentEffect } from "./draft_utils"
import { Project } from "./workspace"
import { GPTAssistantsApi } from "@/api/gpt_api";
import { BaiduApi } from "@/api/baidu_api";
import { ActorRepository } from "./actor";
import { ApiPrompt, ComfyUIApi, ComfyUIImageDimensions } from "@/api/comfyui_api";
import { SRTGenerate } from "./srt";
import { ConcatFragments } from "./video";


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
    handleResolveChapter = async (index: number) => {
        let chapter = this.items[index];
        let api = new GPTAssistantsApi()
        let scene = await api.chapterBoarding(chapter.draft)
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
    handleTranslatePrompt = async (index: number) => {
        let api = new BaiduApi()
        //翻译
        let enResp = await api.translate(this.items[index].scene)
        this.items[index].prompt = enResp.result.trans_result.map(i => i.dst).join(",")

        this.sync()
    }


    //批量图片放大
    batchScaleImage = async (start_idx: number, comyuiRepo: ComfyUIRepository) => {
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
        let results = await comyuiRepo.scaleImage(scaleArray);

        //替换数据
        for (let i = 0; i < results.length; i++) {
            this.items[i].image.path = results[i].output_name
        }

        //更新
        await this.sync()
    }

    //单张图片放大
    handleScaleImage = async (index: number, comyuiRepo: ComfyUIRepository) => {
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

        let results = await comyuiRepo.scaleImage([arg]);
        this.items[index].image.path = results[0].output_name

        this.sync()
    }



    //生成图片
    handleGenerateImage = async (index: number, style: string, project: Project, comyuiRepo: ComfyUIRepository, actorRepo: ActorRepository) => {
        let api = new ComfyUIApi(uuid())



        //获取所有 角色关键词 + 场景关键词
        let chapter = this.items[index]
        let actor_prompt = actorRepo.toPrompt(chapter.actors)
        let prompt = [actor_prompt, chapter.prompt].join(",")

        //加载脚本
        let text = await comyuiRepo.imagePrompt(style)
        let script = new ApiPrompt(text)

        //生成图片
        let outputs = await comyuiRepo.submitImageGeneratePrompt(api, script, prompt, undefined, undefined)

        //下载图片
        let downloads = [] as string[]
        for (let i = 0; i < outputs.length; i++) {
            //相对路径
            let savepath = "image-outputs/" + chapter.id + "-new-" + uuid() + outputs[i].filename;
            //下载图片并存储
            await api.download(outputs[i], await this.absulotePath(savepath))
            downloads.push(savepath);
        }

        //记录当前图片，和历史图片
        chapter.image.path = downloads[0]
        chapter.image.history = [...chapter.image.history.concat(...downloads)]

        //save
        this.sync()
    }

    handleGenerateAudio = async (index: number, audio: AudioOption, actorRepo: ActorRepository) => {
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
        let api = new BytedanceApi()
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
        await fs.mkdir(videoDir, { recursive: true })

        //参数
        let videoPath = "temp-videos" + path.sep() + index + "-" + uuid() + ".mp4";
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

export const useChapterRepository = create<ChapterRepository>()(subscribeWithSelector((set, get) => new ChapterRepository("chapters.json", set, get)))