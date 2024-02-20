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

    //根据帧率
    handleCollectFramesWithFps = async () => {

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
                path: "frames" + path.sep + file.name,
                image: {
                    prompt: "",
                    history: []
                }
            } as KeyFrame
        }).sort((a, b) => a.id - b.id)

        //比较关键帧
        return this.handleCompareKeyFrames(tempKeyFrames)
    }

    //差异性
    handleCompareKeyFrames = async (frames: KeyFrame[]) => {
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
        let repo_path = await path.join(await this.basePath(), this.repoDir)
        
        //比对相识度 默认从第一张图片开始
        let diffs = [frames[0]]
        let index = 0
        while (index < frames.length) {

            //提高对比效率，和下10张图片做对比
            let src = frames[index].path
            //全路径
            let dests = frames.slice(index + 1, index + 10).map(item => repo_path + path.sep + item.path)
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
        return diffs
    }

    //根据时间
    handleCollectKeyFrameWithTime = async (videoPath: string, srtIdx: number, srt: SRTLine) => {

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
        if (this.audioRecognition) {
            let audioText = await fs.readTextFile(audioRecognitionPath)
            return JSON.parse(audioText).utterances as SRTLine[]
        }

        //提取音频
        if (!this.audioPath) {
            throw new Error("无音频文件")
        }

        console.info("上传音频")

        let audioPath = await this.absulotePath("audio.mp3")
        //在线 生成字幕文件
        let jobResp: any = await api.submitAudio(audioPath)
        this.audioRecognitionJobId = jobResp.id

        console.info("已提交任务：", jobResp)

        //在线 延迟查询
        await delay(5000)
        let audioText: any = await api.queryResult(this.audioRecognitionJobId!)

        console.info("查询任务结果：", audioText)

        //写入文件
        await fs.writeFile(audioRecognitionPath, JSON.stringify(audioText, null, "\t"), {append: false })
        this.audioRecognition = true

        this.sync()

        console.info("保存文件")

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



