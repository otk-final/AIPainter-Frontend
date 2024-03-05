import { http } from "@tauri-apps/api"
import { Body, Client } from "@tauri-apps/api/http"
import { TranslateRepository } from "./translate"



export class TranslateApi {

    api?: Client
    host: string
    accessToken: string

    constructor(host: string, accessToken: string) {
        this.host = host
        this.accessToken = accessToken
    }

    async connect() {
        this.api = await http.getClient()
    }

    async disconnect() {
        console.info('释放 http')
        await this.api?.drop()
    }

    //获取token
    token = async (translateRepo: TranslateRepository) => {
        // const form = new FormData();
        // form.append('key', 'value');
        let rawPath = "?client_id=" + translateRepo.client_id + "&client_secret=" + translateRepo.client_secret + "&grant_type=client_credentials"
        let authResp: any = await this.api?.post(this.host + "/oauth/2.0/token" + rawPath, Body.text(""), {
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
                'Accept': 'application/json'
            }
        });
        if (!authResp.ok) {
            throw new Error("网络错误")
        }
        //状态
        if (authResp.data && authResp.data.error_code) {
            throw new Error(authResp.data.error_msg)
        }
        return authResp.data as TokenResult;
    }

    //翻译文本
    translate = async (text: string) => {
        let params = {
            q: text,
            from: "auto",
            to: "en"   //统一转换为英文
        }
        let resp: any = await this.api?.post(this.host + "/rpc/2.0/mt/texttrans/v1?access_token=" + this.accessToken, Body.json(params), {
            headers: {
                'Content-Type': 'application/json;charset=utf-8',
            }
        });
        if (!resp.ok) {
            throw new Error("网络错误")
        }
        //状态
        if (resp.data && resp.data.error_code) {
            throw new Error(resp.data.error_msg)
        }
        return resp.data as TranslateResult
    }
}

export interface TokenResult {
    access_token: string
    expires_in: number,
    refresh_token: string,
    scope: string
    session_key: string
    session_secrct: string
}

interface TranslateResult {
    result: {
        trans_result: { dst: string, src: string }[]
    }
    from: string,
    to: string,
    log_id: number
}