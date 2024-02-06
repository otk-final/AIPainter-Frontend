import { create } from "zustand"
import { BaseRepository } from "./tauri_repository"
import { TTSApi } from "./tts_api"
import { subscribeWithSelector } from "zustand/middleware"

let _baseApi: TTSApi | undefined = undefined

export interface TTSConfiguration {
    appId:string
    host: string
    authorization: string
}



export class TTSRepository extends BaseRepository<TTSRepository> implements TTSConfiguration {
    free() {

    }
    appId = "9413902475"
    host =  "https://openspeech.bytedance.com"
    authorization =  "Bearer;9gyYDsIV-NcEcsbsmErHWK39T9Uvb8Bf"

    newClient = async () => {
        //api
        if (!_baseApi) {
            _baseApi = new TTSApi(this.host, this.appId, this.authorization)
        }
        await _baseApi.connect()
        return _baseApi
    }


    destroyClient = () => {
        if (_baseApi) {
            _baseApi.disconnect()
        }
        _baseApi = undefined
    }
}

export const useTTSRepository = create<TTSRepository>()(subscribeWithSelector((set, get) => new TTSRepository("tts.json", set, get)))