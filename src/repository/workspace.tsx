import { create } from "zustand"
import { BaseCRUDRepository, ItemIdentifiable } from "./tauri_repository"
import { subscribeWithSelector } from "zustand/middleware"


export interface Project extends ItemIdentifiable {
    id: string
    name: string,
    type: string,
    workPath: string
    step: string,
    createTime: string

    //绘图比例
    canvas_size?: {
        height: number,
        width: number
    }
}

export class ProjectRepository extends BaseCRUDRepository<Project, ProjectRepository> {
}

export const useProjectRepository = create<ProjectRepository>()(subscribeWithSelector((set, get) => new ProjectRepository("workspace.json", set, get)))
