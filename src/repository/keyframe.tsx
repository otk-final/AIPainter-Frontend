import { create } from "zustand"
import { BaseCRUDRepository, ItemIdentifiable, delay } from "./tauri_repository"
import { subscribeWithSelector } from "zustand/middleware"
import { fs, path, shell, tauri } from "@tauri-apps/api"
import { Image2TextHandle, Text2ImageHandle, WFScript, registerComfyUIPromptCallback } from "./comfyui_api"
import { ComfyUIRepository } from "./comfyui"
import { SRTLine, formatTime } from "./srt"
import { GPTAssistantsApi } from "./gpt"
import { createWorker } from "tesseract.js"
import { v4 as uuid } from "uuid"
import { AudioOption, TTSApi } from "./tts_api"
import { JYMetaDraftExport, KeyFragment } from "./drafts"

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
}


interface KeyVideoGenerateJob {
    idx: number,
    image_path: string,
    audio_path: string,
    output: string,
}



export class KeyFrameRepository extends BaseCRUDRepository<KeyFrame, KeyFrameRepository> {

    //初始化
    initialization = async (frames: KeyFrame[]) => {
        this.items = [...frames]
        this.sync()
    }

    //字幕导出
    srtExport = async (srtfile: string, fragments: KeyFragment[]) => {
        let srts = []
        for (let i = 0; i < fragments.length; i++) {
            let item = fragments[i]
            let srt = {
                id: srts.length + 1,
                start_time: srts.length === 0 ? 0 : srts[srts.length - 1].end_time,
                end_time: srts.length === 0 ? item.duration : srts[srts.length - 1].start_time + item.duration,
                text: item.srt
            } as SRTLine
            srts.push(srt)
        }
        let strText = srts.map((item, idx) => {
            let line =
                (idx + 1) + "\n"
                + formatTime(item.start_time, ",") + " --> " + formatTime(item.end_time, ",") + "\n"
                + (item.text || '') + "\n"
            return line
        }).join("\n")
        await fs.writeTextFile(srtfile, strText, { append: false })
    }

