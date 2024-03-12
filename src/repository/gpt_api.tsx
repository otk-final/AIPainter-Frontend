import { fs } from "@tauri-apps/api"
import OpenAI, { toFile } from "openai"
import { MessageContentText } from "openai/resources/beta/threads/messages/messages"
import { delay } from "./tauri_repository"
import { GPTRepository } from "./gpt"


export class GPTAssistantsApi {

    api: OpenAI
    threadId?: string
    runId?: string

    constructor(host: string, apiKey: string) {
        this.api = new OpenAI({ baseURL: host, apiKey: apiKey || "none", dangerouslyAllowBrowser: true, timeout: 60000 })
    }

    private retrieveMessages = async (threadId: string, runId: string) => {
        // 轮询获取消息  批量推理
        let runmessages: OpenAI.Beta.Threads.ThreadMessage[] = []
        let fetchCount = 0
        while (fetchCount < 30) {
            await delay(5000)
            //查询状态
            let runableResult = await this.api.beta.threads.runs.retrieve(threadId, runId)
            if (runableResult.status === "completed") {
                //读取消息 分页
                let messages = await this.api.beta.threads.messages.list(threadId)
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
    async scriptBoarding(fileId: string, repo: GPTRepository): Promise<any[]> {

        //重新创建 并且 启动 thread and run
        let threadRun = await this.api.beta.threads.createAndRun({
            assistant_id: repo.assistantId!,
            thread: {
                messages: [{
                    role: "user",
                    content: `Create a storyboard based on the script file I provide, including scene original script, scene names, character names, scene descriptions keyword . 
                    The return data format is as follows: "[{"original": "场景原始剧本","scene": "场景名称","characters": ["角色名称"],"description": "场景描述关键词"}]",
                    Do not include any explanations, only provide a RFC8259 compliant JSON response following this format without deviation.`,
                    file_ids: [fileId]
                }]
            },
            model: repo.mode
        })
        this.threadId = threadRun.thread_id
        this.runId = threadRun.id

        //数组
        return await this.retrieveMessages(threadRun.thread_id, threadRun.id)
    }

    //角色收集
    async characterCollecting(fileId: string, repo: GPTRepository): Promise<any[]> {
        //添加分析规则
        let threadRun = await this.api.beta.threads.createAndRun({
            assistant_id: repo.assistantId!,
            thread: {
                messages: [{
                    role: "user",
                    content: `Analyzing all character information based on the script file I provide, including character name, character alias, and character traits.
                    The return data format is as follows:"[{"name": "角色名称","alias": "角色别名","traits": ["角色特征"]}]".
                    Do not include any explanations, only provide a RFC8259 compliant JSON response following this format without deviation.`,
                    file_ids: [fileId]
                }]
            },
        })

        //检索响应
        return this.retrieveMessages(threadRun.thread_id, threadRun.id)
    }

    //章节独立分镜分析
    async chapterBoarding(chapterText: string, repo: GPTRepository): Promise<string> {
        let resp = await this.api.chat.completions.create({
            messages: [
                { content: chapterText, role: 'user' },
                { content: "基于以上提供的脚本片段分析当前场景，并分析场景关键词用于stable diffusion文生图，以逗号分隔。", role: 'user' }
            ],
            stream: false,
            model: repo.mode
        })
        return resp.choices[0].message.content!
    }

    //台词重写
    async rewritePrompt(input: string, repo: GPTRepository): Promise<string> {
        let resp = await this.api.chat.completions.create({
            messages: [
                { content: input, role: 'user' },
                // { content: "Help me rewrite the above content while keeping the language unchanged, with a word count difference of around 10 words, and try to closely align with the original meaning.", role: 'user' }
                { content: "帮我改写上述内容，保持语种不变，尽量贴合原文意思。", role: 'user' }
            ],
            stream: false,
            model: repo.mode
        })
        return resp.choices[0].message.content!
    }
}
