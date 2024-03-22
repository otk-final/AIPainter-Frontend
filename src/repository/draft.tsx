import { create } from "zustand"
import { BaseRepository } from "./tauri_repository"
import { subscribeWithSelector } from "zustand/middleware"

export const EFFECT_DIRECTIONS = [
    { label: "随机", value: "random" },
    { label: "从上往下", value: "up" },
    { label: "从下往上", value: "down" },
    { label: "从左往右", value: "left" },
    { label: "从右往左", value: "right" },
    { label: "默认", value: "default" },
]



export interface JYDraftConfiguration {
    video: {
        effect: string,
        fps: number
    }
    srt: {
        size: number,
        //文字颜色
        color: string,
        color_rgb: number[],
        //文字边框颜色
        border_color: string,
        border_color_rgb: number[],
    },
    draft_dir: string,
}


export class JYDraftRepository extends BaseRepository<JYDraftRepository> implements JYDraftConfiguration {

    free(): void {

    }

    video = {
        effect: "random",
        fps: 25,
    }
    srt = {
        size: 5,
        color: "#ffffff",
        color_rgb: [1.0, 1.0, 1.0],
        border_color: "#000000",
        border_color_rgb: [0, 0, 0]
    }
    draft_dir = ""

    formatEffectOrientation = (orientation: string) => {
        let x = orientation;
        if (x === "default") {
            //默认
            x = this.video.effect;
        }
        if (x === "random") {
            //随机
            let randomIdx = Math.floor(Math.random() * 4);
            return ["up", "down", "left", "right"][randomIdx];
        }
        return x;
    }
}


export const useJYDraftRepository = create<JYDraftRepository>()(subscribeWithSelector((set, get) => new JYDraftRepository("jydraft.json", set, get)))