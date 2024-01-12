import { fs, path } from "@tauri-apps/api"
import { BaseDirectory } from "@tauri-apps/api/fs"
import { create } from "zustand"

export interface Script {
    boardType: string,
    path: string
    format: string,
}

export interface Chapter {
    original: string
    prompts: string
    actors: string[]
    description: string
    state: number
}

export interface Actor {
    name: string
    alias: string
    style: string
    features: ActorPromptValue[]
}

export interface ActorPromptValue {
    key: string
    cn: string
    en: string
    weight: string
}



export interface ScriptStorage {
    pid: string | undefined
    script: Script | undefined
    chapters: Chapter[]
    actors: Actor[]
    load: (pid: string) => Promise<void>
    import: (script: Script) => Promise<void>
    remove: (idx: number) => Promise<void>
}


const workspaceFileDirectory = BaseDirectory.AppLocalData
export const usePersistScriptStorage = create<ScriptStorage>((set, get) => ({
    pid: undefined,
    script: undefined,
    chapters: [],
    actors: [],
    load: async (pid: string) => {
        //读取原始脚本
        let worksetting = await path.join(pid, "script.json")
        let exist = await fs.exists(worksetting, { dir: workspaceFileDirectory })
        if (!exist) {
            set({ pid: pid })
            return
        }
        let scriptJson = await fs.readTextFile(worksetting, { dir: workspaceFileDirectory })
        set({ ...JSON.parse(scriptJson) })
    },
    import: async (script: Script) => {

        // await new Promise((resolve) => setTimeout(resolve, 3000))
        //解析 分镜
        let importText = await fs.readTextFile(script.path)
        console.info(importText)

        //角色信息


        //镜头信息

        set({
            script: script,
            chapters: [
                { original: "xx", prompts: "谢谢", actors: ["张三"], state: 1, description: "带我去" },
                { original: "xx", prompts: "谢谢", actors: ["张三"], state: 1, description: "带我去" }
            ]
        })
    },
    remove: async (idx: number) => {

    },
}))