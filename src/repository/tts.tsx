import { create } from "zustand"
import { BaseRepository, trimApiHost } from "./tauri_repository"
import { AudioOption, TTSApi } from "./tts_api"
import { subscribeWithSelector } from "zustand/middleware"

let _baseApi: TTSApi | undefined = undefined

export interface TTSConfiguration {
    appId:string
    host: string
    authorization: string

    audio_speed: number,
    audio_volume: number,
    audio_option: AudioOption
}



export class TTSRepository extends BaseRepository<TTSRepository> implements TTSConfiguration {
    free() {

    }
    appId = "9413902475"
    host =  "https://openspeech.bytedance.com"
    authorization =  "9gyYDsIV-NcEcsbsmErHWK39T9Uvb8Bf"

    audio_speed = 1
    audio_volume = 1
    
    audio_option = {
        voice_classify: "3",
        voice_type: "BV437_streaming",
        emotion: "xiasha",
    }

    newClient = async () => {
        //api
        if (!_baseApi) {
            _baseApi = new TTSApi(trimApiHost(this.host), this.appId, this.authorization)
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