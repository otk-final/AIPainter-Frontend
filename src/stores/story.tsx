import { fs, path } from "@tauri-apps/api"
import { BaseDirectory } from "@tauri-apps/api/fs"
import { create } from "zustand"
import { v4 as uuid } from "uuid"
import { OpenAIClient, UserAssistantsApi } from "./api"
import OpenAI from "openai"


export type ImportType = "input" | "file"

export interface Script {
    fileId: string
    path: string,
    input: string
    type: ImportType
}


export interface Chapter {
    id: string
    original: string
    actors: string[]

    sceneDialogues: string[],
    sceneName?: string
    sceneDescription?: string

    actorsPrompt?: {
        cn: string
        en: string
    }
    // 绘画参数
    drawPrompt?: string
    drawImage?: string
    drawImageHistory?: string[]
    drawConfig?: any

    state: number
}

export interface Actor {
    id: string
    name: string
    alias: string
    style: string
    traits: TraitsOption[]
}

export interface TraitsConfig {
    key: string
    name: string
    requirement?: string
    options: TraitsOption[]
}

export interface TraitsOption {
    key: string
    label: string
    value?: string
    image?: string
    weight?: string
}


export interface DrawGlobalConfig {
    template: string
    model: string
}

export interface ScriptStorage {
    pid: string | undefined
    script: Script | undefined
    style: string,
    quit: () => Promise<void>
    load: (pid: string) => Promise<void>
    setStyle: (style: string) => Promise<void>
    startBoarding: (uasApi: UserAssistantsApi, boardType: string, script: Script) => Promise<Chapter[]>
}


const workspaceFileDirectory = BaseDirectory.AppLocalData



//剧本
export const usePersistScriptStorage = create<ScriptStorage>((set, get) => ({
    pid: undefined,
    script: undefined,
    style: "default",
    quit: async () => {
        set({ pid: undefined, script: undefined })
    },
    load: async (pid: string) => {
        //读取原始脚本
        let scriptFile = await path.join(pid, "script.json")
        let exist = await fs.exists(scriptFile, { dir: workspaceFileDirectory })
        if (!exist) {
            set({ pid: pid, script: undefined })
            return
        }
        let scriptJson = await fs.readTextFile(scriptFile, { dir: workspaceFileDirectory })
        set({ ...JSON.parse(scriptJson) })
    },
    setStyle: async (key: string) => {
        set({ style: key })
    },
    startBoarding: async (uasApi: UserAssistantsApi, boardType: string, script: Script) => {

        let client: OpenAIClient = {
            api: new OpenAI({ baseURL: "https://wx.yryz3.com/aipainter-openai/v1", apiKey: "xxx", dangerouslyAllowBrowser: true, timeout: 60000 }),
            mode: "gpt-4-1106-preview"
        }

        let chapters: Chapter[] = []
        if (boardType === "ai") {
            //ai  上传剧本
            let fileId = ""
            if (script.type === "file") {
                let fileName = await path.basename(script.path)
                fileId = await uasApi.fileUpload(client, fileName, script.path)
            } else {
                fileId = await uasApi.scriptUpload(client, script.input)
                script.path = ""
            }
            set({ script: script })

            //开始分镜
            let chapterObjects = await uasApi.scriptBoarding(client, fileId)
            console.info("chapters", chapterObjects)

            chapters = chapterObjects.map(cp => {
                return {
                    id: uuid(),
                    original: cp["original"] || "",
                    actors: cp["characters"] || [],
                    sceneDialogues: cp["dialogues"] || [],
                    sceneName: cp["scene"] || "",
                    sceneDescription: cp["description"] || ""
                } as Chapter
            })

        } else if (boardType === "line") {
            //换行 本地解析
            let scriptText = ""
            if (script.type === "file") {
                scriptText = await fs.readTextFile(script.path)
            } else {
                scriptText = script.input
            }

            let lines = scriptText.split("\n")
            chapters = lines.filter(line => line !== "").map(line => {
                return {
                    id: uuid(),
                    original: line.trim(),
                    actors: [] as string[],
                    sceneDialogues: [] as string[]
                } as Chapter
            })
        }
        return chapters
    }
}))






export interface ChaptersStorage {
    pid: string | undefined
    chapters: Chapter[] | undefined
    quit: () => Promise<void>
    load: (pid: string) => Promise<void>
    initializeChapters: (pid: string, chapters: Chapter[]) => Promise<void>
    addChapter: (idx: number, chapter: Chapter) => Promise<void>
    updateChapter: (idx: number, chapter: Chapter) => Promise<void>
    removeChapter: (idx: number) => Promise<void>
    saveChapters: () => Promise<void>
}


