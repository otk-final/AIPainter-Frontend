import axios, { Axios } from "axios"
import { fs, http } from "@tauri-apps/api"
import { ItemIdentifiable, delay } from "./tauri_repository"
import WebSocket, { Message } from "tauri-plugin-websocket-api"
import { Body, Client, ResponseType } from "@tauri-apps/api/http"

export interface ComfyUIWorkflow extends ItemIdentifiable {
    name: string
    path: string
}

export interface ComfyUIHost {
    url: string
    websocket: string
}

export interface ComfyUIPromptTask {
    prompt_id: string
    number: number
    node_errors: any
}

export interface ComfyUIPromptEvent {
    type: string
    data: any
}


interface ComfyUIPromptCallback {
    jobId: string
    promptId: string
    handle: (promptId: string, respData: any) => Promise<void>
}


let eventCenter: ComfyUIPromptCallback[] = []
const eventLoopMaxCount = 10
const eventLoopDelay = 1000

//注册任务
export const registerComfyUIPromptCallback = (cb: ComfyUIPromptCallback) => {
    //查找已经存在任务，先删除
    eventCenter = eventCenter.filter(item => item.jobId !== cb.jobId)
    eventCenter.push(cb)
}



//执行回调
const doComfyUIPromptCallback = async (api: ComfyUIApi, promptId: string) => {

    console.log("准备回调业务方:", promptId)

    let idx = eventCenter.findIndex(item => item.promptId === promptId)
    if (idx === -1) {
        return
    }

    //查询结果
    let fetchCount = 0
    let respData: any
    while (fetchCount <= eventLoopMaxCount) {
        //查询状态 如果非空对象 则表示完成
        respData = await api.history(promptId)
        if (respData && Object.keys(respData).length > 0) {
            break
        }
        await delay(eventLoopDelay)
        fetchCount++
    }

    //执行 忽略异常
    try {
        if (!respData || Object.keys(respData).length === 0) {
            return
        }
        console.log("回调业务方:", promptId, respData)
        let hold = eventCenter[idx]
        //防止重复消息
        if (hold === undefined || hold.promptId !== promptId) {
            return
        }
        hold.handle(promptId, respData)
    } catch (err) {
        console.info(err)
    }
    //删除
    eventCenter.splice(idx, 1)
}


const ComfyUIApiTimeout = 60000
export class ComfyUIApi {

    api?: Client
    wsConn?: WebSocket
    host: ComfyUIHost
    clientId: string

    // storage:
    constructor(clientId: string, host: ComfyUIHost) {
        // this.storage = config
        this.clientId = clientId
        this.host = host
    }

    async connect(clientId: string, host: ComfyUIHost) {
        this.api = await http.getClient()

        //websocket  只保持一个链接
        this.wsConn = await WebSocket.connect(host.websocket + "?client_id=" + clientId)
        this.wsConn.addListener(this.wsReceived)
        console.info(this.wsConn.id)
    }

    async disconnect() {
        await this.wsConn?.disconnect()
        await this.api?.drop()
    }

    private wsReceived = (message: Message) => {
        if (message.type !== "Text") {
            return
        }
        //server
        let { type, data } = JSON.parse(message.data as string) as ComfyUIPromptEvent
        let ok = (data.value !== undefined) && (data.max !== undefined) && (data.value === data.max) && (data.prompt_id !== undefined)
        if (type === "progress" && ok) {
            //通知业务
            doComfyUIPromptCallback(this, data.prompt_id)
        } else {
            console.info('message.other', message.data)
        }
    }

    //post prompt
    async prompt<T>(script: WFScript, params: T, handle: CompletionPromptParams<T>): Promise<ComfyUIPromptTask> {
        let prompt = handle(this, script, params)
        //提交任务
        const response = await this.api!.post(
            this.host.url + "/prompt",
            Body.json({
                clientId: this.clientId, prompt: prompt
            }),
            { responseType: ResponseType.JSON, timeout: ComfyUIApiTimeout }
        );
        return response.data as ComfyUIPromptTask
    }

    //任务状态
    async history(prompt_id: string): Promise<any> {
        return await this.api!.get(this.host.url + "/history/" + prompt_id, { responseType: ResponseType.JSON, timeout: ComfyUIApiTimeout }).then(resp => resp.data)
    }

