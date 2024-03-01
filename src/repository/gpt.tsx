import { create } from "zustand"
import { BaseRepository } from "./tauri_repository"
import { subscribeWithSelector } from "zustand/middleware"
import { GPTAssistantsApi } from "./gpt_api"

let _baseApi: GPTAssistantsApi | undefined = undefined

export interface GPTConfiguration {
    assistantId: string
    host: string
    mode: string,
    apiKey: string
}


export class GPTRepository extends BaseRepository<GPTRepository> implements GPTConfiguration {
    free() {

    }

    host = "https://wx.yryz3.com/aipainter-openai/v1"
    apiKey = "none"
    mode = "gpt-4-1106-preview"
    assistantId = "asst_iVUdB5cY5Y4yIq6uW5xdNEdM"

    newClient = async () => {
        //api
        if (!_baseApi) {
            _baseApi = new GPTAssistantsApi(this.host, this.apiKey)
        }
        return _baseApi
    }

    destroyClient = () => {
        _baseApi = undefined
    }
}

export const useGPTRepository = create<GPTRepository>()(subscribeWithSelector((set, get) => new GPTRepository("gpt.json", set, get)))