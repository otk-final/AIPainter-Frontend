import { create } from "zustand"
import { BaseCRUDRepository, ItemIdentifiable } from "./tauri_repository"
import { subscribeWithSelector } from "zustand/middleware"
import { tauri } from "@tauri-apps/api"
import { Image2TextHandle, Text2ImageHandle, WFScript, registerComfyUIPromptCallback } from "./comfyui_api"
import { ComfyUIRepository } from "./comfyui"
import { SRTLine, srtToLines } from "./srt"
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
        start: string
        end: string
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

    //合并srt字幕文件
    mergeSRTFile = async (srtfile: string) => {
        let srtContent = await srtToLines(srtfile)
        this.items.forEach((k) => {
            let sec = k.id
            debugger
            //根据当前镜头所在的秒，截取字幕
            let srts = [] as SRTLine[]
            for (let i = 0; i < srtContent.length; i++) {
                if (srtContent[i].endTime.second > sec) {
                    srtContent = srtContent.splice(i)
                    break
                }
                srts.push(srtContent[i])
            }

            //合并字幕，并统计时间
            if (srts && srts.length > 0) {
                k.srt = srts.map(line => line.content).join(",")
                k.srt_duration = { start: srts[0].startTime.text, end: srts[srts.length - 1].endTime.text }
            }
        })
        await this.sync()
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
        const ret = await worker.recognize(tauri.convertFileSrc(targetPath))
        console.log(ret.data);
        this.items[index].srt = ret.data.text

        await this.sync()
        await worker.terminate();
    }

    batchRewriteContent = async () => {

    }

    //反推关键词
    handleReversePrompt = async (index: number, comyuiRepo: ComfyUIRepository) => {
        let frame = this.items[index]

        let api = comyuiRepo.newClient()
        let text = await comyuiRepo.buildReversePrompt()
        let script = new WFScript(text)

        //上传文件
        await api.upload("hxy", frame.path, frame.name)

        //提交任务
        let job = await api.prompt(script, { subfolder: "hxy", filename: frame.name }, Image2TextHandle)
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
        let api = comyuiRepo.newClient()
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
                let fileBuffer = await api.download(imageItem.subfolder, imageItem.filename)
                let filePath = await this.saveImage("outputs", "kf_" + uuid() + ".png", fileBuffer)

                frame.image.path = filePath
                frame.image.history.push(filePath)
            }

            //save
            this.sync()
        }

        //监听任务
        registerComfyUIPromptCallback({ jobId: "", promptId: job.prompt_id, handle: callback })
    }
}

export const useKeyFrameRepository = create<KeyFrameRepository>()(subscribeWithSelector((set, get) => new KeyFrameRepository("frames.json", set, get)))

