import { fs, path } from "@tauri-apps/api"
import { BaseDirectory } from "@tauri-apps/api/fs"
import { create } from "zustand"

export interface Actor {
    id: number
    name: string
    alias: string
    style: string
    image?: string
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




export interface ActorsStorage {
    pid: string | undefined
    actors: Actor[]
    quit: () => Promise<void>
    load: (pid: string) => Promise<void>
    addActor: () => Promise<void>
    updateActor: (idx: number, actor: Actor) => Promise<void>
    removeActor: (idx: number) => Promise<void>
    saveActors: () => Promise<void>
    saveActorImage: (idx: number, fileName: string, fileBuffer: ArrayBuffer) => Promise<string>
}



const workspaceFileDirectory = BaseDirectory.AppLocalData
//剧本角色
export const usePersistActorsStorage = create<ActorsStorage>((set, get) => ({
    pid: undefined,
    actors: [],
    quit: async () => {
        set({ pid: undefined })
    },
    load: async (pid: string) => {
        //读取原始脚本
        let actorsFile = await path.join(pid, "actors.json")
        let exist = await fs.exists(actorsFile, { dir: workspaceFileDirectory })
        if (!exist) {
            set({ pid: pid, actors: [{ id: 1, name: "角色1", alias: "", style: "", traits: [] }] })
            return
        }
        let actorsJson = await fs.readTextFile(actorsFile, { dir: workspaceFileDirectory })
        set({ ...JSON.parse(actorsJson) })
    },
    addActor: async () => {

        let { actors } = get()

        //状态
        let stateActors = [...actors!]
        stateActors.push({ id: stateActors.length + 1, name: "角色" + (stateActors.length + 1), alias: "", style: "", traits: [] })
        set({ actors: stateActors })

    },
    updateActor: async (idx: number, actor: Actor) => {

        let { actors } = get()

        //状态
        let stateActors = [...actors!]
        stateActors[idx] = actor
        set({ actors: stateActors })

    },
    removeActor: async (idx: number) => {
        let { actors } = get()

        //状态
        let stateActors = [...actors!]
        stateActors.splice(idx, 1)
        set({ actors: stateActors })
    },
    saveActors: async () => {
        let { pid, actors } = get()

        let actorsFile = await path.join(pid!, "actors.json")
        let store = { pid: pid, actors: actors }
        return await fs.writeTextFile(actorsFile, JSON.stringify(store, null, '\t'), { dir: workspaceFileDirectory, append: false })
    },
    saveActorImage: async (idx: number, fileName: string, fileBuffer: ArrayBuffer) => {
        let { pid } = get()

        //创建目录
        let outputDir = await path.join(pid as string, "outputs")
        await fs.createDir(outputDir, {
            dir: workspaceFileDirectory, recursive: true
        })

        //保存图片
        let newFramePath = await path.join(outputDir, fileName)
        await fs.writeBinaryFile(newFramePath, fileBuffer, { dir: workspaceFileDirectory, append: false })

        //返回全路径
        return await path.join(await path.appLocalDataDir(), newFramePath)
    }
}))