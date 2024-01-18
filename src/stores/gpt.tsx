

import OpenAI from "openai"
import { toFile } from "openai/uploads"
import { MessageContentText } from "openai/resources/beta/threads/messages/messages"
import { fs, path } from "@tauri-apps/api"
import { create } from "zustand"
import { BaseDirectory } from "@tauri-apps/api/fs"


// const openaiClient = new OpenAI({ baseURL: "https://wx.yryz3.com/aipainter-openai/v1", apiKey: "xxx", dangerouslyAllowBrowser: true, timeout: 60000 })


export interface GPTClient {
    host: string
    apiKey: string
    mode: string

    buildClient: () => OpenAI
}

const workspaceFilePath = "env" + path.sep + "openai.json"
const workspaceFileDirectory = BaseDirectory.AppLocalData


export const usePersistGPTStorage = create<GPTClient>((set, get) => ({
    host: "https://wx.yryz3.com/aipainter-openai/v1",
    apiKey: "xx",
    mode: "gpt-4-1106-preview",
    load: () => {

    },
    buildClient: () => {
        let { host, apiKey } = get()
        return new OpenAI({ baseURL: host, apiKey: apiKey, dangerouslyAllowBrowser: true, timeout: 60000 })
    }
}))



const delay = (ms: number) => {
    return new Promise(resolve => { setTimeout(resolve, ms) });
}

// const jsonRegex = new RegExp(/```json(.*?)```/)

const retrieveRunMessage = async (api: OpenAI, threadId: string, runId: string) => {
    // 轮询获取消息  批量推理
    let runmessages: OpenAI.Beta.Threads.ThreadMessage[] = []

    let fetchCount = 0
    while (fetchCount < 30) {
        await delay(10000)
        //查询状态
        let runableResult = await api.beta.threads.runs.retrieve(threadId, runId)
        if (runableResult.status === "completed") {
            //读取消息 分页
            let messages = await api.beta.threads.messages.list(threadId)
            runmessages.push(...messages.data)
            while (messages.hasNextPage()) {
                messages = await messages.getNextPage()
                runmessages.push(...messages.data)
            }
            break
        }
        fetchCount++
    }

    //分镜内容
    let chapterContents = runmessages.filter(item => item.role === "assistant")
        .sort(item => item.created_at)
        .flatMap(item => item.content)
        .map(item => {
            let text = (item as MessageContentText).text.value
            console.info(text)
            if (text.startsWith("```json") && text.endsWith("```")) {
                return text.substring(7, text.length - 3)
            }
            return text
        })

    //转换格式 读取json格式
    return chapterContents.map(text => { try { console.info("messageText", text); return JSON.parse(text) } catch (err) { return null } }).filter(item => item)
}



export class GPTAssistantsApi {

    api: OpenAI
    mode: string


    assistantId: string
    threadId?: string
    runId?: string

    constructor(client: GPTClient, assistantId: string) {
        this.api = client.buildClient()
        this.mode = client.mode
        this.assistantId = assistantId
    }
    async fileUpload(name: string, path: string): Promise<string> {
        //上传文件
        let scriptBytes = await fs.readBinaryFile(path)
        let uploadFile = await toFile(Buffer.from(scriptBytes.buffer), name)
        let assistantsFile = await this.api.files.create({ purpose: 'assistants', file: uploadFile })
        return assistantsFile.id
    }
    async scriptUpload(text: string): Promise<string> {
        //上传文本
        const encoder = new TextEncoder();
        const textArr = encoder.encode(text)
        //上传文件
        let uploadFile = await toFile(Buffer.from(textArr.buffer), "input.txt")
        let assistantsFile = await this.api.files.create({ purpose: 'assistants', file: uploadFile })
        return assistantsFile.id
    }
    //脚本分镜
    async scriptBoarding(fileId: string): Promise<any[]> {
        //删除历史线程，每个用户只允许存在一个线程

        //重新创建 并且 启动 thread and run
        let threadRun = await this.api.beta.threads.createAndRun({
            assistant_id: this.assistantId!,
            thread: {
                messages: [{
                    role: "user",
                    content: `Create a storyboard based on the script file I provide, including scene original script, scene names, character names, scene descriptions, and dialogue. The return data format is as follows: "[{"original": "场景原始剧本","scene": "场景名称","characters": ["角色名称"],"description": "场景描写","dialogues": ["台词"]}]"Do not include any explanations, only provide a RFC8259 compliant JSON response following this format without deviation.`,
                    file_ids: [fileId]
                }]
            },
            model: "gpt-4-1106-preview"
        })
        this.threadId = threadRun.thread_id
        this.runId = threadRun.id

        //数组
        return await retrieveRunMessage(this.api, threadRun.thread_id, threadRun.id)
    }
    //角色收集
    async characterCollecting(assistantId: string, fileId: string): Promise<any[]> {

        // 检查当前 thread 是否运行中
        let run = await this.api.beta.threads.runs.retrieve(this.threadId!, this.runId!)
        if (run.status === "in_progress" || run.status === "queued") {
            throw new Error("is Running")
        }

        //添加分析规则
        await this.api.beta.threads.messages.create(this.threadId!, {
            role: "user",
            content: `Analyzing all character information based on the script file I provide, including character name, character alias, and character traits.The return data format is as follows:"[{"name": "角色名称","alias": "角色别名","traits": ["角色特征"]}]".Do not include any explanations, only provide a RFC8259 compliant JSON response following this format without deviation.`,
            file_ids: [fileId]
        })

        //运行
        let runable = await this.api.beta.threads.runs.create(this.threadId!, { assistant_id: assistantId!, model: this.mode })
        this.runId = runable.id

        //检索响应
        return retrieveRunMessage(this.api, this.runId, this.runId)
    }
    //章节独立分镜分析
    async chapterBoarding(fileId: string, chapterText: string): Promise<any[]> {

        // 检查当前 thread 是否运行中
        let run = await this.api.beta.threads.runs.retrieve(this.threadId!, this.runId!)
        if (run.status === "in_progress" || run.status === "queued") {
            throw new Error("is Running")
        }

        //在上下文问中，继续提供自定义章节进行推理
        await this.api.beta.threads.messages.create(this.threadId!, {
            role: "user",
            content: chapterText,
            file_ids: [fileId]
        })

        //添加分析规则
        await this.api.beta.threads.messages.create(this.threadId!, {
            role: "user",
            content: `Based on the script segment provided above, analyze the current scene (scene name, character name, scene description, dialogue).The return data format is as follows:"{"scene": "场景名称","characters": ["角色名称"],"description": "场景描写","dialogues":["台词"]}".Do not include any explanations, only provide a RFC8259 compliant JSON response following this format without deviation.`,
            file_ids: [fileId]
        })

        //运行
        let runable = await this.api.beta.threads.runs.create(this.threadId!, { assistant_id: this.assistantId, model: this.mode })
        this.runId = runable.id

        //检索响应
        return retrieveRunMessage(this.api, this.threadId!, this.runId)
    }
}



