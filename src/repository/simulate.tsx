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
    hasAudio: boolean = false

    // 导出音频文字
    hasAudioRecognition: boolean = false

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
        let audioPath = await path.join(await this.basePath(), this.repoDir, "audio.mp3")
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
        this.hasAudio = true

        //save
        this.sync()
    }

    handleCollectKeyFrame = async (videoPath: string, srtIdx: number, srt: SRTLine, framesDir: string) => {

        let keyFrameName = srt.start_time + "_" + srt.end_time + ".png"
        console.info('start collect keyframe', keyFrameName)
        let keyFramePath = await path.join(await this.basePath(), framesDir, keyFrameName)

        //抽帧 关键帧
        let cmd = shell.Command.sidecar("bin/ffmpeg", [
            "-i", videoPath,
            "-ss", formatTime(srt.start_time),
            "-to", formatTime(srt.end_time),
            "-vf", 'fps=1/1',
            "-vsync", "vfr",
            "-qscale:v", "10",
            "-update", "1",
            keyFramePath
        ])

        let output = await cmd.execute()
        // console.info(output.stdout)
        console.info(output.stderr)

        //关键帧信息
        return {
            id: srtIdx,
            name: keyFrameName,
            path: keyFramePath,
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
    handleCollectFrames2 = async (api: TTSApi) => {

        //临时存储目录
        let framesDir = await path.join(this.repoDir, "frames")
        await fs.createDir(framesDir, { dir: this.baseDir(), recursive: true })

        //根据字幕文件抽取关键帧
        let srtLines = await this.handleRecognitionAudio(api)
        let videoPath = this.videoPath!

        //循环抽取
        let keyFrames = []
        for (let i = 0; i < srtLines.length; i++) {
            let kf = await this.handleCollectKeyFrame(videoPath, i, srtLines[i], framesDir)
            keyFrames.push(kf)
        }
        return keyFrames as KeyFrame[]
    }


    //抽帧关键帧 
    //废弃
    handleCollectFrames = async () => {

        //临时存储目录
        let framesDir = await path.join(this.repoDir, "frames")
        await fs.createDir(framesDir, { dir: this.baseDir(), recursive: true })

        //图片路径
        let framesPath = await path.join(await this.basePath(), framesDir, "%05d.png")
        console.info(this.videoPath, framesPath)
        //抽帧 关键帧
        let cmd = shell.Command.sidecar("bin/ffmpeg", [
            "-i", this.videoPath!,
            // "-vf", 'select=eq(pict_type\\,I)',
            "-vf", 'fps=1/1',
            "-vsync", "vfr",
            "-qscale:v", "10",
            "-f", "image2",
            framesPath
        ])
        let output = await cmd.execute()
        console.info(output.stderr)
        console.info(output.stdout)
        await delay(1000)

        //导出所有关键帧(秒)
        let frameImageFiles = await fs.readDir(framesDir, { dir: this.baseDir(), recursive: false })
        let tempKeyFrames = frameImageFiles.map(file => {
            let seq = file.name?.substring(0, file.name.lastIndexOf("."))
            return {
                id: Number.parseInt(seq!),
                name: file.name,
                path: file.path,
                image: {
                    prompt: "",
                    history: []
                }
            } as KeyFrame
        }).sort((a, b) => a.id - b.id)

        //导出所有关键帧(秒)
        return this.ssimFramesCollect(tempKeyFrames)
    }

    //废弃
    ssimFramesCollect = async (frames: KeyFrame[]) => {
        const ssimNextCompare = (srcIndex: number, output: string) => {
            let diffs = output.split("\n").filter(item => item).map(line => {
                let result = line.split("\t")
                return {
                    score: parseFloat(result[0].trim()),
                    target: result[1].trim()
                }
            })
            //比较阈值 > 0.7 则不一致，并返回下次待比较的图片index
            let matchIndex = diffs.findIndex((item) => item.score >= 0.65)
            if (matchIndex === -1) {
                return matchIndex
            }
            return srcIndex + matchIndex + 1
        }

        //比对相识度 默认从第一张图片开始
        let diffs = [frames[0]]
        let index = 0
        while (index < frames.length) {

            //提高对比效率，和下10张图片做对比
            let src = frames[index].path
            let dests = frames.slice(index + 1, index + 10).map(item => item.path)
            if (dests.length === 0) {
                break
            }

            //执行命令对比
            let cmd = shell.Command.sidecar("bin/dssim", [src, ...dests])
            let output = await cmd.execute()
            console.info(output.stderr)
            console.info(output.stdout)
            let nextIndex = ssimNextCompare(index, output.stdout)

            //均相似，则移动到目标尾部，继续比对
            if (nextIndex === -1) {
                index = index + dests.length
                continue
            }
            console.info("有效图片", frames[nextIndex].path)
            //有效图片
            diffs.push(frames[nextIndex])
            //从该张图片重新开始
            index = nextIndex
        }

        //新建目录
        // let framesDir = await path.join(this.repoDir, "frames")
        // await fs.createDir(framesDir, { dir: this.baseDir(), recursive: true })

        return diffs
    }


    //识别音频
    handleRecognitionAudio = async (api: TTSApi) => {

        //是否已经识别
        let audioRecognitionPath = await path.join(await this.basePath(), this.repoDir, "audio.json")
        if (this.hasAudioRecognition) {
            let audioText = await fs.readTextFile(audioRecognitionPath)
            return JSON.parse(audioText).utterances as SRTLine[]
        }

        //提取音频
        if (!this.hasAudio) {
            throw new Error("无音频文件")
        }

        let audioPath = await path.join(await this.basePath(), this.repoDir, "audio.mp3")
        //在线 生成字幕文件
        let jobResp: any = await api.submitAudio(audioPath)
        this.audioJobId = jobResp.id
        
        //在线 延迟查询
        await delay(5000)
        let audioText: any = await api.queryResult(this.audioJobId!)

        //写入文件
        await fs.writeFile(audioRecognitionPath, JSON.stringify(audioText, null, "\t"), { dir: this.baseDir(), append: false })
        this.hasAudioRecognition = true

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



