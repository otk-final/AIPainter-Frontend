import { fs } from "@tauri-apps/api"


export interface SRTLine {
    id?: number
    start_time: number
    end_time: number
    text: string
}







//转换为毫秒
let regex = /(\d+):(\d{2}):(\d{2}),(\d{3})/;
export const toTime = (val: any) => {
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

export const formatTime = (ms: number, sep: string) => {
    // 将毫秒数转换为秒数
    let seconds = Math.floor(ms / 1000);
    // 计算小时
    let hours = Math.floor(seconds / 3600);
    seconds %= 3600;
    // 计算分钟
    let minutes = Math.floor(seconds / 60);
    // 计算剩余秒数
    seconds %= 60;
    // 计算剩余毫秒数
    let milliseconds = ms % 1000;

    // 补零函数，确保时间格式为两位数
    const pad = (n: number) => {
        return n < 10 ? '0' + n : n;
    }
    // 补零函数，确保毫秒格式为三位数
    const pad3 = (n: number) => {
        return n < 100 ? '0' + (n < 10 ? '0' + n : n) : n;
    }
    // 将小时、分钟、秒、毫秒格式化为字符串
    let timeString = pad(hours) + ':' + pad(minutes) + ':' + pad(seconds) + sep + pad3(milliseconds);
    return timeString;
}