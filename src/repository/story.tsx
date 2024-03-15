import { subscribeWithSelector } from "zustand/middleware"
import { BaseRepository } from "./tauri_repository"
import { create } from "zustand"


import { GPTAssistantsApi } from "@/api/gpt_api";
import { Chapter } from "./chapter";
import { readTextFile } from "@tauri-apps/plugin-fs";

export type ImportType = "input" | "file"

export type BoardType = "ai" | "line"

export interface Script {
    fileId: string
    path: string
    input: string
    type: ImportType
}


export interface ChapterBoardingOutput {
    //剧本
    original?: string,
    //场景
    scene: string,
    //角色集
    characters: string[],
    //场景描述
    description: string,
    //台词集
    dialogues: string[]
}

//剧本
export class ScriptRepository extends BaseRepository<ScriptRepository> {

    repoInitialization(thisData: ScriptRepository): void {
        this.fileId = thisData.fileId
        this.path = thisData.path
        this.input = thisData.input
        this.importType = thisData.importType
        this.boardType = thisData.boardType
    }

    free() {
        this.fileId = undefined
        this.path = undefined
        this.input = undefined
        this.importType = undefined
        this.boardType = undefined
    }


    fileId?: string
    path?: string
    input?: string
    importType?: ImportType
    boardType?: BoardType

    //分镜
    boardWithAi = async (importType: ImportType, path: string, text: string) => {
        let gptApi = new GPTAssistantsApi()
        this.boardType = "ai"
        //上传文本
        if (importType === "file") {
            this.fileId = await gptApi.fileUpload("file", path)
            this.path = path
        } else {
            this.fileId = await gptApi.scriptUpload("", text)
            this.input = text
        }

        //添加分镜
        let chapterObjects = await gptApi.scriptBoarding(this.fileId)
        return chapterObjects.flatMap((message, idx) => {
            let record = message as ChapterBoardingOutput
            return {
                id: idx,
                name: "",
                draft: record.original!,
                scene: record.scene,
                description: record.description,
                srt: record.dialogues.join(","),
                actors: record.characters,
                image: {
                    history: [] as string[]
                },
                effect: { orientation: "random" }
            } as Chapter
        })
    }

    boardWithLine = async (importType: ImportType, path: string, text: string) => {
        this.boardType = "line"
        //换行 本地解析
        let scriptText = ""
        if (importType === "file") {
            scriptText = await readTextFile(path)
            this.path = path
        } else {
            scriptText = text
            this.input = text
        }

        let lines = scriptText.split("\n")
        return lines.filter(line => line !== "").map((line, idx) => {
            return {
                id: idx,
                name: "",
                draft: line.trim(),
                scene: "",
                description: "",
                dialogue: "",
                actors: [],
                image: {
                    history: [] as string[]
                },
                effect: { orientation: "random" }
            } as Chapter
        })
    }

}
export const useScriptRepository = create<ScriptRepository>()(subscribeWithSelector((set, get) => new ScriptRepository("script.json", set, get)))






