import { fs, path, shell } from "@tauri-apps/api";
import { BaseDirectory } from "@tauri-apps/api/fs";
import { create } from "zustand";




export interface ImtateStorage {
    pid: string | undefined
    videoPath?: string | undefined
    videoPayload?: any
    isRunning: boolean
    load: (pid: string) => Promise<void>
    importVideo: (videoPath: string) => Promise<void>
    startCollectFrames: () => Promise<void>
}

const workspaceFileDirectory = BaseDirectory.AppLocalData
export const usePersistImtateStorage = create<ImtateStorage>((set, get) => ({
    pid: undefined,
    videoPath: undefined,
    videoPayload: {},
    isRunning: false,
    load: async (pid: string) => {
        //读取原始脚本
        let scriptFile = await path.join(pid, "imtate.json")
        let exist = await fs.exists(scriptFile, { dir: workspaceFileDirectory })
        if (!exist) {
            set({ pid: pid })
            return
        }
        let scriptJson = await fs.readTextFile(scriptFile, { dir: workspaceFileDirectory })
        set({ ...JSON.parse(scriptJson) })
    },
    importVideo: async (videoPath: string) => {
        //解析视频参数
        let cmd = shell.Command.sidecar('bin/ffprobe', [
            "-v", "quiet",
            "-show_streams",
            "-select_streams", "0",
            "-output_format", "json",
            "-i", videoPath
        ])
        let output = await cmd.execute()
        set({ videoPath: videoPath, videoPayload: JSON.parse(output.stdout) })

        //save file
        let store = get()
        let imtateFile = await path.join(store.pid as string, "imtate.json")
        return await fs.writeTextFile(imtateFile, JSON.stringify(store, null, '\t'), { dir: workspaceFileDirectory, append: false })

    },
    startCollectFrames: async () => {
        let { pid, isRunning, videoPath } = get()
        if (isRunning) {
            throw new Error("isRunning")
        }

        //删除原目录下所有文件
        let framesDir = await path.join(pid!, "frames")
        await fs.createDir(framesDir, { dir: workspaceFileDirectory, recursive: true })

        //存储目录
        let framesPath = await path.join(await path.appLocalDataDir(), framesDir, "%05d.png")
        //抽帧 关键帧
        let cmd = shell.Command.sidecar("bin/ffmpeg", [
            "-i", videoPath!,
            "-vf", 'select=eq(pict_type\\,I)',
            "-vsync", "vfr",
            "-qscale:v", "10",
            "-f", "image2",
            framesPath
        ])
        let output = await cmd.execute()
        console.info(output.stderr)
        console.info(output.stdout)
        //生成文件

        let store = get()
        let imtateFile = await path.join(store.pid as string, "imtate.json")
        return await fs.writeTextFile(imtateFile, JSON.stringify(store, null, '\t'), { dir: workspaceFileDirectory, append: false })
    }
}))


export interface ImtateFrame {
    idx: number
    name: string,
    path: string,
    drawPrompt?: string
    drawImage?: string
    drawImageHistory?: string[]
    drawConfig?: any
}


export interface ImtateFramesStorage {
    pid: string | undefined
    frames: ImtateFrame[]
    load: (pid: string) => Promise<void>
    updateFrame: (idx: number, frame: ImtateFrame) => Promise<void>
}

export const usePersistImtateFramesStorage = create<ImtateFramesStorage>((set, get) => ({
    pid: undefined,
    frames: [],
    load: async (pid: string) => {
        //读取原始脚本
        let scriptFile = await path.join(pid, "frames.json")
        let exist = await fs.exists(scriptFile, { dir: workspaceFileDirectory })
        if (!exist) {
            //读取文件夹下数据
            let frameDir = await path.join(pid, "frames")
            let frameImageFiles = await fs.readDir(frameDir, {
                dir: workspaceFileDirectory,
                recursive: false
            })
            let imtateFrames = frameImageFiles.map(file => {
                let seq = file.name?.substring(0, file.name.lastIndexOf("."))
                return {
                    idx: Number.parseInt(seq!),
                    name: file.name,
                    path: file.path,
                } as ImtateFrame
            })
            //sort
            imtateFrames.sort((a, b) => a.idx - b.idx)
            set({ pid: pid, frames: imtateFrames })
            return
        }
        let scriptJson = await fs.readTextFile(scriptFile, { dir: workspaceFileDirectory })
        set({ ...JSON.parse(scriptJson) })
    },
    //更新
    updateFrame: async (idx: number, frame: ImtateFrame) => {
        let { frames } = get()

        let stateFrames = [...frames]
        stateFrames[idx] = frame
        set({ frames: stateFrames })
    },

    saveFrames: async () => {
        let store = get()
        let imtateFile = await path.join(store.pid as string, "frames.json")
        return await fs.writeTextFile(imtateFile, JSON.stringify(store, null, '\t'), { dir: workspaceFileDirectory, append: false })
    }
}))