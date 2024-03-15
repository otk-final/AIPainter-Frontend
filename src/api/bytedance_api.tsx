import { v4 as uuid } from "uuid"
import { BytedanceClient, ClientAuthenticationStore } from "."
import { invoke } from "@tauri-apps/api/core"

//音频参数
export interface AudioOption {
    voice_classify: string
    voice_type: string
    emotion: string
    speed_ratio: number,
    volume_ratio: number
}
//默认音频参数
export const DEFAULT_AUDIO_OPTION: AudioOption = {
    voice_classify: "3",
    voice_type: "BV437_streaming",
    emotion: "xiasha",
    speed_ratio: 1,
    volume_ratio: 1
}

export interface AudioData {
    data: Uint8Array
    duration: number
}

export class BytedanceApi {

    appId = process.env.BYTEDANCE_APP_ID!

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

        let resp = await BytedanceClient.post("/api/v1/tts", params, { headers: { 'Content-Type': 'audio/*' } })
        if (resp.status !== 200) {
            throw new Error(resp.statusText)
        }
        //状态
        if (resp.data && resp.data.error_code) {
            throw new Error(resp.data.error_msg)
        }
        return {
            data: Uint8Array.from(atob(resp.data.data), c => c.charCodeAt(0)),
            duration: resp.data.addition.duration
        } as AudioData
    }

    //提交音频
    submitAudio = async (audioPath: string) => {
        let { header } = ClientAuthenticationStore.getState()
        return await invoke('http_upload_handler', {
            client: {
                method: "POST",
                url: process.env.BYTEDANCE_HOST + "/api/v1/vc/submit?appid=" + this.appId + "&words_per_line=20&max_lines=1",
                headers: {
                    ...header,
                    "Content-Type": "audio/*"
                },
            },
            filePath: audioPath
        }).catch(err => {
            throw new Error(err)
        })
    }

    //查询结果
    statusQuery = async (jobId: string) => {
        return await BytedanceClient.get("/api/v1/vc/query", {
            params: {
                appid: this.appId,
                id: jobId
            }
        }).then(resp => resp.data)
    }
}