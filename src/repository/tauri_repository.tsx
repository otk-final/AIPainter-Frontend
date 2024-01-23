import { fs, path } from "@tauri-apps/api"
import { BaseDirectory } from "@tauri-apps/api/fs"
import { create } from "zustand"
import { subscribeWithSelector } from "zustand/middleware";


export type Directory = string




export abstract class BaseRepository<T> {

    setHold: (T: any, noshallow?: boolean) => void
    getHold: () => T
    constructor(repo: string, set: (T: any, noshallow?: boolean) => void, get: () => T) {
        this.setHold = set
        this.getHold = get
        this.repo = repo
    }

    private repo: string

    repoDir: Directory = "env"

    //目录
    protected abstract free(): void

    baseDir(): BaseDirectory {
        return BaseDirectory.AppLocalData
    }
    basePath = async () => {
        return await path.appLocalDataDir()
    }


    load = async (dir: Directory) => {
        this.free()

        this.repoDir = dir
        //目录是否存在
        if (!await fs.exists(this.repoDir, { dir: this.baseDir() })) {
            this.setHold(this, true)
            return
        }

        let filePath = this.repoDir + "/" + this.repo
        console.info('load script', filePath)

        //文件是否存在
        if (!await fs.exists(filePath, { dir: this.baseDir() })) {
            this.setHold(this, true)
            return
        }

        //read file
        let text = await fs.readTextFile(filePath, { dir: this.baseDir(), append: false })
        let thisData = JSON.parse(text) as Partial<T>


        console.info(this)
        //属性赋值
        Object.assign(this, thisData)

        //初始化状态
        this.setHold({ ...thisData })
    }



    reload = async (thisData: Partial<T>) => {

        //变更对象
        Object.assign(this, thisData)

        //变更状态
        this.setHold({ ...thisData })

        //保持文件
        await this.save()
    }


    //同步状态 + 保存文件
    sync = async () => {

        //变更状态
        this.setHold({ ...this })

        //保存文件
        await this.save()
    }

    //保存文件
    protected save = async () => {
        //创建目录
        await fs.createDir(this.repoDir, { dir: this.baseDir(), recursive: true })
        let filePath = this.repoDir + "/" + this.repo

        console.info('write script', filePath)


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
}

export const delay = (ms: number) => {
    return new Promise(resolve => { setTimeout(resolve, ms) });
}

export interface ItemIdentifiable {
    id: any
}


export abstract class BaseCRUDRepository<Item extends ItemIdentifiable, T> extends BaseRepository<T> {

    items: Item[] = []
    free(): void {
        this.items = []
    }
    addItem = async (idx: number, item: Item, temporary?: boolean) => {
        this.items.splice(idx, 0, item)
        this.setHold({ items: [...this.items] })
        if (!temporary) await this.save()
    }
    appendItem = async (item: Item, persisted?: boolean) => {
        this.items.push(item)
        this.setHold({ items: [...this.items] })
        if (persisted) await this.save()
    }
    delItem = async (idx: number, persisted?: boolean) => {
        this.items.splice(idx, 1)
        this.setHold({ items: [...this.items] })
        if (persisted) await this.save()
    }
    updateItem = async (idx: number, item: Item, persisted?: boolean) => {
        this.items[idx] = item
        this.setHold({ items: [...this.items] })
        if (persisted) await this.save()
    }
    lazyUpdateItem = async (idx: number, item: Item) => {
        this.items[idx] = item
    }
    assignItem = async (idx: number, item: any, persisted?: boolean) => {
        Object.assign(this.items[idx], item)
        if (persisted) await this.save()
    }
    incrItemId = () => {
        let lasted = this.items[this.items.length - 1]
        return lasted.id + 1
    }
}


