import { create } from "zustand";
import { fs, path } from "@tauri-apps/api";
import { BaseDirectory } from "@tauri-apps/api/fs";
// import { persist, PersistStorage } from 'zustand/middleware/persist'
import { v4 as uuid } from "uuid"
export interface Project {
    id: string
    name: string,
    type: string,
    workPath: string
    step: string,
    createTime: string
}


export interface Workspaces {
    current?: Project
    projects: Project[]
    load: () => void
    remove: (id: string) => Promise<void>
    create: (type: string, name: string) => Promise<void>
    open: (target: Project) => Promise<void>
}


const workspaceFilePath = "env" + path.sep + "workspaces.json"
const workspaceFileDirectory = BaseDirectory.AppLocalData

export const usePersistWorkspaces = create<Workspaces>((set, get) => ({
    current: undefined,
    projects: [],
    load: async () => {
        //创建目录
        await fs.createDir("env", { dir: workspaceFileDirectory, recursive: true })

        //加载配置文件
        let exist = await fs.exists(workspaceFilePath, { dir: workspaceFileDirectory, append: true })
        if (!exist) {
            return
        }

        let jsonText = await fs.readTextFile(workspaceFilePath, {
            dir: workspaceFileDirectory
        })
        set({ projects: JSON.parse(jsonText) })
    },
    remove: async (id: string) => {

        let existAll = get().projects
        let newProjects = existAll.filter(e => e!.id !== id)

        //更新配置文件
        let ok = await fs.writeTextFile(workspaceFilePath, JSON.stringify(newProjects), {
            dir: workspaceFileDirectory,
            append: false
        })
        console.info(ok)

        //change state
        set({ projects: newProjects as [] })
    },
    create: async (type: string, name: string) => {

        //duplicate check
        let existAll = get().projects
        let existIdx = existAll.findIndex((e) => e!.type === type && e!.name === name)
        if (existIdx !== -1) {
            // throw new Error("project name is existed")
            return;
        }

        let workId = uuid()
        let workPath = await path.join(await path.appDataDir(), workId)
        let newProject: Project = {
            name: name,
            type: type,
            workPath: workPath,
            id: workId,
            step: "",
            createTime: ""
        }

        //创建项目目录
        let ok = await fs.createDir(workId, {
            dir: workspaceFileDirectory,
            recursive: true
        })
        console.info(ok)


        //更新配置文件
        existAll.unshift(newProject)
        ok = await fs.writeTextFile(workspaceFilePath, JSON.stringify(existAll), {
            dir: workspaceFileDirectory,
            append: false
        })
        //change state
        set({ current: newProject, projects: existAll })
    },
    open: async (target: Project) => {
        set({ current: target })
    }
}))