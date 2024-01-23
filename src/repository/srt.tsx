import { subscribeWithSelector } from "zustand/middleware"
import { BaseCRUDRepository } from "./tauri_repository"
import { create } from "zustand"
import { fs } from "@tauri-apps/api"
import { KeyFrame } from "./simulate"
import { GPTAssistantsApi } from "./gpt"

export interface SRTImage {
    id: number
    name: string
    path: string
}


export interface SRTFrame {
    id: number
    startTime: {
        text: string
        second: number
    }
    endTime: {
        text: string
        second: number
    }
    content: string
    rewrite?: string
    images?: SRTImage[]
}


//转换为秒
var regex = /(\d+):(\d{2}):(\d{2}),(\d{3})/;
const toTime = (val: any) => {
    let parts = regex.exec(val);
    if (parts === null) {
        return 0;
    }

    let outs = [0, 0, 0, 0]
    for (let i = 1; i < 5; i++) {
        outs[i] = parseInt(parts[i], 10);
        if (isNaN(outs[i])) outs[i] = 0;
    }
    // hours + minutes + seconds + ms
    // return parts[1] * 3600000 + parts[2] * 60000 + parts[3] * 1000 + parts[4];
    // hours + minutes + seconds
    return outs[1] * 3600 + outs[2] * 60 + outs[3];
}


export class SRTFrameRepository extends BaseCRUDRepository<SRTFrame, SRTFrameRepository> {

    free(): SRTFrameRepository | undefined {
        return this
    }

    initialization = async (srtpath: string) => {

        //解析文件
        let srtText = await fs.readTextFile(srtpath)

        srtText = srtText.replace(/\r/g, '');
        var regex = /(\d+)\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/g;
        let srtLines = srtText.split(regex);
        srtLines.shift();

        for (let i = 0; i < srtLines.length; i += 4) {
            this.items.push({
                id: parseInt(srtLines[i].trim()),
                startTime: {
                    text: srtLines[i + 1].trim(),
                    second: toTime(srtLines[i + 1].trim())
                },
                endTime: {
                    text: srtLines[i + 2].trim(),
                    second: toTime(srtLines[i + 2].trim())
                },
                content: srtLines[i + 3].trim()
            } as SRTFrame);
        }

        this.sync()
    }

    //合并关键帧
    mergeKeyFrames = async (keyFrames: KeyFrame[]) => {
        this.items.forEach(item => {
            //根据关键帧所处的秒数,添加到字幕组中
            let ss = item.startTime.second
            let es = item.endTime.second
            let images = keyFrames.filter(frame => ss <= frame.id && frame.id < es).filter(frame => frame.path).map(frame => {
                return {
                    id: frame.id,
                    name: frame.name,
                    path: frame.path
                } as SRTImage
            })
            item.images = images
        })
        this.sync()
    }

    //重写台词
    aiRewriteContent = async (index: number, gptApi: GPTAssistantsApi) => {
        let rewrite = await gptApi.rewritePrompt(this.items[index].content)
        this.items[index].rewrite = rewrite
        this.sync()
    }

    batchRewriteContent = async () => {
    }
}

export const useSRTFrameRepository = create<SRTFrameRepository>()(subscribeWithSelector((set, get) => new SRTFrameRepository("srt.json", set, get)))
