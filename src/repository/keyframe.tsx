import { create } from "zustand"
import { BaseCRUDRepository, ItemIdentifiable, delay } from "./tauri_repository"
import { subscribeWithSelector } from "zustand/middleware"
import { fs, path, shell } from "@tauri-apps/api"
import { Image2TextHandle, Text2ImageHandle, WFScript, registerComfyUIPromptCallback } from "./comfyui_api"
import { ComfyUIRepository } from "./comfyui"
import { SRTLine, formatTime } from "./srt"
import { GPTAssistantsApi } from "./gpt"
import { createWorker } from "tesseract.js"
import { v4 as uuid } from "uuid"
import { AudioOption, TTSApi } from "./tts_api"

export interface KeyFrame extends ItemIdentifiable {
    id: number
    name: string,
    path: string,
    prompt?: string,
    image: {
        path?: string
        history: string[]
    }
    //原字幕信息
    srt?: string
    srt_duration?: {
        start_time: number
        end_time: number
    }

    //字幕改写信息
    srt_rewrite?: string
    srt_rewrite_duration?: {
        start_time: number
        end_time: number
    }
    srt_rewrite_audio_path?: string
    srt_rewrite_audio_duration?: number

    //生成视频
    video_path?: string
}




export class KeyFrameRepository extends BaseCRUDRepository<KeyFrame, KeyFrameRepository> {

    //初始化
    initialization = async (frames: KeyFrame[]) => {
        this.items = [...frames]
        this.sync()
    }

    //srt字幕对齐
    srtAlignment = async (srtLines: SRTLine[]) => {
        let lines = [...srtLines]

        this.items.forEach((k) => {
            let millisecond = k.id * 1000
            //根据当前镜头所在的秒，截取字幕
            let srts = [] as SRTLine[]
            for (let i = 0; i < lines.length; i++) {
                if (lines[i].end_time > millisecond) {
                    lines = lines.splice(i)
                    break
                }
                srts.push(lines[i])
            }
            //合并字幕，并统计时间
            if (srts && srts.length > 0) {
                k.srt = srts.map(line => line.text).join(",")
                k.srt_duration = { start_time: srts[0].start_time, end_time: srts[srts.length - 1].end_time }
            }
        })
        await this.sync()
    }

    srtExport = async (srtfile: string) => {
        let lines = this.items.map((item, idx) => {
            return {
                id: idx + 1,
                start_time: item.srt_duration?.start_time,
                end_time: item.srt_duration?.end_time,
                text: item.srt_rewrite || item.srt || ''
            } as SRTLine
        })
        await this.srtToFile(lines, srtfile)
    }

    srtToFile = async (lines: SRTLine[], srtfile: string) => {
        let strText = lines.map((item, idx) => {
            let line =
                (idx + 1) + "\n"
                + formatTime(item.start_time, ",") + " --> " + formatTime(item.end_time, ",") + "\n"
                + (item.text || '') + "\n"
            return line
        }).join("\n")
        await fs.writeTextFile(srtfile, strText, { append: false })
    }


    //重写台词
    aiRewriteContent = async (index: number, gptApi: GPTAssistantsApi) => {
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

    batchRewriteContent = async () => {

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

    handleGenerateAudio = async (index: number, audio: AudioOption, api: TTSApi) => {

        let item = this.items[index]
        //生成音频
        let resp = await api.translate(item.srt_rewrite!, audio)

        //保存文件
        let audioName = item.id + "-" + uuid() + ".mp3"
        let audioPath = await this.saveFile("audio", audioName, resp.data)

        this.items[index].srt_rewrite_audio_duration = resp.duration
        this.items[index].srt_rewrite_audio_path = audioPath

        this.sync()
        return audioPath
    }

    handleGenerateVideo = async (index: number) => {
        let item = this.items[index]

        //临时存储目录
        let videoDir = await path.join(this.repoDir, "videos")
        await fs.createDir(videoDir, { dir: this.baseDir(), recursive: true })

        //视频路径
        let videoPath = "videos/" + item.id + "-" + uuid() + ".mp4"
        let assetPath = await this.absulotePath(videoPath)

        //字幕文件，音频 合成视频
        let cmd = shell.Command.sidecar("bin/ffmpeg", [
            "-loop", "1",
            "-i", await this.absulotePath(item.image.path!),         //图片
            "-i", await this.absulotePath(item.srt_rewrite_audio_path!),  //音频
            "-c:v", 'libx264',
            "-tune", "stillimage",
            "-vf", 'format=yuv420p',      //兼容大部分播放器
            "-r", "5",                      //默认1秒5帧
            "-shortest",
            assetPath                       //视频
        ])

        let output = await cmd.execute()
        console.info(output.stderr)
        console.info(output.stdout)


        this.items[index].video_path = videoPath
        this.sync()
        return videoPath
    }

    handleConcatVideo = async (savePath: string) => {
        //选择已经生成视频的item

        let srtLines = [] as SRTLine[]
        let concats = [] as string[]

        let validItems = this.items.filter(item => item.video_path)
        for (let i = 0; i < validItems.length; i++) {
            let item = validItems[i]

            //获取上一个字幕时间
            let last = srtLines.length > 0 ? srtLines[srtLines.length - 1] : { id: 0, start_time: 0, end_time: 0 }
            srtLines.push({
                id: i + 1,
                start_time: last.end_time,
                end_time: Number(last.end_time) + Number(item.srt_rewrite_audio_duration!),
                text: item.srt_rewrite!
            })
            let vp = await this.absulotePath(item.video_path!)
            let vpText = "file " + "'" + vp + "'"
            concats.push(vpText)
        }
        if (concats.length === 0) {
            throw new Error("无有效视频")
        }

        //生成字幕文件
        let srtPath = await this.absulotePath("video.srt")
        await this.srtToFile(srtLines, srtPath)

        //生成合并文件
        let concatsPath = await this.absulotePath("video.concats")
        await fs.writeTextFile(concatsPath, concats.join("\n"), { append: false })


        let tempVideoPath = await this.absulotePath("video-" + uuid() + ".mp4")
        //1合成视频
        let cmd = shell.Command.sidecar("bin/ffmpeg", [
            "-f", "concat",
            "-safe", "0",
            "-i", concatsPath,      //目标视频
            "-c", "copy",
            tempVideoPath           //视频
        ])
        let output = await cmd.execute()
        console.info(output.stderr)
        console.info(output.stdout)

        await delay(2000)
        
        //2导入字幕 
        cmd = shell.Command.sidecar("bin/ffmpeg", [
            "-i", tempVideoPath,    //目标视频
            "-i", srtPath,          //目标字幕
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
    handleConcatJYDraft = async (saveDir:string)=>{
        let draft_name = await path.basename(saveDir)
        console.info("draft_name", draft_name)


        //将每个关键帧生成音频，视频，字幕



        
        //素材模版
        let meta_template_path = await path.resolveResource("resources/jy_drafts/draft_meta_info.json")
        let meta_template = JSON.parse(await fs.readTextFile(meta_template_path))
        console.info(meta_template)
        




        //内容模版
        let content_template_path = await path.resolveResource("resources/jy_drafts/draft_content.json")
        let content_template = JSON.parse(await fs.readTextFile(content_template_path))
        console.info(content_template)
    }
}

export const useKeyFrameRepository = create<KeyFrameRepository>()(subscribeWithSelector((set, get) => new KeyFrameRepository("frames.json", set, get)))

