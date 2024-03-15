import { subscribeWithSelector } from "zustand/middleware"
import { BaseCRUDRepository, ItemIdentifiable } from "./tauri_repository"
import { create } from "zustand"

import { ComfyUIRepository } from "./comfyui"
import { v4 as uuid } from "uuid"
import { AudioOption, DEFAULT_AUDIO_OPTION } from "../api/bytedance_api"
import { ApiPrompt, ComfyUIApi } from "@/api/comfyui_api"


export interface Actor extends ItemIdentifiable {
    id: string
    name: string
    alias: string
    style: string
    image?: string
    voice?: AudioOption
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


export class ActorRepository extends BaseCRUDRepository<Actor, ActorRepository> {

    override free() {
        this.items = [{ id: uuid(), name: "角色1", alias: "角色1", style: "", traits: [], voice: { ...DEFAULT_AUDIO_OPTION } }]
    }

    //初始化
    initialization = async (newActors: Actor[]) => {
        this.items.push(...newActors)
        this.sync()
    }

    mergeActors = async (newActors: string[]) => {
        for (let i = 0; i < newActors.length; i++) {
            let exist = this.items.some(actor => actor.alias === newActors[i])
            if (exist) {
                continue
            }
            this.items.push({ id: uuid(), name: newActors[i], alias: newActors[i], style: "", traits: [] })
        }
        this.sync()
    }

    handleConfirmTraitsOption = async (index: number, traits: TraitsOption[]) => {
        this.items[index].traits = [...traits]
        this.sync()
    }

    //生成图片
    handleGenerateImage = async (traits: TraitsOption[], comyuiRepo: ComfyUIRepository) => {

        // this.items[index]
        let prompt = traits.map(item => item.value).join(",")
        let api = new ComfyUIApi(uuid())
        
        //加载脚本
        let style = comyuiRepo.generates[0].name
        let text = await comyuiRepo.buildModePrompt(style)
        let script = new ApiPrompt(text)

        //生成图片
        let outputs = await comyuiRepo.generateImage(script, prompt)

        //下载图片
        let downloads = [] as string[]
        for (let i = 0; i < outputs.length; i++) {
            //相对路径
            let savepath = "image-outputs/" + uuid() + outputs[i].filename;
            //下载图片并存储
            await api.download(outputs[i], await this.absulotePath(savepath))
            downloads.push(savepath);
        }

        //渲染页面
        return downloads[0]
    }

    toPrompt = (checkActors: string[]) => {
        return this.items.filter(item => checkActors.indexOf(item.alias) !== -1).map(item => {
            return item.traits.map(f => f.value).join(",")
        }).join(";")
    }
}

export const useActorRepository = create<ActorRepository>()(subscribeWithSelector((set, get) => new ActorRepository("actors.json", set, get)))