    //upload
    async upload(subfolder: string, filePath: string, fileName: string): Promise<any> {

        let body = Body.form({
            image: {
                file: filePath,
                mime: 'image/png',
                fileName: fileName
            },
            subfolder: subfolder,
            overwrite: 'true'
        })

        return await this.api!.post(this.host.url + '/upload/image', body, {
            headers: { 'Content-Type': 'multipart/form-data' },
            responseType: ResponseType.JSON, timeout: ComfyUIApiTimeout
        }).then(resp => {
            return resp.data
        })
    }

    //download
    async download(subfolder: string, fileName: any): Promise<ArrayBuffer> {
        //下载网络文件
        let resp = await this.api!.get(this.host.url + '/view',
            {
                query: { subfolder: subfolder, filename: fileName, type: "output" },
                responseType: ResponseType.Binary
            })
        return Buffer.from(resp.data as ArrayBuffer)
    }
}

//补全Prompt接口参数
export type CompletionPromptParams<T> = (api: ComfyUIApi, script: WFScript, params: T) => any


// workflow node
interface WFNode {
    step: string
    node: { inputs: any, class_type: string }
}



// workflow script
export class WFScript {
    nodes: WFNode[]
    constructor(script: any) {
        this.nodes = []
        //转换为[] 便于后续查询 更新
        Object.keys(script).forEach(key => {
            this.nodes.push({ step: key, node: script[key] })
        })
    }
    getNodes(classType: string): WFNode[] {
        return this.nodes.filter(item => item.node.class_type.startsWith(classType))
    }
    getNodeIndex(step: string): number {
        return this.nodes.findIndex(item => item.step === step)
    }
    private setPrompt(type: string, prompt: string) {
        //只有采样器上才能区分正面，反面提示词
        let samplers = this.getNodes("KSampler")

        //定位 CLIP文本编码器 
        let clips = samplers.map(sampler => {
            let arr = sampler.node.inputs[type] as any[]
            //第一个参数
            return arr[0]
        })

        //补填prompt  补填text参数
        clips.forEach((step: string) => {
            let nodeIdx = this.getNodeIndex(step)
            if (nodeIdx !== -1) this.nodes[nodeIdx].node.inputs = { ...this.nodes[nodeIdx].node.inputs, text: prompt }
        })
    }
    setPositivePrompt(prompt: string) {
        this.setPrompt("positive", prompt)
    }
    setNegativePrompt(prompt: string) {
        this.setPrompt("negative", prompt)
    }
    setInputImage(name: string) {
        let loadImages = this.getNodes("LoadImage")
        loadImages.forEach(loader => {
            loader.node.inputs = { ...loader.node.inputs, image: name }
        })
    }
    getOutputImageStep(): string {
        return this.getOutputStep("SaveImage")
    }
    getWD14TaggerStep(): string {
        return this.getOutputStep("WD14Tagger")
    }
    private getOutputStep(classType: string): string {
        //一个工作流中 可能出现多个相同逻辑节点，以用户最后节点导出为主，及节点编号最大值
        let saveImages = this.getNodes(classType)
        saveImages = saveImages.sort((a: WFNode, b: WFNode) => {
            return Number.parseInt(a.step) - Number.parseInt(b.step)
        })
        return saveImages[0].step
    }
    toObject(): any {
        let obj: any = {}
        this.nodes.forEach(item => {
            obj[item.step] = item.node
        })
        return obj
    }
}



export interface ImageFileParams {
    subfolder: string
    filename: string
}

//图反推关键词
export const Image2TextHandle: CompletionPromptParams<ImageFileParams> = (api: ComfyUIApi, script: WFScript, file: ImageFileParams) => {
    script.setInputImage(file.subfolder + "/" + file.filename)
    return script.toObject()
}

export interface Text2ImageParams {
    positive: string
    negative: string
}

//文生图
export const Text2ImageHandle: CompletionPromptParams<Text2ImageParams> = (api: ComfyUIApi, script: WFScript, params: Text2ImageParams) => {
    script.setNegativePrompt(params.negative)
    script.setPositivePrompt(params.positive)
    return script.toObject()
}


//图生图
export const Image2ImageHandle: CompletionPromptParams<ImageFileParams> = (api: ComfyUIApi, script: WFScript, file: ImageFileParams) => {
    script.setInputImage(file.subfolder + "/" + file.filename)
    return script.toObject()
}
