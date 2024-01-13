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
    load: (pid: string) => Promise<void>
    import: (script: Script) => Promise<void>
}


export interface ActorsStorage {
    pid: string | undefined
    actors: Actor[]
    load: (pid: string) => Promise<void>
    addActor: () => Promise<void>
    updateActor: (idx: number, actor: Actor) => Promise<void>
    removeActor: (idx: number) => Promise<void>
    saveActors: () => Promise<void>
}



const workspaceFileDirectory = BaseDirectory.AppLocalData



//剧本
export const usePersistScriptStorage = create<ScriptStorage>((set, get) => ({
    pid: undefined,
    script: undefined,
    load: async (pid: string) => {
        //读取原始脚本
        let scriptFile = await path.join(pid, "script.json")
        let exist = await fs.exists(scriptFile, { dir: workspaceFileDirectory })
        if (!exist) {
            set({ pid: pid })
            return
        }
        let scriptJson = await fs.readTextFile(scriptFile, { dir: workspaceFileDirectory })
        set({ ...JSON.parse(scriptJson) })
    },
    import: async (script: Script) => {
        //分镜
    }
}))



//剧本角色
export const usePersistActorsStorage = create<ActorsStorage>((set, get) => ({
    pid: undefined,
    actors: [{ name: "角色1", alias: "", style: "", features: [] }],
    load: async (pid: string) => {
        //读取原始脚本
        let actorsFile = await path.join(pid, "actors.json")
        let exist = await fs.exists(actorsFile, { dir: workspaceFileDirectory })
        if (!exist) {

            //初始化文件
            let initJson = { pid: pid, actors: [{ name: "角色1", alias: "", style: "", features: [] }] }
            await fs.writeTextFile(actorsFile, JSON.stringify(initJson), { dir: workspaceFileDirectory, append: false })

            set(initJson)
            return
        }
        let actorsJson = await fs.readTextFile(actorsFile, { dir: workspaceFileDirectory })
        set({ ...JSON.parse(actorsJson) })
    },
    addActor: async () => {
        let stateActors = [...get().actors]
        stateActors.push({ name: "角色" + (stateActors.length + 1), alias: "", style: "", features: [] })
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
    saveActors: async () => {
        let store = get()
        let actorsFile = await path.join(store.pid as string, "actors.json")
        return await fs.writeTextFile(actorsFile, JSON.stringify(store), { dir: workspaceFileDirectory, append: false })
    },
}))