import { create } from "zustand"
import { BaseRepository } from "./tauri_repository"
import { AudioOption } from "./tts_api"
import { subscribeWithSelector } from "zustand/middleware"

export const EFFECT_DIRECTIONS = [
    { label: "默认", value: "default" },
    { label: "从上往下", value: "up" },
    { label: "从下往上", value: "down" },
    { label: "从左往右", value: "left" },
    { label: "从右往左", value: "right" },
    { label: "随机", value: "random" },
]


export interface BaisicSettingConfiguration {
    audio: {
        speed: number,
        volume: number,
        option: AudioOption
    }
    video: {
        effect: string,
        frame: number
    }
    srt: {
        font: number,
        size: number,
        color: number,
    },
    draft_dir: string,
}


export class BaisicSettingRepository extends BaseRepository<BaisicSettingRepository> implements BaisicSettingConfiguration {
    audio = {
        speed: 10,
        volume: 20,
        option: {
            voice_classify: "3",
            voice_type: "BV437_streaming",
            emotion: "xiasha",
        }
    }
    video = {
        effect: "up",
        frame: 30,
    }
    srt = {
        font: 1,
        size: 2,
        color: 3,
    }
    draft_dir = ""

    free() {

    }

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


export const useBaisicSettingRepository = create<BaisicSettingRepository>()(subscribeWithSelector((set, get) => new BaisicSettingRepository("basic-setting.json", set, get)))