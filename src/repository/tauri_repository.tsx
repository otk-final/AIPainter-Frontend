import { fs, path } from "@tauri-apps/api"
import { BaseDirectory } from "@tauri-apps/api/fs"
import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware";


export type Directory = string

export interface Repository<T> {
    load: (dir: Directory) => Promise<T>
    save: () => Promise<void>
}

export interface CRUDRepository<T> extends Repository<T> {
    items?: T[]
    addItem: (item: T) => Promise<void>
    delItem: (idx: number) => Promise<void>
    updateItem: (idx: number, item: T) => Promise<void>
    getItem: (idx: number) => Promise<T>
}


export abstract class BaseRepository<T> implements Repository<T> {

    setProxy: (T: any) => void
    getProxy: () => T
    constructor(repo: string, set: (T: any) => void, get: () => T) {
        this.setProxy = set
        this.getProxy = get
        this.repo = repo
    }

    private repo: string
    repoDir: Directory = "env"

    //目录
    abstract repoEmpty(): T | undefined

    abstract repoInitialization(thisData: T): void

    baseDir(): BaseDirectory {
        return BaseDirectory.AppLocalData
    }
    basePath = async () => {
        return await path.appLocalDataDir()
    }

    load = async (dir: Directory) => {
        this.repoDir = dir

        //目录是否存在
        if (!await fs.exists(this.repoDir, { dir: this.baseDir() })) {
            let emptyRepo = this.repoEmpty()
            this.setProxy(emptyRepo)
            return emptyRepo!
        }
        
        let filePath = this.repoDir + "/" + this.repo
        console.info('load script', filePath)

        //文件是否存在
        if (!await fs.exists(filePath, { dir: this.baseDir() })) {
            let emptyRepo = this.repoEmpty()
            this.setProxy(emptyRepo)
            return emptyRepo!
        }

        //read file
        let text = await fs.readTextFile(filePath, { dir: this.baseDir(), append: false })
        let thisData = JSON.parse(text) as T

        //初始化对象
        this.repoInitialization(thisData)

        //初始化状态
        this.setProxy(thisData)

        return thisData
    }
    save = async () => {
        //创建目录
        await fs.createDir(this.repoDir, { dir: this.baseDir(), recursive: true })
        let filePath = this.repoDir + "/" + this.repo

        // save file
        await fs.writeFile(filePath, JSON.stringify(this, null, "\t"), { dir: this.baseDir(), append: false })
    }
    saveImage = async (subfolder: string, filename: string, fileBuffer: ArrayBuffer) => {

        let outputDir = await path.join(this.repoDir as string, subfolder)
        await fs.createDir(outputDir, { dir: this.baseDir(), recursive: true })

        //保存图片
        let newImagePath = await path.join(outputDir, filename)
        await fs.writeBinaryFile(newImagePath, fileBuffer, { dir: this.baseDir(), append: false })

        //返回全路径
        return await path.join(await path.appLocalDataDir(), newImagePath)
    }

    reactived = async (save?: boolean) => {
        this.setProxy({ ...this })
        if (save) this.save()
    }
}

export const delay = (ms: number) => {
    return new Promise(resolve => { setTimeout(resolve, ms) });
}

export abstract class BaseCRUDRepository<Item, T> extends BaseRepository<T> {

    items: Item[] = []

    addItem = async (idx: number, item: Item) => {
        this.items.splice(idx, 0, item)
    }
    appendItem = async (item: Item) => {
        this.items.push(item)
    }
    delItem = async (idx: number) => {
        this.items.splice(idx, 1)
    }
    updateItem = async (idx: number, item: Item) => {
        this.items[idx] = item
    }
    reactiveItems = async (save?: boolean) => {
        this.setProxy({ items: this.items })
        //保存
        if (save) this.save()
    }
}

export interface ImitateFrame {
    name?: string
    path: string
}




class ImitateFrameRepository extends BaseCRUDRepository<ImitateFrame, ImitateFrameRepository> {

    repoEmpty(dir: string): ImitateFrameRepository {
        return this
    }



    pid?: string = "abcd"
    node: string = ""


    doImage = async () => {
        this.pid = "xxx123"

        await delay(2000)
        this.node = "第一步"
        this.reactived(false)
        await delay(2000)
        this.node = "第二步"
        this.reactived(false)
        await delay(2000)
        this.node = "第三步"


        this.appendItem({ path: "1233" })
        this.reactived(true)
    }
}

export const useImitateFrameTauriRepository = create<ImitateFrameRepository>()(subscribeWithSelector((set, get) => new ImitateFrameRepository("demo123.json", set, get)))




