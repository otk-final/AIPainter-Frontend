import { fs,shell, tauri } from "@tauri-apps/api"
import { ComfyUIRepository } from "./comfyui"
import { Text2ImageHandle, WFScript } from "./comfyui_api"
import { KeyFragment } from "./drafts"
import { delay } from "./tauri_repository"


export type ImageGenerateCallback = (idx: number, fileBuffer: ArrayBuffer) => Promise<string>

//图片生成
export const ImageGenerate = async (prompt: string, style: string, comyuiRepo: ComfyUIRepository, callback: ImageGenerateCallback) => {

    //comyui api
    let api = await comyuiRepo.newClient()
    let text = await comyuiRepo.buildModePrompt(style)
    let script = new WFScript(text)

    //生成随机
    let seed: number = await tauri.invoke('seed_random', {})
    //add prompt task
    let { promptId, promptResult } = await api.prompt(script,
        {
            seed: seed,
            positive: [comyuiRepo.positivePrompt, prompt].join(""),
            negative: comyuiRepo.negativePrompt || ""
        }, Text2ImageHandle)

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