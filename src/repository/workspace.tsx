import { create } from "zustand"
import { BaseCRUDRepository, ItemIdentifiable } from "./tauri_repository"
import { subscribeWithSelector } from "zustand/middleware"
import { ComfyUIImageDimensions } from "@/api/comfyui_api"


export interface Project extends ItemIdentifiable {
    id: string
    name: string,
    type: string,
    workPath: string
    step: string,
    createTime: string

    //绘图比例
    dimensions?: ComfyUIImageDimensions
}

export class ProjectRepository extends BaseCRUDRepository<Project, ProjectRepository> {
}

export const useProjectRepository = create<ProjectRepository>()(subscribeWithSelector((set, get) => new ProjectRepository("workspace.json", set, get)))
