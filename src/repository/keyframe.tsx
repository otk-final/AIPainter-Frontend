import { create } from "zustand"
import { BaseCRUDRepository, ItemIdentifiable } from "./tauri_repository"
import { subscribeWithSelector } from "zustand/middleware"
import { fs } from "@tauri-apps/api"
import { Image2TextHandle, Text2ImageHandle, WFScript, registerComfyUIPromptCallback } from "./comfyui_api"
import { ComfyUIRepository } from "./comfyui"
import { SRTLine, formatTime } from "./srt"
import { GPTAssistantsApi } from "./gpt"
import { createWorker } from "tesseract.js"
import { v4 as uuid } from "uuid"

export interface KeyFrame extends ItemIdentifiable {
    id: number
    name: string,
    path: string,
    prompt?: string,
    image: {
        path?: string
        history: string[]
    }
    //字幕信息
    srt?: string
    srt_duration?: {
        start_time: number
        end_time: number
    }
    srt_rewrite?: string
    srt_audio?: string
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

    exportSRTFile = async (srtfile: string) => {
        let strText = this.items.map((item, idx) => {
            let line =
                (idx + 1) + "\n"
                + formatTime(item.srt_duration!.start_time) + " --> " + formatTime(item.srt_duration!.end_time) + "\n"
                + (item.srt_rewrite || '') + "\n"
            return line
        }).join("\n")

        await fs.writeTextFile(srtfile, strText, { append: true })
    }

    exportAudioZip = async (zipfile: string) => {
        console.info(zipfile)
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

        let imageBytes = await fs.readBinaryFile(targetPath)


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
        console.log(ret.data);
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
        await api.upload(api.clientId, frame.path, frame.name)

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
                let filePath = await this.saveFile("outputs", "kf_" + uuid() + ".png", fileBuffer)

                frame.image.path = filePath
                frame.image.history.push(filePath)
            }

            //save
            this.sync()
        }

        //监听任务
        registerComfyUIPromptCallback({ jobId: "", promptId: job.prompt_id, handle: callback })
    }

    handleGenerateAudio = async (index: number, voiceType: string, gtpApi: GPTAssistantsApi) => {

        //生成
        let buffer = await gtpApi.textToAudio(this.items[index].srt_rewrite!, voiceType)

        //保存
        let audioPath = await this.saveFile("audio", "ad_" + uuid() + ".mp3", buffer)

        this.items[index].srt_audio = audioPath
        this.sync()
    }
}

export const useKeyFrameRepository = create<KeyFrameRepository>()(subscribeWithSelector((set, get) => new KeyFrameRepository("frames.json", set, get)))