    //重写台词
    handleRewriteContent = async (index: number, gptApi: GPTAssistantsApi) => {
        let rewrite = await gptApi.rewritePrompt(this.items[index].srt!)
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
    handleReversePrompt = async (index: number, comyuiRepo: ComfyUIRepository) => {
        let frame = this.items[index]
        let api = await comyuiRepo.newClient()
        let text = await comyuiRepo.buildReversePrompt()
        let script = new WFScript(text)

        //上传文件
        await api.upload(api.clientId, await this.absulotePath(frame.path), frame.name)

        //提交任务
        let job = await api.prompt(script, { subfolder: api.clientId, filename: frame.name }, Image2TextHandle)
        //关键词所在的节点数
        let step = script.getWD14TaggerStep()
        const callback = async (promptId: string, respData: any) => {

            //定位结果
            let reversePrompts = respData[promptId]!.outputs![step]!.tags! as string[]
            if (reversePrompts) frame.prompt = reversePrompts.join(",")

            this.sync()
        }
        //监听任务
        registerComfyUIPromptCallback({ jobId: "", promptId: job.prompt_id, handle: callback })
    }

    //生成图片
    handleGenerateImage = async (index: number, style: string, comyuiRepo: ComfyUIRepository) => {
        let frame = this.items[index]

        //comyui api
        let api = await comyuiRepo.newClient()
        let text = await comyuiRepo.buildModePrompt(style)
        let script = new WFScript(text)

        //add prompt task
        let job = await api.prompt(script, { positive: frame.prompt || comyuiRepo.positivePrompt, negative: comyuiRepo.negativePrompt || "" }, Text2ImageHandle)

        //获取 当前流程中 输出图片节点位置
        let step = script.getOutputImageStep()
        const callback = async (promptId: string, respData: any) => {

            //下载文件
            let images = respData[promptId]!.outputs![step].images
            for (let i = 0; i < images.length; i++) {
                let imageItem = images[i] as { filename: string, subfolder: string, type: string }

                //保存
                let fileBuffer = await api.download(promptId, imageItem.subfolder, imageItem.filename)
                let fileName = frame.id + "-" + uuid() + ".png"
                let filePath = await this.saveFile("outputs", fileName, fileBuffer)

                frame.image.path = filePath
                frame.image.history.push(filePath)
            }

            //save
            this.sync()
        }

        //监听任务
        registerComfyUIPromptCallback({ jobId: "", promptId: job.prompt_id, handle: callback })
    }

    //在线生成音频
    handleGenerateAudio = async (index: number, audio: AudioOption, api: TTSApi) => {

        let item = this.items[index]
        //生成音频
        let resp = await api.translate(item.srt_rewrite!, audio)

        //音频路径
        let audioName = item.id + "-new-" + uuid() + ".mp3"
        let audioPath = await this.saveFile("audios", audioName, resp.data)

        //记录时长
        this.items[index].srt_rewrite_duration = resp.duration
        this.items[index].srt_rewrite_audio_path = audioPath

        this.sync()
        return audioPath
    }

    //本地生成视频
    handleGenerateVideo = async (index: number) => {
        let item = this.items[index]

        //临时存储目录
        let videoDir = await path.join(this.repoDir, "videos")
        await fs.createDir(videoDir, { dir: this.baseDir(), recursive: true })

        //视频路径
        let videoPath = "videos" + path.sep + item.id + "-new-" + uuid() + ".mp4"
        let assetPath = await this.absulotePath(videoPath)

        //字幕文件，音频 合成视频
        let cmd = shell.Command.sidecar("bin/ffmpeg", [
            "-loop", "1",
            "-i", await this.absulotePath(item.image.path!),              //图片
            "-i", await this.absulotePath(item.srt_rewrite_audio_path!),  //音频
            "-c:v", 'libx264',
            "-tune", "stillimage",
            "-vf", 'format=yuv420p',      //兼容大部分播放器
            "-r", "5",                    //默认1秒5帧
            "-shortest",
            assetPath                       //视频
        ])

        let output = await cmd.execute()
        console.info(output.stderr)
        console.info(output.stdout)


        this.items[index].srt_rewrite_video_path = videoPath
        this.sync()

        return videoPath
    }

    //过滤有效片段
    filterValidFragments = async () => {
        
        let fragments = [] as KeyFragment[]
        for (let i = 0; i < this.items.length; i++) {
            let item = this.items[i]
            let fragment =  {
                id: item.id,
                name: item.name,
                //有效取生成的
                srt: item.srt_rewrite_audio_path ? item.srt_rewrite : item.srt,
                duration: item.srt_rewrite_audio_path ? item.srt_rewrite_duration : item.srt_duration,
                image_path: await this.absulotePath(item.image.path ? item.image.path : item.path),
                audio_path: await this.absulotePath(item.srt_rewrite_audio_path ? item.srt_rewrite_audio_path : item.srt_audio_path!),
                video_path: await this.absulotePath(item.srt_rewrite_video_path ? item.srt_rewrite_video_path : item.srt_video_path!)
            } as KeyFragment
            fragments.push(fragment)
        }
        return fragments
    }

    //合并导出视频
    handleConcatVideo = async (savePath: string) => {

        //有效片段
        let fragments = await this.filterValidFragments()

        //生成字幕文件
        let srt_path = await this.absulotePath("video.srt")
        await this.srtExport(srt_path, fragments)

        //临时存储目录
        let videoDir = await path.join(this.repoDir, "temp-videos")
        await fs.createDir(videoDir, { dir: this.baseDir(), recursive: true })

        //根据当前音频+图片，生成视频
        let jobs = [] as KeyVideoGenerateJob[]
        for (let i = 0; i < fragments.length; i++) {
            let item = fragments[i];
            let arg = {
                idx: i,
                image_path: item.image_path,
                audio_path: item.audio_path,
                output: await this.absulotePath("temp-videos" + path.sep + item.id + ".mp4")
            } as KeyVideoGenerateJob
            jobs.push(arg)
        }

        //批量生产原始视频片段
        let results: KeyVideoGenerateJob[] = await tauri.invoke("key_video_generate", { parameters: jobs })

        //生成拼接文件
        let concats_path = await this.absulotePath("video.concats")
        let concats_content: string[] = results.map(i => "file " + "'" + i.output + "'")
        await fs.writeTextFile(concats_path, concats_content.join("\n"), { append: false })

        let tempVideoPath = await this.absulotePath("output-" + uuid() + ".mp4")
        //1合成视频
        let cmd = shell.Command.sidecar("bin/ffmpeg", [
            "-y",
            "-f", "concat",
            "-safe", "0",
            "-i", concats_path,     //目标视频
            "-c", "copy",
            tempVideoPath           //视频
        ])
        let output = await cmd.execute()
        console.info(output.stderr)
        console.info(output.stdout)

        await delay(2000)

        //2导入字幕 
        cmd = shell.Command.sidecar("bin/ffmpeg", [
            "-y",
            "-i", tempVideoPath,    //目标视频
            "-i", srt_path,         //目标字幕
            "-c", "copy",
            "-c:s", "mov_text",
            "-metadata:s:s:0",
            "language=chi_eng",
            savePath                //视频
        ])
        output = await cmd.execute()
        console.info(output.stderr)
        console.info(output.stdout)
        return savePath
    }

    //导出剪映草稿
    handleConcatJYDraft = async (saveDir: string) => {
        let draft_name = await path.basename(saveDir)
        console.info("draft_name", draft_name)

        //有效帧片段
        let fragments = await this.filterValidFragments()

        //生成字幕文件
        let srtpath = await this.absulotePath("video.srt")
        await this.srtExport(srtpath, fragments)

        //导出
        await JYMetaDraftExport(saveDir, fragments, srtpath)
    }
}

export const useKeyFrameRepository = create<KeyFrameRepository>()(subscribeWithSelector((set, get) => new KeyFrameRepository("frames.json", set, get)))

