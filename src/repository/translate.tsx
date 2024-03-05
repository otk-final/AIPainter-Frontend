import { create } from "zustand"
import { BaseRepository, trimApiHost } from "./tauri_repository"
import { subscribeWithSelector } from "zustand/middleware"
import { TokenResult, TranslateApi } from "./translate_api"

let _baseApi: TranslateApi | undefined = undefined

export interface TranslateConfiguration {
    host: string
    auth?: TokenResult
    auth_expired_time: number
    client_id: string,
    client_secret: string
}




//每天毫秒数
let dayMills = 24 * 60 * 60 * 1000

export class TranslateRepository extends BaseRepository<TranslateRepository> implements TranslateConfiguration {
    free() {

    }
    auth_token?: TokenResult
    auth_expired_time = -1

    host = "https://aip.baidubce.com"
    client_id = "j5YmC3RxnEay92YGDzKfepP8"
    client_secret = "IlRssYk8nswWfRE3Yy81GqPsZKmLkdAv"

    newClient = async () => {

        let now_time = new Date().getTime()
        debugger
        //不存在，或者提前1天获取最新的token
        if (!this.auth_token || now_time > (this.auth_expired_time - dayMills)) {
            //获取access_token
            let tempApi = new TranslateApi(trimApiHost(this.host), "")
            await tempApi.connect()

            this.auth_token = await tempApi!.token(this)
            this.auth_expired_time = now_time + this.auth_token.expires_in * 1000

            //保存
            this.sync()

            await tempApi.disconnect()
        }


        //api
        if (!_baseApi) {
            //获取token
            _baseApi = new TranslateApi(trimApiHost(this.host), this.auth_token!.access_token)
            await _baseApi.connect()
        }
        return _baseApi
    }


    destroyClient = () => {
        if (_baseApi) {
            _baseApi.disconnect()
        }
        _baseApi = undefined
    }
}

export const useTranslateRepository = create<TranslateRepository>()(subscribeWithSelector((set, get) => new TranslateRepository("translate.json", set, get)))