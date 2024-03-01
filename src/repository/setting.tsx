import { create } from "zustand"
import { BaseRepository } from "./tauri_repository"
import { AudioOption } from "./tts_api"
import { subscribeWithSelector } from "zustand/middleware"



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