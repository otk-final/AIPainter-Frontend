import { fs } from "@tauri-apps/api"


export interface SRTLine {
    id?: number
    start_time: number
    end_time: number
    text: string
}







//转换为毫秒
let regex = /(\d+):(\d{2}):(\d{2}),(\d{3})/;
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
    return outs[1] * 360000 + outs[2] * 60000 + outs[3] * 1000 + outs[4];

    // hours + minutes + seconds
    // return outs[1] * 3600 + outs[2] * 60 + outs[3];
}

export const fileConvertLines = async (srtpath: string) => {

    //解析文件
    let srtText = await fs.readTextFile(srtpath)

    srtText = srtText.replace(/\r/g, '');
    let regex = /(\d+)\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/g;
    let srtLines = srtText.split(regex);
    srtLines.shift();

    let srtContent = []
    for (let i = 0; i < srtLines.length; i += 4) {
        srtContent.push({
            id: parseInt(srtLines[i].trim()),
            start_time: toTime(srtLines[i + 1].trim()),
            end_time: toTime(srtLines[i + 2].trim()),
            text: srtLines[i + 3].trim()
        } as SRTLine);
    }
    return srtContent as SRTLine[]
}