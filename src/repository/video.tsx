import { KeyFragment } from "./draft_utils"
import { delay } from "./tauri_repository"
import tauri from "@tauri-apps/api/core"
import fs from "@tauri-apps/plugin-fs";
import shell from "@tauri-apps/plugin-shell"



//视频片段合成
export const ConcatFragments = async (concats_path: string, srt_path: string, video_path: string, out_path: string, fragments: KeyFragment[]) => {

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