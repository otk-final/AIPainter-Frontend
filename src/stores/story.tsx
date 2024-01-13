import { fs, path } from "@tauri-apps/api"
import { BaseDirectory } from "@tauri-apps/api/fs"
import { create } from "zustand"
import { v4 as uuid } from "uuid"

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
    id: string
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
    import: (script: Script) => Promise<Chapter[]>
}




const workspaceFileDirectory = BaseDirectory.AppLocalData


const mockChapters: Chapter[] = [
    {
        original: "原来这几年，七玄门和野狼帮的冲突更加厉害，双方为了几块说不清归属的富裕城镇打了大大小小的十几仗，都损失了不少的人手。因为野狼帮的帮众都是用训练马贼的一套训练出来的，一个个厮杀起来全不要命，见到血后就更加疯狂，而七玄门的弟子虽然武艺较高但没有那股狠劲，在拼杀中缩手缩脚，这样一来双方死伤更多的往往是后者。一连几场下来，七玄门的几位大人物再也坐不住了，把本门的大部分内门弟子全都派了出去，去参加双方接下来的一连串拼斗，一方面这几块地盘绝不能失，另一方面让弟子们也都见见江湖的残酷性，去磨练一番，长长实际的战斗经验。",
        prompts: "", actors: ["七玄门", "野狼帮"], description: "去参加双方接下来的一连串拼斗，一方面这几块地盘绝不能失，另一方面让弟子们也都见见江湖的残酷性", state: 1
    },
    {
        original: "韩立估计着墨大夫回山的时间，觉得他在附近的地方是不可能找到什么好的药材，他恐怕要去比较远的地方去寻找，很可能是要去那些人迹罕至的深山老林之处，只有那样的偏僻地方才有希望采得到一些稀有药材，但这样路上一来一回，再加上当中搜寻药材所花费的时间，最少也要花上近一年的光阴才能赶回山里。",
        prompts: "", actors: ["韩立", "墨大夫"], description: "搜寻药材所花费的时间", state: 1
    }
]



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
        //开始分镜

        //读取文件

        let scriptText = await fs.readTextFile(script.path)
        console.info(scriptText)
        //生成镜头文件
        set({ script: script })

        return [...mockChapters]
    }
}))


export interface ChaptersStorage {
    pid: string | undefined
    chapters: Chapter[] | undefined
    loadChapters: (pid: string) => Promise<void>
    initializeChapters: (pid: string, chapters: Chapter[]) => Promise<void>
    addChapter: (idx: number, chapter: Chapter) => Promise<void>
    updateChapter: (idx: number, chapter: Chapter) => Promise<void>
    removeChapter: (idx: number) => Promise<void>
    saveChapters: () => Promise<void>
}


export const usePersistChaptersStorage = create<ChaptersStorage>((set, get) => ({
    pid: undefined,
    chapters: undefined,
    loadChapters: async (pid: string) => {
        //读取原始脚本
        let chaptersFile = await path.join(pid, "chapters.json")
        let exist = await fs.exists(chaptersFile, { dir: workspaceFileDirectory })
        if (!exist) {
            set({ pid: pid })
            return
        }
        let chaptersJson = await fs.readTextFile(chaptersFile, { dir: workspaceFileDirectory })
        set({ ...JSON.parse(chaptersJson) })
    },
    initializeChapters: async (pid: string, chapters: Chapter[]) => {
        let chaptersFile = await path.join(pid, "chapters.json")

        //初始化文件
        let initJson = { pid: pid, chapters: chapters }
        set(initJson)
        return await fs.writeTextFile(chaptersFile, JSON.stringify(initJson), { dir: workspaceFileDirectory, append: false })
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
    }
}))


export interface ActorsStorage {
    pid: string | undefined
    actors: Actor[]
    loadActors: (pid: string) => Promise<void>
    addActor: () => Promise<void>
    updateActor: (idx: number, actor: Actor) => Promise<void>
    removeActor: (idx: number) => Promise<void>
    saveActors: () => Promise<void>
}

//剧本角色
export const usePersistActorsStorage = create<ActorsStorage>((set, get) => ({
    pid: undefined,
    actors: [{ id: uuid(), name: "角色1", alias: "", style: "", features: [] }],
    loadActors: async (pid: string) => {
        //读取原始脚本
        let actorsFile = await path.join(pid, "actors.json")
        let exist = await fs.exists(actorsFile, { dir: workspaceFileDirectory })
        if (!exist) {

            //初始化文件
            let initJson = { pid: pid, actors: [{ id: uuid(), name: "角色1", alias: "", style: "", features: [] }] }
            await fs.writeTextFile(actorsFile, JSON.stringify(initJson), { dir: workspaceFileDirectory, append: false })

            set(initJson)
            return
        }
        let actorsJson = await fs.readTextFile(actorsFile, { dir: workspaceFileDirectory })
        set({ ...JSON.parse(actorsJson) })
    },
    addActor: async () => {
        let stateActors = [...get().actors]
        stateActors.push({ id: uuid(), name: "角色" + (stateActors.length + 1), alias: "", style: "", features: [] })
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
        return await fs.writeTextFile(actorsFile, JSON.stringify(store, null, '\t'), { dir: workspaceFileDirectory, append: false })
    },
}))