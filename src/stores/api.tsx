

import OpenAI from "openai"
import { toFile } from "openai/uploads"
import { MessageContentText } from "openai/resources/beta/threads/messages/messages"
import { fs, path } from "@tauri-apps/api"
import { create } from "zustand"
import { BaseDirectory } from "@tauri-apps/api/fs"


// const openaiClient = new OpenAI({ baseURL: "https://wx.yryz3.com/aipainter-openai/v1", apiKey: "xxx", dangerouslyAllowBrowser: true, timeout: 60000 })


export interface OpenAIClient {
    api: OpenAI
    mode: string
}


export interface UserAssistantsApi {

    assistantId?: string
    threadId?: string
    runId?: string
    load: () => Promise<void>
    fileUpload: (client: OpenAIClient, name: string, path: string) => Promise<string>
    //脚本上传
    scriptUpload: (client: OpenAIClient, text: string) => Promise<string>
    //脚本分镜
    scriptBoarding: (client: OpenAIClient, fileId: string) => Promise<any[]>
    //章节分镜
    chapterBoarding: (client: OpenAIClient, fileId: string, chapterText: string) => Promise<any[]>
}


const delay = (ms: number) => {
    return new Promise(resolve => { setTimeout(resolve, ms) });
}

const retrieveRunMessage = async (client: OpenAIClient, threadId: string, runId: string) => {
    // 轮询获取消息  批量推理
    let runmessages: OpenAI.Beta.Threads.ThreadMessage[] = []

    let fetchCount = 0
    while (fetchCount < 30) {
        //查询状态
        let runableResult = await client.api.beta.threads.runs.retrieve(threadId, runId)
        console.info("run state", runableResult)
        if (runableResult.status === "completed") {
            //读取消息 分页
            let messages = await client.api.beta.threads.messages.list(threadId)
            console.info("message state", messages)
            runmessages.push(...messages.data)
            while (messages.hasNextPage()) {
                messages = await messages.getNextPage()
                runmessages.push(...messages.data)
            }
            console.info("分页分镜结果", messages)
        }
        fetchCount++
        await delay(2000)
    }

    //分镜内容
    let chapterContents = runmessages.filter(item => item.role === "assistant")
        .sort(item => item.created_at)
        .flatMap(item => item.content)
        .map(item => {
            return (item as MessageContentText).text.value
        })
    console.info("chapterContents", chapterContents)


    //转换格式 读取json格式
    return chapterContents.map(text => { return JSON.parse(text) })
}


const workspaceFilePath = "env" + path.sep + "openai.json"

const workspaceFileDirectory = BaseDirectory.AppLocalData

export const usePersistUserAssistantsApi = create<UserAssistantsApi>((set, get) => ({
    assistantId: "asst_iVUdB5cY5Y4yIq6uW5xdNEdM",
    load: async () => {
        //加载配置文件
        let exist = await fs.exists(workspaceFilePath, { dir: workspaceFileDirectory, append: true })
        if (!exist) {
            return
        }
        let configText = await fs.readTextFile(workspaceFilePath, { dir: workspaceFileDirectory })
        set({ ...JSON.parse(configText) })
    },
    fileUpload: async (client, name, path) => {
        //上传文件
        let scriptBytes = await fs.readBinaryFile(path)
        let uploadFile = await toFile(Buffer.from(scriptBytes.buffer), name)
        let assistantsFile = await client.api.files.create({ purpose: 'assistants', file: uploadFile })
        return assistantsFile.id
    },
    scriptUpload: async (client, text) => {
        //上传文本
        const encoder = new TextEncoder();
        const textArr = encoder.encode(text)
        //上传文件
        let uploadFile = await toFile(Buffer.from(textArr.buffer), "input.txt")
        let assistantsFile = await client.api.files.create({ purpose: 'assistants', file: uploadFile })
        return assistantsFile.id
    },
    //脚本分镜
    scriptBoarding: async (client: OpenAIClient, fileId: string) => {

        //删除历史线程，每个用户只允许存在一个线程
        let { assistantId, threadId } = get()
        if (threadId) {
            await client.api.beta.threads.del(threadId)
        }

        //重新创建 并且 启动 thread and run
        let threadRun = await client.api.beta.threads.createAndRun({
            assistant_id: assistantId!,
            thread: {
                messages: [{
                    role: "user",
                    content: "将我提供的文件内容进行分镜，并提取每个镜头中角色，场景信息，以json数据返回，过滤掉非法数据",
                    file_ids: [fileId]
                }],
            },
            model: "gpt-4-1106-preview"
        })
        set({ threadId: threadRun.thread_id, runId: threadRun.id })

        console.info("threadRun", threadRun)
        return retrieveRunMessage(client, threadRun.thread_id, threadRun.id)
    },

    //章节独立分镜分析
    chapterBoarding: async (client: OpenAIClient, fileId: string, chapterText: string) => {
        let { assistantId, threadId, runId } = get()

        // 检查当前 thread 是否运行中
        let run = await client.api.beta.threads.runs.retrieve(threadId!, runId!)
        if (run.status === "in_progress" || run.status === "queued") {
            throw new Error("is Running")
        }

        //在上下文问中，继续提供自定义章节进行推理
        await client.api.beta.threads.messages.create(threadId!, {
            role: "user",
            content: chapterText,
            file_ids: [fileId]
        })

        //添加分析规则
        await client.api.beta.threads.messages.create(threadId!, {
            role: "user",
            content: "分析规则",
            file_ids: [fileId]
        })

        //运行
        let runable = await client.api.beta.threads.runs.create(threadId!, { assistant_id: assistantId!, model: client.mode })
        let newRunId = runable.id
        set({ runId: newRunId })

        //检索响应
        return retrieveRunMessage(client, threadId!, newRunId)
    }
}))



