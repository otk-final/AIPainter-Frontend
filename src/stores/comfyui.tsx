import { fs, path } from "@tauri-apps/api"
import { BaseDirectory } from "@tauri-apps/api/fs"
import axios, { Axios } from "axios"
import { create } from "zustand"

export interface ComfyUIWorkflow {
    name: string
    path: string
}

export interface ComfyUIStorage {
    url: string
    modeApis: ComfyUIWorkflow[]
    reverseApi?: ComfyUIWorkflow,
    positivePrompt?: string,
    negativePrompt?: string,
    isLocal: () => boolean
    addModeApi: () => void
    load: () => Promise<void>
    save: () => Promise<void>
    removeModeApi: (index: number) => Promise<void>
    uploadModeApi: (index: number, workflowPath: string) => Promise<void>
    uploadReverseApi: (workflowPath: string) => Promise<void>
    setHandle: (state: any) => void

    loadReverseApi: () => any

    loadModeApi: (name: string) => any
}

const workspaceFilePath = "env" + path.sep + "comfyui.json"
const workspaceFileDirectory = BaseDirectory.AppLocalData
export const usePersistComfyUIStorage = create<ComfyUIStorage>((set, get) => ({
    url: "http://192.168.48.123:8188",
    modeApis: [{ name: "", path: "", script: {} }],
    load: async () => {
        //创建目录
        await fs.createDir("env", { dir: workspaceFileDirectory, recursive: true })

        //加载配置文件
        let exist = await fs.exists(workspaceFilePath, { dir: workspaceFileDirectory, append: true })
        if (!exist) {
            return
        }
        let jsonText = await fs.readTextFile(workspaceFilePath, {
            dir: workspaceFileDirectory
        })
        set({ ...JSON.parse(jsonText) })
    },
    isLocal: () => {
        let { url } = get()
        return url.indexOf("127.0.0.1") !== -1 || url.indexOf("localhost") !== -1
    },
    save: async () => {
        let store = get()
        await fs.writeTextFile(workspaceFilePath, JSON.stringify(store, null, "\t"), { dir: workspaceFileDirectory, append: false })
    },
    addModeApi: async () => {
        let { modeApis } = get()
        modeApis.push({ name: "", path: "" })
        set({ modeApis: modeApis })
    },
    removeModeApi: async (idx: number) => {
        let modeApis = [...get().modeApis]
        modeApis.splice(idx, 1)
        set({ modeApis: modeApis })
    },
    uploadModeApi: async (index: number, workflowPath: string) => {
        let workflowFileName = await path.basename(workflowPath)

        //读取文件
        let wfText = await fs.readTextFile(workflowPath)

        //校验文件
        JSON.parse(wfText)

        let { modeApis } = get()
        modeApis[index] = { name: workflowFileName, path: workflowPath }
        set({ modeApis: [...modeApis] })
    },
    uploadReverseApi: async (workflowPath: string) => {
        let workflowFileName = await path.basename(workflowPath)
        //读取文件
        let wfText = await fs.readTextFile(workflowPath)
        //校验文件
        JSON.parse(wfText)
        set({ reverseApi: { name: workflowFileName, path: workflowPath } })
    },
    setHandle: set,
    loadReverseApi: async () => {
        let { reverseApi } = get()
        let wfText = await fs.readTextFile(reverseApi!.path)
        return JSON.parse(wfText)
    },
    loadModeApi: async (name: string) => {
        let { modeApis } = get()
        let modeApi = modeApis.find(item => item.name === name)

        let wfText = await fs.readTextFile(modeApi!.path)
        return JSON.parse(wfText)
    }
}))



export interface ComfyUIPromptTask {
    prompt_id: string
    number: number
    node_errors: any
}

export interface ComfyUIPromptEvent {
    type: string
    data: any
}



