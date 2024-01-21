import { create } from "zustand"
import { BaseCRUDRepository, Directory } from "./tauri_repository"
import { subscribeWithSelector } from "zustand/middleware"


export interface Project {
    id: string
    name: string,
    type: string,
    workPath: string
    step: string,
    createTime: string
}

export class ProjectRepository extends BaseCRUDRepository<Project, ProjectRepository> {
    
    repoInitialization(thisData: ProjectRepository):void {
        this.items = thisData.items
    }

    repoEmpty(): ProjectRepository {
        return this
    }
}

export const useProjectRepository = create<ProjectRepository>()(subscribeWithSelector((set, get) => new ProjectRepository("workspace.json", set, get)))
