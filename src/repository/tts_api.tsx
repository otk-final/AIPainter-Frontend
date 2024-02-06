import { fs, http } from "@tauri-apps/api"
import { Body, Client } from "@tauri-apps/api/http"

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
        }).then(resp=>resp.data)
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