export class ComfyUIApi {
    api: Axios
    clientId: string
    // storage: ComfyUIStorage
    constructor(clientId: string, config: ComfyUIStorage) {

        // this.storage = config
        this.clientId = clientId
        debugger
        //api
        this.api = axios.create({
            baseURL: config.url,
            timeout: -1
        })

        //websocket  只保持一个链接
        let ws = new WebSocket(config.url + "/ws?client_id=" + clientId)
        ws.onopen = this.wsOpen
        ws.onmessage = this.wsReceived
        ws.onclose = this.wsClose
    }

    wsOpen() {
        console.info('ws opened')
    }
    wsReceived(message: MessageEvent<ComfyUIPromptEvent>) {
        //server
        let { type, data } = message.data
        if (type === "executing") {
            if (data.node) {
                //is runing at some node
            } else {
                //is finished
            }
        } else if (type === "progress") {
            //当前进度信息

        } else if (type === "execution_start") {
            //已经开始执行

        } else if (type === "status") {
            //任务数据发送变更
        }
    }
    wsClose() {
        console.info('ws closed')
    }

    //post prompt
    async prompt<T>(script: WorkflowScript, params: T, handle: CompletionPromptParams<T>): Promise<ComfyUIPromptTask> {
        let prompt = handle(this, script, params)
        //提交任务
        return await this.api.post("/prompt", { clientId: this.clientId, prompt: prompt }) as ComfyUIPromptTask
    }

    //任务状态
    async history(prompt_id: string): Promise<any> {
        return await this.api.get("/history/" + prompt_id)
    }

    //upload
    async upload(subfolder: string, filePath: string, fileName: string): Promise<void> {

        //参数 每次上传覆盖文件
        let imageBytes = await fs.readBinaryFile(filePath)
        const formData = new FormData();
        formData.append('image', new Blob([imageBytes.buffer]), fileName);
        formData.append("subfolder", subfolder)
        formData.append("overwrite", 'true')


        await this.api.post('/upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    }

    //download
    async download(subfolder: string, fileName: any, saveFilePath: string): Promise<void> {
        //下载网络文件
        let resp = await this.api.get('/view', { params: { subfolder: subfolder, filename: fileName, type: "output" }, responseType: 'arraybuffer' })
        //写入本地文件
        await fs.writeBinaryFile(saveFilePath, Buffer.from(resp.data), { append: false })
    }
}

//补全Prompt接口参数
export type CompletionPromptParams<T> = (api: ComfyUIApi, script: WorkflowScript, params: T) => any


interface WorkflowNode {
    step: string
    node: {
        inputs: any
        class_type: string
    }
}





export class WorkflowScript {
    nodes: WorkflowNode[]
    constructor(script: any) {
        this.nodes = []
        //转换为[] 便于后续查询 更新
        Object.keys(script).forEach(key => {
            this.nodes.push({ step: key, node: script[key] })
        })
    }
    getNodes(classType: string): WorkflowNode[] {
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
        saveImages = saveImages.sort((a: WorkflowNode, b: WorkflowNode) => {
            return Number.parseInt(a.step) - Number.parseInt(b.step)
        })
        return saveImages[0].step
    }
}



export interface ImageFileParams {
    subfolder: string
    filename: string
}

//图反推关键词
export const Image2TextHandle: CompletionPromptParams<ImageFileParams> = (api: ComfyUIApi, script: WorkflowScript, file: ImageFileParams) => {
    script.setInputImage(file.subfolder + "/" + file.filename)
}

export interface Text2ImageParams {
    positive: string
    negative: string
}

//文生图
export const Text2ImageHandle: CompletionPromptParams<Text2ImageParams> = (api: ComfyUIApi, script: WorkflowScript, params: Text2ImageParams) => {
    script.setNegativePrompt(params.negative)
    script.setPositivePrompt(params.positive)
}


//图生图
export const Image2ImageHandle: CompletionPromptParams<ImageFileParams> = (api: ComfyUIApi, script: WorkflowScript, file: ImageFileParams) => {
    script.setInputImage(file.subfolder + "/" + file.filename)
}
