import { fs, http } from "@tauri-apps/api"
import { Body, Client } from "@tauri-apps/api/http"
import { v4 as uuid } from "uuid"

//音频参数
export interface AudioOption {
    voice_classify: string
    voice_type: string
    emotion: string
}

export interface AudioData {
    data: Uint8Array
    duration: number
}



export class TTSApi {

    api?: Client
    host: string
    appId: string
    authorization: string

    constructor(host: string, appId: string, authorization: string,) {
        this.host = host
        this.appId = appId
        this.authorization = authorization
    }

    async connect() {
        this.api = await http.getClient()
    }

    async disconnect() {
        console.info('释放 http')
        await this.api?.drop()
    }

    //转换为音频
    translate = async (srtText: string, option: AudioOption) => {
        let params = {
            app: {
                appid: this.appId,
                token: "access_token",
                cluster: "volcano_tts",
            },
            user: {
                uid: uuid()
            },
            audio: { ...option, encoding: "mp3", language: "zh" },
            request: {
                reqid: uuid(),
                text: srtText,
                text_type: "plain",
                operation: "query",
            }
        }

        let resp: any = await this.api?.post(this.host + "/api/v1/tts", Body.json(params), {
            headers: {
                'Content-Type': 'audio/*',
                'Authorization': this.authorization
            }
        }).then(resp => resp.data)
        console.info("resp", resp)
        return {
            data: Uint8Array.from(atob(resp.data), c => c.charCodeAt(0)),
            duration: resp.addition.duration
        } as AudioData
    }

    //提交音频
    submitAudio = async (audioPath: string) => {
        let bytes = await fs.readBinaryFile(audioPath)
        //基础参数
        let baseRawQuery = "appid=" + this.appId + "&words_per_line=20&max_lines=2"
        return await this.api?.post(this.host + "/api/v1/vc/submit?" + baseRawQuery, Body.bytes(bytes), {
            headers: {
                'Content-Type': 'audio/*',
                'Authorization': this.authorization
            }
        }).then(resp => resp.data)
    }

    //查询结果
    queryResult = async (jobId: string) => {
        return await this.api?.get(this.host + "/api/v1/vc/query", {
            query: {
                appid: this.appId,
                id: jobId
            },
            headers: {
                'Authorization': this.authorization
            },
        }).then(resp => resp.data)
    }
}