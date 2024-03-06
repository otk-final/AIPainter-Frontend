import { fs, shell, tauri } from "@tauri-apps/api"
import { ComfyUIRepository } from "./comfyui"
import { ComfyUIApi, ImageFileParams, Text2ImageHandle, Text2ImageParams, WFScript } from "./comfyui_api"
import { KeyFragment } from "./draft_utils"
import { delay } from "./tauri_repository"
import { SRTLine, formatTime } from "./srt"


export type ImageGenerateCallback = (idx: number, fileBuffer: ArrayBuffer) => Promise<string>
export type ImageUploadCallback = (api: ComfyUIApi) => Promise<ImageFileParams>



export interface KeyImage {
    id: number,
    scale: number,
    image_path: string,
    output_name: string,
    output_path: string,
}

export const ImageScale = async (images: KeyImage[]) => {
    return await tauri.invoke('key_image_scale', { parameters: images }) as KeyImage[]
}


//图片生成
export const ImageGenerate = async (prompt: string, style: string, image_pixel: string, comyuiRepo: ComfyUIRepository, callback: ImageGenerateCallback, upload?: ImageUploadCallback) => {

    //comyui api
    let api = await comyuiRepo.newClient()
    let text = await comyuiRepo.buildModePrompt(style)
    let script = new WFScript(text)

    //判断流程中是否需要自定义宽高

    //生成随机
    let seed: number = await tauri.invoke('seed_random', {})
    let parms = { seed: seed, positive: [comyuiRepo.positivePrompt, prompt].join(""), negative: comyuiRepo.negativePrompt || "", image_pixel: image_pixel } as Text2ImageParams

    //兼容有参考图片流程
    if (script.hasInputImageStep()) {
        if (!upload) {
            throw new Error("required upload image")
        }
        parms.image = await upload!(api)
    }

    //add prompt task
    let { promptId, promptResult } = await api.prompt(script, parms, Text2ImageHandle)
    //获取 当前流程中 输出图片节点位置
    let step = script.getOutputImageStep()


    //下载文件
    let outpaths = [] as string[]
    let images = promptResult[promptId]!.outputs![step].images
    for (let i = 0; i < images.length; i++) {
        let imageItem = images[i] as { filename: string, subfolder: string, type: string }
        //保存
        let fileBuffer = await api.download(promptId, imageItem.subfolder, imageItem.filename)
        //回调
        let filepath = await callback(i, fileBuffer);
        outpaths.push(filepath)
    }
    return outpaths;
}

//字幕生成
export const SRTGenerate = async (srtfile: string, fragments: KeyFragment[]) => {
    let srts = []
    for (let i = 0; i < fragments.length; i++) {
        let item = fragments[i]
        let srt = {
            id: srts.length + 1,
            start_time: srts.length === 0 ? 0 : srts[srts.length - 1].end_time,
            end_time: srts.length === 0 ? (item.duration * 1) : srts[srts.length - 1].start_time + (item.duration * 1),
            text: item.srt
        } as SRTLine
        srts.push(srt)
    }
    let strText = srts.map((item, idx) => {
        let line =
            (idx + 1) + "\n"
            + formatTime(item.start_time, ",") + " --> " + formatTime(item.end_time, ",") + "\n"
            + (item.text || '') + "\n"
        return line
    }).join("\n")
    await fs.writeTextFile(srtfile, strText, { append: false })
}

//视频片段合成
export const VideoFragmentConcat = async (concats_path: string, srt_path: string, video_path: string, out_path: string, fragments: KeyFragment[]) => {

    //批量生产原始视频片段
    let results: KeyFragment[] = await tauri.invoke("key_video_generate", { parameters: fragments })

    //生成拼接文件
    let concats_content: string[] = results.map(i => "file " + "'" + i.video_path + "'")
    await fs.writeTextFile(concats_path, concats_content.join("\n"), { append: false })

    //1合成视频
    let cmd = shell.Command.sidecar("bin/ffmpeg", [
        "-y",
        "-f", "concat",
        "-safe", "0",
        "-i", concats_path,     //目标视频
        "-c", "copy",
        video_path              //视频
    ])
    let output = await cmd.execute()
    console.info(output.stderr)
    console.info(output.stdout)

    await delay(2000)

    //2导入字幕 
    cmd = shell.Command.sidecar("bin/ffmpeg", [
        "-y",
        "-i", video_path,    //目标视频
        "-i", srt_path,         //目标字幕
        "-c", "copy",
        "-c:s", "mov_text",
        "-metadata:s:s:0",
        "language=chi_eng",
        out_path                //视频
    ])
    output = await cmd.execute()
    console.info(output.stderr)
    console.info(output.stdout)

    return out_path;
}