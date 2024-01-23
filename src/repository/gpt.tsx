import { fs } from "@tauri-apps/api"
import OpenAI, { toFile } from "openai"
import { MessageContentText } from "openai/resources/beta/threads/messages/messages"
import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware"
import { BaseRepository, delay } from "./tauri_repository"


export class GPTAssistantsApi extends BaseRepository<GPTAssistantsApi> {

    repoInitialization(thisData: GPTAssistantsApi): void {
        this.host = thisData.host
        this.apiKey = thisData.apiKey
        this.mode = thisData.mode
        this.assistantId = thisData.assistantId
        this.threadId = thisData.threadId
        this.runId = thisData.runId
    }

    repoEmpty(): GPTAssistantsApi {
        return this
    }

    host: string = "https://wx.yryz3.com/aipainter-openai/v1"
    apiKey: string = "none"
    mode: string = "gpt-4-1106-preview"


    api: OpenAI
    assistantId: string = "asst_iVUdB5cY5Y4yIq6uW5xdNEdM"

    threadId?: string
    runId?: string
    constructor(repo: string, set: (T: GPTAssistantsApi) => void, get: () => GPTAssistantsApi) {
        super(repo, set, get)
        this.api = new OpenAI({ baseURL: this.host, apiKey: this.apiKey, dangerouslyAllowBrowser: true, timeout: 60000 })
    }


    private blockingRetrieveMessages = async (api: OpenAI, threadId: string, runId: string) => {
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

    async fileUpload(filename: string, filepath: string): Promise<string> {
        //上传文件
        let scriptBytes = await fs.readBinaryFile(filepath)
        let uploadFile = await toFile(Buffer.from(scriptBytes.buffer), filename)
        let assistantsFile = await this.api.files.create({ purpose: 'assistants', file: uploadFile })
        return assistantsFile.id
    }

    async scriptUpload(filename: string, text: string): Promise<string> {
        //上传自定义脚本
        const encoder = new TextEncoder();
        const textArr = encoder.encode(text)
        //上传文件
        let uploadFile = await toFile(Buffer.from(textArr.buffer), filename)
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
            model: this.mode
        })
        this.threadId = threadRun.thread_id
        this.runId = threadRun.id

        //数组
        return await this.blockingRetrieveMessages(this.api, threadRun.thread_id, threadRun.id)
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
        return this.blockingRetrieveMessages(this.api, this.runId, this.runId)
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
        return this.blockingRetrieveMessages(this.api, this.threadId!, this.runId)
    }

    async rewritePrompt(input: string): Promise<string> {
        let resp = await this.api.chat.completions.create({
            messages: [
                { content: input, role: 'user' },
                // { content: "Help me rewrite the above content while keeping the language unchanged, with a word count difference of around 10 words, and try to closely align with the original meaning.", role: 'user' }
                { content: "帮我改写上述内容，保持语种不变，尽量贴合原文意思。", role: 'user' }

            ],
            stream: false,
            model: this.mode
        })
        return resp.choices[0].message.content!
    }
}

export const useGPTAssistantsApi = create<GPTAssistantsApi>()(subscribeWithSelector((set, get) => new GPTAssistantsApi("gpt.json", set, get)))