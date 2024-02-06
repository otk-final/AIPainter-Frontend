import { subscribeWithSelector } from "zustand/middleware";
import { BaseCRUDRepository } from "./tauri_repository";
import { create } from "zustand";
import { ComfyUIApi, ComfyUIHost, ComfyUIPipe, ComfyUIWorkflow } from "./comfyui_api";
import { fs } from "@tauri-apps/api";
import { v4 as uuid } from "uuid"

let _baseApi: ComfyUIApi | undefined = undefined
let _basePipe: ComfyUIPipe | undefined = undefined

export interface ComfyUIConfiguration {
    host: ComfyUIHost
    reverseWF?: ComfyUIWorkflow
    items: ComfyUIWorkflow[]
    positivePrompt: string
    negativePrompt: string
}




//ComfyUI 配置
export class ComfyUIRepository extends BaseCRUDRepository<ComfyUIWorkflow, ComfyUIRepository> implements ComfyUIConfiguration {

    free() {

    }
    host: ComfyUIHost = {
        url: "http://127.0.0.1:8188",
        websocket: "ws://127.0.0.1:8188/ws",
    }
    reverseWF?: ComfyUIWorkflow
    positivePrompt: string = ""
    negativePrompt: string = ""


    newClient = async () => {
        this.destroyClient()
        
        let newClientId = "test"
        let authorization = "test"
        //api
        if (!_baseApi) {
            _baseApi = new ComfyUIApi(this.host, newClientId, authorization)
        }
        await _baseApi.connect()

        //pipe
        if (!_basePipe) {
            _basePipe = new ComfyUIPipe(_baseApi)
        }
        await _basePipe.connect(this.host, newClientId, authorization)

        return _baseApi
    }

    destroyClient = () => {
        if (_baseApi) {
            _baseApi.disconnect()
        }
        if (_basePipe) {
            _basePipe.disconnect()
        }
        _baseApi = undefined
        _basePipe = undefined
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
