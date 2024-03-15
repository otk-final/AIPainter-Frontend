import { subscribeWithSelector } from "zustand/middleware";
import { BaseRepository } from "./tauri_repository";
import { create } from "zustand";
import { ApiPrompt, ComfyUIApi, ComfyUIImageDimensions, ComfyUIImageLocation, ComfyUIWorkflow, Text2ImageHandle, Text2ImageParams } from "../api/comfyui_api";
import { readTextFile } from "@tauri-apps/plugin-fs";
import { invoke } from "@tauri-apps/api/core";

export interface KeyImage {
    id: number,
    scale: number,
    image_path: string,
    output_name: string,
    output_path: string,
}

export interface ComfyUIConfiguration {
    //反推流程
    reverse?: ComfyUIWorkflow
    //生成流程
    generates: ComfyUIWorkflow[]

    positivePrompt: string
    negativePrompt: string
    sensitivePrompt: string
}


//ComfyUI 配置
export class ComfyUIRepository extends BaseRepository<ComfyUIRepository> implements ComfyUIConfiguration {

    free(): void {

    }

    reverse?: ComfyUIWorkflow
    generates = [] as ComfyUIWorkflow[]
    positivePrompt = ""
    negativePrompt = ""
    sensitivePrompt = ""

    buildModePrompt = async (mode: string) => {
        let modeApi = this.generates.find(item => item.name === mode)
        if (!modeApi) {
            throw new Error("not found image generate script")
        }
        let wfText = await readTextFile(modeApi.path)
        return JSON.parse(wfText)
    }

    buildReversePrompt = async () => {
        if (!this.reverse) {
            throw new Error("not found image reverse script")
        }

        let wfText = await readTextFile(this.reverse.path)
        return JSON.parse(wfText)
    }

    sensitivePromptsFilter = (prompts: string[]) => {
        if (!this.sensitivePrompt) {
            return prompts
        }
        let invalids = this.sensitivePrompt.split("#")
        invalids = invalids.map(x => x.trim())
        return prompts.filter(i => !invalids.includes(i.trim()))
    }

    sensitivePromptTextFilter = (prompts: string) => {
        if (!this.sensitivePrompt) {
            return prompts
        }
        return this.sensitivePromptsFilter(prompts.split(",")).join(",")
    }

    //生成图片
    generateImage = async (api: ComfyUIApi, script: ApiPrompt, prompt: string, dimensions?: ComfyUIImageDimensions, location?: ComfyUIImageLocation) => {

        //对输入提示词做敏感词过滤
        let inputPrompt = this.sensitivePromptTextFilter(prompt)
        //生成随机值
        let seed: number = await invoke('seed_random_handler', {})

        let parms = {
            seed: seed,
            positive: [this.positivePrompt, inputPrompt].join(""),
            negative: this.negativePrompt || "",
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

    //放大图片
    scaleImage = async (images: KeyImage[]) => {
        return await invoke('key_image_scale_handler', { parameters: images }) as KeyImage[]
    }

}

export const useComfyUIRepository = create<ComfyUIRepository>()(subscribeWithSelector((set, get) => new ComfyUIRepository("comfyui.json", set, get)))