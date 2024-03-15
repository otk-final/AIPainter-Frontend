import { ItemIdentifiable, delay } from "../repository/tauri_repository"
import { ClientAuthenticationStore, ComfyUIClient } from "."
import { invoke } from "@tauri-apps/api/core"

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
    error?: any
    node_errors?: any
}

export interface ComfyUIPromptEvent {
    type: string
    data: any
}

export interface ComfyUIImageLocation {
    filename: string,
    subfolder: string,
    type: string
}

export interface ComfyUIImageDimensions {
    width: number,
    height: number,
}

export class ComfyUIApi {

    clientId: string

    // storage:
    constructor() {
        let { user } = ClientAuthenticationStore.getState()
        if (!user) {
            throw new Error("no found login user")
        }
        this.clientId = user.id
    }

    //提交任务
    async prompt<T>(script: ApiPrompt, params: T, handle: CompletionPromptParams<T>): Promise<{ promptId: string, promptResult: any }> {
        let prompt = handle(this, script, params)
        console.info('提交ComfyUI任务', prompt)

        let response = await ComfyUIClient.post("/prompt", {
            clientId: this.clientId,
            prompt: prompt,
        })
        if (response.status !== 200) {
            throw new Error(response.data as string);
        }
        let task = response.data as ComfyUIPromptTask
        let prompt_id = task.prompt_id;
        if (!prompt_id) {
            throw new Error(task.error.message)
        }

        //堵塞式查询
        let count = 0;
        let respData: any;
        while (count < 10) {

            await delay(3000)

            //查询状态
            let tempData = await this.status(prompt_id)
            console.log("查询结果:", prompt_id, count, tempData)
            if (tempData && Object.keys(tempData).length > 0) {
                respData = tempData;
                break
            }
            count++;
        }

        if (!respData) {
            throw new Error("任务异常")
        }
        return { promptId: prompt_id, promptResult: respData };
    }

    //任务状态
    async status(prompt_id: string): Promise<any> {
        return ComfyUIClient.get('/history/' + prompt_id);
    }

    //upload
    async upload(locate: ComfyUIImageLocation, filepath: string): Promise<any> {

        let { header } = ClientAuthenticationStore.getState()
        return await invoke('http_multipart_handler', {
            client: {
                method: "POST",
                url: process.env.COMFYUI_HOST + "/image/upload",
                headers: header,
            },
            parameter: {
                file_part: "image",
                file_path: filepath,
                file_name: locate.filename,
                payload: {
                    overwrite: "true",
                    subfolder: locate.subfolder
                }
            }
        })
    }

    //download
    async download(locate: ComfyUIImageLocation, filepath: string): Promise<ArrayBuffer> {
        let { header } = ClientAuthenticationStore.getState()
        return await invoke('http_download_handler', {
            client: {
                method: "GET",
                url: process.env.COMFYUI_HOST + "/view?subfolder=" + locate.subfolder + "&filename=" + locate.filename + "&type=" + locate.type,
                headers: header,
            },
            filePath: filepath
        });
    }
}

//补全Prompt接口参数
export type CompletionPromptParams<T> = (api: ComfyUIApi, script: ApiPrompt, params: T) => any


// workflow node
interface WorkNode {
    step: string
    node: { inputs: any, class_type: string }
}



// workflow script
export class ApiPrompt {
    nodes: WorkNode[]
    constructor(script: any) {
        this.nodes = []
        //转换为[] 便于后续查询 更新
        Object.keys(script).forEach(key => {
            this.nodes.push({ step: key, node: script[key] })
        })
    }
    private getNodes(classType: string): WorkNode[] {
        return this.nodes.filter(item => item.node.class_type.startsWith(classType))
    }

    private getNodeIndex(step: string): number {
        return this.nodes.findIndex(item => item.step === step)
    }

    private setPrompt(type: string, prompt: string) {
        //只有采样器上才能区分正面，反面提示词
        let samplers = this.getNodes("KSampler")

        //定位 CLIP文本编码器 取 第一个参数
        let clips = samplers.map(sampler => {
            let arr = sampler.node.inputs[type] as any[]
            return arr[0]
        })

        //补填prompt  补填text参数
        clips.forEach((step: string) => {
            let nodeIdx = this.getNodeIndex(step)
            if (nodeIdx !== -1) this.nodes[nodeIdx].node.inputs = { ...this.nodes[nodeIdx].node.inputs, text: prompt }
        })
    }

    //添加正向关键词
    setPositivePrompt(prompt: string) {
        this.setPrompt("positive", prompt)
    }

    //添加反向关键词
    setNegativePrompt(prompt: string) {
        this.setPrompt("negative", prompt)
    }

    //设置图片参考尺寸
    setLatentImage(width: number, height: number) {
        let latentImages = this.getNodes("EmptyLatentImage")
        latentImages.forEach(latent => {
            latent.node.inputs = { ...latent.node.inputs, width: Number(width), height: Number(height) }
        })
    }

    //设置参考图片信息
    setInputImage(name: string) {
        let loadImages = this.getNodes("LoadImage")
        loadImages.forEach(loader => {
            loader.node.inputs = { ...loader.node.inputs, image: name }
        })
    }
    //设置随机值
    setSeed(seed: number) {
        let samplers = this.getNodes("KSampler")
        samplers.forEach(s => {
            s.node.inputs = { ...s.node.inputs, seed: seed }
        })
    }
    hasInputImageStep(): boolean {
        return this.getNodes("LoadImage").length > 0
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
        saveImages = saveImages.sort((a: WorkNode, b: WorkNode) => {
            return Number.parseInt(a.step) - Number.parseInt(b.step)
        })
        return saveImages[0].step
    }
    //to json
    toObject(): any {
        let obj: any = {}
        this.nodes.forEach(item => {
            obj[item.step] = item.node
        })
        return obj
    }
}




//图反推关键词
export const Image2TextHandle: CompletionPromptParams<ComfyUIImageLocation> = (api: ComfyUIApi, script: ApiPrompt, locate: ComfyUIImageLocation) => {
    script.setInputImage(locate.subfolder + "/" + locate.filename)
    return script.toObject()
}

export interface Text2ImageParams {

    image_location?: ComfyUIImageLocation
    image_dimensions?: ComfyUIImageDimensions

    positive: string
    negative: string
    seed: number

}

//文生图
export const Text2ImageHandle: CompletionPromptParams<Text2ImageParams> = (api: ComfyUIApi, script: ApiPrompt, params: Text2ImageParams) => {

    //参考图片
    if (params.image_location) {
        script.setInputImage(params.image_location.subfolder + "/" + params.image_location.filename)
    }

    //自定义LatentImage
    if (params.image_dimensions) {
        script.setLatentImage(params.image_dimensions.width, params.image_dimensions.height)
    }

    script.setNegativePrompt(params.negative)
    script.setPositivePrompt(params.positive)
    script.setSeed(params.seed)
    return script.toObject()
}