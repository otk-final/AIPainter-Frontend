import { subscribeWithSelector } from "zustand/middleware";
import { BaseCRUDRepository } from "./tauri_repository";
import { create } from "zustand";
import { ComfyUIApi, ComfyUIHost, ComfyUIWorkflow } from "./comfyui_api";
import { fs } from "@tauri-apps/api";


let _baseApi: ComfyUIApi | undefined = undefined

//ComfyUI 配置
export class ComfyUIRepository extends BaseCRUDRepository<ComfyUIWorkflow, ComfyUIRepository> {
    repoInitialization(thisData: ComfyUIRepository): void {
        this.host = thisData.host
        this.reverseWF = thisData.reverseWF
        this.positivePrompt = thisData.positivePrompt
        this.negativePrompt = thisData.negativePrompt
        this.items = thisData.items
    }

    repoEmpty(): ComfyUIRepository {
        return this
    }

    host: ComfyUIHost = {
        url: "http://127.0.0.1:8188",
        websocket: "ws://127.0.0.1:8188/ws",
    }
    reverseWF?: ComfyUIWorkflow
    positivePrompt: string = ""
    negativePrompt: string = ""

    newClient() {
        if (_baseApi) {
            return _baseApi
        }

        //缓存链接
        _baseApi = new ComfyUIApi("", this.host)
        return _baseApi
    }

    buildModePrompt = async (mode: string) => {
        let modeApi = this.items.find(item => item.name === mode)
        let wfText = await fs.readTextFile(modeApi!.path)
        return JSON.parse(wfText)
    }

    buildReversePrompt = async () => {
        let wfText = await fs.readTextFile(this.reverseWF!.path)
        return JSON.parse(wfText)
    }
}

export const useComfyUIRepository = create<ComfyUIRepository>()(subscribeWithSelector((set, get) => new ComfyUIRepository("comfyui.json", set, get)))
