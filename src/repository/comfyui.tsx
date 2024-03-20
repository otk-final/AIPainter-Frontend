import { subscribeWithSelector } from "zustand/middleware";
import { BaseRepository } from "./tauri_repository";
import { create } from "zustand";
import { ApiPrompt, ComfyUIApi, ComfyUIImageDimensions, ComfyUIImageLocation, Image2TextHandle, Text2ImageHandle, Text2ImageParams } from "../api/comfyui_api";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { invoke } from "@tauri-apps/api/core";
import { ApiResult, ClientAuthenticationStore, DefaultClient } from "@/api";
import { v4 as uuid } from "uuid";

export interface KeyImage {
    id: number,
    scale: number,
    image_path: string,
    output_name: string,
    output_path: string,
}

export interface ComfyUIFile {
    name: string
    path: string
    url: string
    content: string
}

export interface ComfyUIConfiguration {
    //反推流程
    reverse?: ComfyUIFile
    //生成流程
    prompts: ComfyUIFile[]

    positive?: ComfyUIFile

    negative?: ComfyUIFile

    sensitive?: ComfyUIFile
}

//ComfyUI 配置
export class ComfyUIRepository extends BaseRepository<ComfyUIRepository> implements ComfyUIConfiguration {

    free(): void {

    }

    reverse?: ComfyUIFile
    prompts = [] as ComfyUIFile[]
    positive: ComfyUIFile = { name: "", path: "", url: "", content: "" }
    negative: ComfyUIFile = { name: "", path: "", url: "", content: "" }
    sensitive: ComfyUIFile = { name: "", path: "", url: "", content: "" }

    imagePrompt = async (mode: string) => {
        let modeApi = this.prompts.find(item => item.name === mode)
        if (!modeApi) {
            throw new Error("not found image generate script")
        }
        let wfText = await readTextFile(modeApi.path)
        return JSON.parse(wfText)
    }

    reversePrompt = async () => {
        if (!this.reverse) {
            throw new Error("not found image reverse script")
        }
        let wfText = await readTextFile(this.reverse.path)
        return JSON.parse(wfText)
    }

    sensitivePromptsFilter = (prompts: string[]) => {
        let sensitiveText = this.sensitive.content
        if (!sensitiveText) {
            return prompts
        }
        let invalids = sensitiveText.split(",")
        invalids = invalids.map(x => x.trim())
        return prompts.filter(i => !invalids.includes(i.trim()))
    }

    sensitivePromptTextFilter = (prompts: string) => {
        let sensitive = this.sensitive.content
        if (sensitive) {
            return prompts
        }
        return this.sensitivePromptsFilter(prompts.split(",")).join(",")
    }

    //生成图片
    submitImageGeneratePrompt = async (api: ComfyUIApi, script: ApiPrompt, prompt: string, dimensions?: ComfyUIImageDimensions, location?: ComfyUIImageLocation) => {

        //对输入提示词做敏感词过滤
        let inputPrompt = this.sensitivePromptTextFilter(prompt)
        //生成随机值
        let seed: number = await invoke('seed_random_handler', {})

        let parms = {
            seed: seed,
            positive: [this.positive.content, inputPrompt].join(""),
            negative: this.negative.content,
            image_dimensions: dimensions,
            image_location: location,
        } as Text2ImageParams

        //add prompt task
        let { promptId, promptResult } = await api.prompt(script, parms, Text2ImageHandle)

        //获取 当前流程中 输出图片节点位置
        let step = script.getOutputImageStep()

        //返回文件路径
        return promptResult[promptId]!.outputs![step].images as ComfyUIImageLocation[]
    }

    submitImageReversePrompt = async (api: ComfyUIApi, locate: ComfyUIImageLocation) => {
        //根据模型选择脚本
        let text = await this.reversePrompt()
        let script = new ApiPrompt(text)

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
            return this.sensitivePromptsFilter(reversePrompts).join(",")
        }
        throw new Error("图片无法反推")
    }

    //放大图片
    scaleImage = async (images: KeyImage[]) => {
        return await invoke('key_image_scale_handler', { parameters: images }) as KeyImage[]
    }

    //下载文件
    private invoke_download = async (traceId: string, url: string, filepath: string) => {
        let { header } = ClientAuthenticationStore.getState()
        let resp = await invoke('http_download_handler', {
            client: {
                method: "GET",
                url: url,
                headers: { ...header, "x-trace-id": traceId },
            },
            filePath: filepath
        }).catch(err => {
            throw new Error(err)
        })
        return resp as string
    }


    //下载文件
    download = async () => {

        //查询文件地址
        let apiResult: ApiResult<ComfyUIConfiguration> = await DefaultClient.get("/pb/comfyui/files")
        if (!apiResult) {
            return
        }
        console.info("待下载配置文件", apiResult)

        //下载文件 统一存储到env/comfyui目录
        let cfg = apiResult.data
        let traceId = uuid()
        if (cfg.negative) {
            let np = await this.absulotePath("comfyui_negative.txt")
            try {
                await this.invoke_download(traceId, cfg.negative.url, np)
                this.negative = { ...cfg.negative, path: np, content: await readTextFile(np) }
            } catch (e) {
                console.error(e)
            }
        }
        if (cfg.positive) {
            let pp = await this.absulotePath("comfyui_positive.txt")
            try {
                await this.invoke_download(traceId, cfg.positive.url, pp)
                this.positive = { ...cfg.positive, path: pp, content: await readTextFile(pp) }
            } catch (e) {
                console.error(e)
            }
        }
        if (cfg.sensitive) {
            let sp = await this.absulotePath("comfyui_sensitive.txt")
            try{
                await this.invoke_download(traceId, cfg.sensitive.url, sp)
                this.sensitive = { ...cfg.sensitive, path: sp, content: await readTextFile(sp) }
            }catch(e){
                console.error(e)
            }
        }

        if (cfg.reverse) {
            //下载文件，替换本地路径
            let reversePath = await this.absulotePath("comfyui_reverse.json")
            try{
                await this.invoke_download(traceId, cfg.reverse.url, reversePath)
                this.reverse = { ...cfg.reverse, path: reversePath, content: "" }
            }catch(e){
                console.error(e)
            }
        }

        let prompts = [] as ComfyUIFile[]
        for (let i = 0; i < cfg.prompts.length; i++) {
            let prompt = cfg.prompts[i]
            //下载文件，替换本地路径
            let promptPath = await this.absulotePath("comfyui_prompt_" + i + ".json")
            try{
                await this.invoke_download(traceId, prompt.url, promptPath)
                prompts.push({ ...prompt, path: promptPath, content: "" })
            }catch(e){
                console.error(e)
            }
        }
        this.prompts = [...prompts]

        //保存
        this.sync()
    }
}

export const useComfyUIRepository = create<ComfyUIRepository>()(subscribeWithSelector((set, get) => new ComfyUIRepository("comfyui.json", set, get)))