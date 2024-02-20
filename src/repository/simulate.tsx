import { create } from "zustand"
import { BaseRepository, delay } from "./tauri_repository"
import { subscribeWithSelector } from "zustand/middleware"
import { fs, path, shell, tauri } from "@tauri-apps/api"
import { KeyFrame } from "./keyframe"
import { TTSApi } from "./tts_api"
import { SRTLine, formatTime } from "./srt"

interface KeyFrameJob {
    idx: number,
    name: string,

    //参数
    input: string,
    ss: string
    to: string
    output: string,

    // 字幕信息
    srt: string,
    srt_start_time: number,
    srt_end_time: number,
}

interface KeyFrameJobResult {
    item: KeyFrameJob
    outputs?: string
    errors?: string
}

//剧本
export class SimulateRepository extends BaseRepository<SimulateRepository> {


    free() {
        console.info('释放.....')
        this.videoPath = undefined
        this.payload = undefined
        this.audioPath = undefined
        this.audioRecognition = false
        this.audioRecognitionJobId = undefined
    }

    // 导入视频地址
    videoPath?: string

    // 视频基础信息
    payload?: any

    // 导出音频信息
    audioPath?: string

    // 导出音频文字
    audioRecognition: boolean = false

    audioRecognitionJobId?: string


    handleImportVideo = async (videoPath: string) => {
        this.videoPath = videoPath

        //视频信息

        //解析视频参数
        let cmd = shell.Command.sidecar('bin/ffprobe', [
            "-v", "quiet",
            "-show_streams",
            "-select_streams", "0", //视频
            "-output_format", "json",
            "-i", videoPath
        ])

        let output = await cmd.execute();
        this.payload = JSON.parse(output.stdout)

        let audioPath = await this.absulotePath("audio.mp3")
        //删除原始音频
        if (await fs.exists(this.repoDir + path.sep + "audio.mp3", { dir: this.baseDir() })) {
            await fs.removeFile(this.repoDir + path.sep + "audio.mp3", { dir: this.baseDir() })
        }

        //导出音频
        cmd = shell.Command.sidecar("bin/ffmpeg", [
            "-i", videoPath,
            "-vn",
            "-ab", "128k",  //音频格式
            "-f", "mp3",
            audioPath
        ])

        output = await cmd.execute()
        console.info("提取音频 err", output.stderr)
        console.info("提取音频 out", output.stdout)
        this.audioPath = "audio.mp3"

        //save
        this.sync()
    }

    handleExportVideo = async (savePath: string) => {
        let audioPath = await this.absulotePath("audio.mp3")
        await fs.copyFile(audioPath, savePath, { append: false })
    }


    handleCollectKeyFrame = async (videoPath: string, srtIdx: number, srt: SRTLine) => {

        let name = srtIdx + ".png"
        let output_name = "frames" + path.sep + name
        let absulotePath = await this.absulotePath(output_name)

        //抽帧 关键帧
        let cmd = shell.Command.sidecar("bin/ffmpeg", [
            "-i", videoPath,
            "-ss", formatTime(srt.start_time, "."),
            "-to", formatTime(srt.end_time, "."),
            "-vf", 'fps=1/1',
            "-vsync", "vfr",
            "-qscale:v", "10",
            "-update", "1",
            absulotePath
        ])

        let output = await cmd.execute()
        console.info(output.stderr)

        //关键帧信息
        return {
            id: srtIdx,
            name: name,
            path: output_name,
            image: {
                prompt: "",
                history: []
            },
            srt: srt.text,
            srt_duration: {
                start_time: srt.start_time,
                end_time: srt.end_time
            }
        } as KeyFrame
    }


    //抽帧关键帧
    handleCollectFrames = async (api: TTSApi) => {


        //临时存储目录
        let framesDir = await path.join(this.repoDir, "frames")
        await fs.createDir(framesDir, { dir: this.baseDir(), recursive: true })

        //根据字幕文件抽取关键帧
        let srtLines = await this.handleRecognitionAudio(api)


        //关键帧参数
        let frames = [] as KeyFrameJob[]
        for (let i = 0; i < srtLines.length; i++) {
            let name = i + ".png"
            let output_path = await this.absulotePath("/frames/" + name)
            frames.push({
                idx: i,
                name: name,

                //参数
                input: this.videoPath!,
                ss: formatTime(srtLines[i].start_time, "."),
                to: formatTime(srtLines[i].end_time, "."),
                output: output_path,

                //字幕
                srt: srtLines[i].text,
                srt_start_time: srtLines[i].start_time,
                srt_end_time: srtLines[i].end_time
            } as KeyFrameJob)
        }

        //并发执行
        let results: KeyFrameJobResult[] = await tauri.invoke('key_frame_collect', { videoPath: this.videoPath!, frames: frames })

        //转换关键帧对象
        return results.map((job: KeyFrameJobResult) => {
            let item = job.item
            return {
                id: item.idx,
                name: item.name,
                path: "frames" + path.sep + item.name,
                image: {
                    prompt: "",
                    history: []
                },
                srt: item.srt,
                srt_duration: {
                    start_time: item.srt_start_time,
                    end_time: item.srt_end_time
                }
            } as KeyFrame
        })
    }

    //识别音频
    handleRecognitionAudio = async (api: TTSApi) => {

        // let frames = [
        //     // { idx: 0, start_time: 10, end_time: 900 },
        //     { idx: 1, start_time: 900, end_time: 1700 }]

        // return frames

        //是否已经识别
        let audioRecognitionPath = await this.absulotePath("audio.json")
        if (true) {
            let audioText = await fs.readTextFile(audioRecognitionPath)
            return JSON.parse(audioText).utterances as SRTLine[]
        }

        //提取音频
        if (!this.audioPath) {
            throw new Error("无音频文件")
        }

        let audioPath = await this.absulotePath("audio.mp3")
        //在线 生成字幕文件
        let jobResp: any = await api.submitAudio(audioPath)
        this.audioRecognitionJobId = jobResp.id

        //在线 延迟查询
        await delay(5000)
        let audioText: any = await api.queryResult(this.audioRecognitionJobId!)

        //写入文件
        await fs.writeFile(audioRecognitionPath, JSON.stringify(audioText, null, "\t"), { dir: this.baseDir(), append: false })
        this.audioRecognition = true

        this.sync()

        //提取数据
        return audioText.utterances as SRTLine[]
    }


    handleCollectSrtFile = async (savePath: string) => {
        console.info(savePath)
        await delay(3000)
        await fs.writeTextFile(savePath, "xxx", { append: false })
    }

}
export const useSimulateRepository = create<SimulateRepository>()(subscribeWithSelector((set, get) => new SimulateRepository("simulate.json", set, get)))



