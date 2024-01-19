import { fs, path } from "@tauri-apps/api"
import { BaseDirectory } from "@tauri-apps/api/fs"
import { create } from "zustand"
import { GPTAssistantsApi } from "./gpt"


export type ImportType = "input" | "file"

export interface Script {
    fileId: string
    path: string,
    input: string
    type: ImportType
}


export interface Chapter {
    id: number
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

export interface ScriptStorage {
    pid: string | undefined
    script: Script | undefined
    quit: () => Promise<void>
    load: (pid: string) => Promise<void>
    startBoarding: (uasApi: GPTAssistantsApi, boardType: string, script: Script) => Promise<Chapter[]>
}


const workspaceFileDirectory = BaseDirectory.AppLocalData
//剧本
export const usePersistScriptStorage = create<ScriptStorage>((set, get) => ({
    pid: undefined,
    script: undefined,
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
    startBoarding: async (gptApi: GPTAssistantsApi, boardType: string, script: Script) => {

        let chapters: Chapter[] = []
        if (boardType === "ai") {
            //ai  上传剧本
            let fileId = ""
            if (script.type === "file") {
                let fileName = await path.basename(script.path)
                fileId = await gptApi.fileUpload(fileName, script.path)
            } else {
                fileId = await gptApi.scriptUpload(script.input)
                script.path = ""
            }
            set({ script: script })

            //开始分镜
            let chapterObjects = await gptApi.scriptBoarding(fileId)
            console.info("chapters", chapterObjects)

            chapters = chapterObjects.flatMap((cp, idx) => {
                return {
                    id: idx,
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
            chapters = lines.filter(line => line !== "").map((line, idx) => {
                return {
                    id: idx,
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



const saveChapters = async (pid: string, chapters: Chapter[]) => {
    let chaptersFile = await path.join(pid, "chapters.json")
    let store = { pid: pid, chapters: chapters }
    return await fs.writeTextFile(chaptersFile, JSON.stringify(store, null, '\t'), { dir: workspaceFileDirectory, append: false })
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

        //状态
        let store = { pid: pid, chapters: chapters }
        set(store)

        //存储文件
        return saveChapters(pid, chapters)
    },
    addChapter: async (idx: number, chapter: Chapter) => {
        let { pid, chapters } = get()

        //状态
        let stateChapters = [...chapters!]
        stateChapters.splice(idx, 0, chapter)
        set({ chapters: stateChapters })

        //存储文件
        return saveChapters(pid!, stateChapters)
    },
    updateChapter: async (idx: number, chapter: Chapter) => {

        let { pid, chapters } = get()

        //状态
        let stateChapters = [...chapters!]
        stateChapters[idx] = chapter
        set({ chapters: stateChapters })

        //存储文件
        return saveChapters(pid!, stateChapters)
    },
    removeChapter: async (idx: number) => {
        let { pid, chapters } = get()

        //状态
        let stateChapters = [...chapters!]
        stateChapters.splice(idx, 1)
        set({ chapters: stateChapters })

        //存储文件
        return saveChapters(pid!, stateChapters)
    },
    saveChapters: async () => {
        let store = get()
        let chaptersFile = await path.join(store.pid as string, "chapters.json")
        return await fs.writeTextFile(chaptersFile, JSON.stringify(store, null, '\t'), { dir: workspaceFileDirectory, append: false })
    }
}))