export const usePersistChaptersStorage = create<ChaptersStorage>((set, get) => ({
    pid: undefined,
    chapters: undefined,
    quit: async () => {
        set({ pid: undefined, chapters: undefined })
    },
    load: async (pid: string) => {
        //读取原始脚本
        let chaptersFile = await path.join(pid, "chapters.json")
        let exist = await fs.exists(chaptersFile, { dir: workspaceFileDirectory })
        if (!exist) {
            set({ pid: pid, chapters: [] })
            return
        }
        let chaptersJson = await fs.readTextFile(chaptersFile, { dir: workspaceFileDirectory })
        set({ ...JSON.parse(chaptersJson) })
    },
    initializeChapters: async (pid: string, chapters: Chapter[]) => {
        let chaptersFile = await path.join(pid, "chapters.json")

        //初始化文件
        let store = { pid: pid, chapters: chapters }
        set(store)
        return await fs.writeTextFile(chaptersFile, JSON.stringify(store, null, '\t'), { dir: workspaceFileDirectory, append: false })
    },
    addChapter: async (idx: number, chapter: Chapter) => {
        let stateChapters = [...get().chapters!]
        stateChapters.splice(idx, 0, chapter)
        set({ chapters: stateChapters })
    },
    updateChapter: async (idx: number, chapter: Chapter) => {
        let stateChapters = [...get().chapters!]
        stateChapters[idx] = chapter
        set({ chapters: stateChapters })
    },
    removeChapter: async (idx: number) => {
        let stateChapters = [...get().chapters!]
        stateChapters.splice(idx, 1)
        set({ chapters: stateChapters })
    },
    saveChapters: async () => {
        let store = get()
        let chaptersFile = await path.join(store.pid as string, "chapters.json")
        return await fs.writeTextFile(chaptersFile, JSON.stringify(store, null, '\t'), { dir: workspaceFileDirectory, append: false })
    },
    smartAnalyzing: async (uasApi: UserAssistantsApi, index: number, script: Script) => {

        let client: OpenAIClient = {
            api: new OpenAI({ baseURL: "https://wx.yryz3.com/aipainter-openai/v1", apiKey: "xxx", dangerouslyAllowBrowser: true, timeout: 60000 }),
            mode: "gpt-4-1106-preview"
        }
        let chapterText = get().chapters![index].original
        let newChapters = uasApi.chapterBoarding(client, script.fileId, chapterText)
        console.info(newChapters)
    }
}))


export interface ActorsStorage {
    pid: string | undefined
    actors: Actor[]
    quit: () => Promise<void>
    load: (pid: string) => Promise<void>
    addActor: () => Promise<void>
    updateActor: (idx: number, actor: Actor) => Promise<void>
    removeActor: (idx: number) => Promise<void>
    saveActors: (actors: Actor[]) => Promise<void>
}

//剧本角色
export const usePersistActorsStorage = create<ActorsStorage>((set, get) => ({
    pid: undefined,
    actors: [],
    quit: async () => {
        set({ pid: undefined, actors: [{ id: uuid(), name: "角色1", alias: "", style: "", traits: [] }] })
    },
    load: async (pid: string) => {
        //读取原始脚本
        let actorsFile = await path.join(pid, "actors.json")
        let exist = await fs.exists(actorsFile, { dir: workspaceFileDirectory })
        if (!exist) {

            //初始化文件
            let initJson = { pid: pid, actors: [{ id: uuid(), name: "角色1", alias: "", style: "", traits: [] }] }
            await fs.writeTextFile(actorsFile, JSON.stringify(initJson), { dir: workspaceFileDirectory, append: false })

            set(initJson)
            return
        }
        let actorsJson = await fs.readTextFile(actorsFile, { dir: workspaceFileDirectory })
        set({ ...JSON.parse(actorsJson) })
    },
    addActor: async () => {
        let stateActors = [...get().actors]
        stateActors.push({ id: uuid(), name: "角色" + (stateActors.length + 1), alias: "", style: "", traits: [] })
        set({ actors: stateActors })
    },
    updateActor: async (idx: number, actor: Actor) => {
        let stateActors = [...get().actors]
        stateActors[idx] = actor
        set({ actors: stateActors })
    },
    removeActor: async (idx: number) => {
        let stateActors = [...get().actors]
        stateActors.splice(idx, 1)
        set({ actors: stateActors })
    },
    saveActors: async (actors: Actor[]) => {

        let { pid } = get()
        set({ actors: [...actors] })

        //保存
        let store = get()
        let actorsFile = await path.join(pid as string, "actors.json")
        return await fs.writeTextFile(actorsFile, JSON.stringify(store, null, '\t'), { dir: workspaceFileDirectory, append: false })
    },
}))







