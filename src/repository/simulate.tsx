import { create } from "zustand"
import { BaseRepository, delay } from "./tauri_repository"
import { subscribeWithSelector } from "zustand/middleware"
import { fs, path, shell } from "@tauri-apps/api"
import { KeyFrame } from "./keyframe"
import { TTSApi } from "./tts_api"
import { SRTLine, formatTime } from "./srt"


//剧本
export class SimulateRepository extends BaseRepository<SimulateRepository> {


    free() {
        console.info('释放.....')
        this.videoPath = undefined
        this.payload = undefined
    }

    // 导入视频地址
    videoPath?: string

    // 视频基础信息
    payload?: any

    // 导出音频信息
    audioPath?: string

    // 导出音频文字
    audioRecognition: boolean = false

    audioJobId?: string


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

        //导出音频
        let audioPath = await this.absulotePath("audio.mp3")
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

    handleCollectKeyFrame = async (videoPath: string, srtIdx: number, srt: SRTLine) => {

        let name = srtIdx + ".png"
        let path = "/frames/" + name
        let absulotePath = await this.absulotePath(path)

        //抽帧 关键帧
        let cmd = shell.Command.sidecar("bin/ffmpeg", [
            "-i", videoPath,
            "-ss", formatTime(srt.start_time),
            "-to", formatTime(srt.end_time),
            "-vf", 'fps=1/1',
            "-vsync", "vfr",
            "-qscale:v", "10",
            "-update", "1",
            absulotePath
        ])

        let output = await cmd.execute()
        // console.info(output.stdout)
        console.info(output.stderr)

        //关键帧信息
        return {
            id: srtIdx,
            name: name,
            path: path,
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

        //循环抽取
        let keyFrames = []
        for (let i = 0; i < srtLines.length; i++) {
            let kf = await this.handleCollectKeyFrame(this.videoPath!, i, srtLines[i])
            keyFrames.push(kf)
        }
        return keyFrames as KeyFrame[]
    }

    //识别音频
    handleRecognitionAudio = async (api: TTSApi) => {

        //是否已经识别
        let audioRecognitionPath = await this.absulotePath("audio.json")
        if (this.audioRecognition) {
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
        this.audioJobId = jobResp.id

        //在线 延迟查询
        await delay(5000)
        let audioText: any = await api.queryResult(this.audioJobId!)

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



