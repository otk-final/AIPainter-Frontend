import { create } from "zustand"
import { BaseRepository, delay } from "./tauri_repository"
import { subscribeWithSelector } from "zustand/middleware"
import { event, fs, path, shell, tauri } from "@tauri-apps/api"
import { KeyFrame } from "./keyframe"
import { TTSApi } from "./tts_api"
import { SRTLine, formatTime } from "./srt"

interface KeyFrameJob {
    id: number,
    name: string,

    //参数
    input: string,
    ss: string
    to: string

    image_output: string,
    audio_output: string,
    video_output: string,

    // 字幕信息
    srt: string,
    srt_duration: number,
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

        //导出音频
        cmd = shell.Command.sidecar("bin/ffmpeg", [
            "-y",
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
    // handleCollectFramesWithFps = async () => {

    //     //临时存储目录
    //     let framesDir = await path.join(this.repoDir, "frames")
    //     await fs.createDir(framesDir, { dir: this.baseDir(), recursive: true })

    //     //图片路径
    //     let framesPath = await path.join(await this.basePath(), framesDir, "%05d.png")
    //     console.info(this.videoPath, framesPath)
    //     //抽帧 关键帧
    //     let cmd = shell.Command.sidecar("bin/ffmpeg", [
    //         "-y",
    //         "-i", this.videoPath!,
    //         // "-vf", 'select=eq(pict_type\\,I)',
    //         "-vf", 'fps=1/1',
    //         "-vsync", "vfr",
    //         "-qscale:v", "10",
    //         "-f", "image2",
    //         framesPath
    //     ])
    //     let output = await cmd.execute()
    //     console.info(output.stderr)
    //     console.info(output.stdout)
    //     await delay(1000)

    //     //导出所有关键帧(秒)
    //     let frameImageFiles = await fs.readDir(framesDir, { dir: this.baseDir(), recursive: false })
    //     let tempKeyFrames = frameImageFiles.map(file => {
    //         let seq = file.name?.substring(0, file.name.lastIndexOf("."))
    //         return {
    //             id: Number.parseInt(seq!),
    //             name: file.name,
    //             path: "frames" + path.sep + file.name,
    //             image: {
    //                 prompt: "",
    //                 history: []
    //             }
    //         } as KeyFrame
    //     }).sort((a, b) => a.id - b.id)

    //     //比较关键帧
    //     return this.handleCompareKeyFrames(tempKeyFrames)
    // }



    //根据时间
    // handleCollectKeyFrameWithTime = async (videoPath: string, srtIdx: number, srt: SRTLine) => {

    //     let name = srtIdx + ".png"
    //     let output_name = "frames" + path.sep + name
    //     let absulotePath = await this.absulotePath(output_name)

    //     //抽帧 关键帧
    //     let cmd = shell.Command.sidecar("bin/ffmpeg", [
    //         "-i", videoPath,
    //         "-ss", formatTime(srt.start_time, "."),
    //         "-to", formatTime(srt.end_time, "."),
    //         "-vf", 'fps=1/1',
    //         "-vsync", "vfr",
    //         "-qscale:v", "10",
    //         "-update", "1",
    //         absulotePath
    //     ])

    //     let output = await cmd.execute()
    //     console.info(output.stderr)

    //     //关键帧信息
    //     return {
    //         id: srtIdx,
    //         name: name,
    //         path: output_name,
    //         image: {
    //             prompt: "",
    //             history: []
    //         },
    //         srt: srt.text,
    //         srt_duration: srt.end_time - srt.start_time
    //     } as KeyFrame
    // }


    //抽帧关键帧
    handleCollectFrames = async (api: TTSApi) => {

        //临时存储目录
        let framesDir = await path.join(this.repoDir, "frames")
        await fs.createDir(framesDir, { dir: this.baseDir(), recursive: true })
        let audiosDir = await path.join(this.repoDir, "audios")
        await fs.createDir(audiosDir, { dir: this.baseDir(), recursive: true })
        let videosDir = await path.join(this.repoDir, "videos")
        await fs.createDir(videosDir, { dir: this.baseDir(), recursive: true })


        //音频文件
        let exportAudioPath = await this.absulotePath("audio.mp3")

        //根据字幕文件抽取关键帧
        let srtLines = await this.handleRecognitionAudio(api, exportAudioPath)

        //关键帧参数
        let jobs = [] as KeyFrameJob[]
        for (let i = 0; i < srtLines.length; i++) {

            let name = i + "-org"
            let image_path = await this.absulotePath("frames" + path.sep + name + ".png")
            let audio_path = await this.absulotePath("audios" + path.sep + name + ".mp3")
            let video_path = await this.absulotePath("videos" + path.sep + name + ".mp4")

            let srt = srtLines[i]

            jobs.push({
                id: i,
                name: name,

                //参数
                input: this.videoPath!,
                ss: formatTime(srt.start_time, "."),
                to: formatTime(srt.end_time, "."),

                //输出文件
                image_output: image_path,
                audio_output: audio_path,
                video_output: video_path,

                //字幕
                srt: srt.text,
                srt_duration: srt.end_time - srt.start_time,
            } as KeyFrameJob)
        }

        //并发执行
        let results: KeyFrameJob[] = await tauri.invoke('key_frame_collect', { videoPath: this.videoPath!, audioPath: exportAudioPath, parameters: jobs })

        //转换关键帧对象
        return results.map((item: KeyFrameJob) => {
            return {
                id: item.id,
                name: item.name,
                path: "frames" + path.sep + item.name + ".png",
                image: {
                    prompt: "",
                    history: []
                },
                srt: item.srt,
                srt_duration: item.srt_duration,
                srt_audio_path: "audios" + path.sep + item.name + ".mp3",
                srt_video_path: "videos" + path.sep + item.name + ".mp4",
                effect: { orientation: "random" }
            } as KeyFrame
        })
    }

    //识别音频
    handleRecognitionAudio = async (api: TTSApi, audioPath: string) => {

        //是否已经识别
        let audioRecognitionPath = await this.absulotePath("audio.json")
        if (this.audioRecognition) {
            let audioText = await fs.readTextFile(audioRecognitionPath)
            return JSON.parse(audioText).utterances as SRTLine[]
        }

        //通知进度
        await event.emit("key_frame_collect_process", {
            title: "上传音频",
            except: 100,
            completed: 30,
            current: 50
        })

        
        //在线 生成字幕文件
        console.info("上传音频")
        let jobResp: any = await api.submitAudio(audioPath)
        this.audioRecognitionJobId = jobResp.id

        console.info("已提交任务：", jobResp)


        //通知进度
        await event.emit("key_frame_collect_process", {
            title: "下载音频字幕",
            except: 100,
            completed: 60,
            current: 60
        })

        //轮询查询结果
        let fatch = 0;
        let audioText: any;
        while (fatch <= 10) {
            //处理中
            await delay(3000)
            fatch++;
            let respText: any = await api.queryResult(this.audioRecognitionJobId!);
            console.info("查询任务结果：", fatch, respText)
            if (respText.code === 0) {
                //成功
                audioText = { ...respText }
                break;
            } else if (respText.code === 2000) {
                //处理中
                continue
            } else {
                //异常
                throw new Error(respText.message)
            }
        }

        if (!audioText) {
            throw new Error("音频字幕下载失败,稍后重试！")
        }

        //通知进度
        await event.emit("key_frame_collect_process", {
            title: "识别音频字幕",
            except: 100,
            completed: 100,
            current: 100
        })

        //写入文件
        await fs.writeFile(audioRecognitionPath, JSON.stringify(audioText, null, "\t"), { append: false })
        this.audioRecognition = true
        this.sync()

        //提取字幕
        return audioText.utterances as SRTLine[]
    }


    handleCollectSrtFile = async (savePath: string) => {
        console.info(savePath)
        await delay(3000)
        await fs.writeTextFile(savePath, "xxx", { append: false })
    }

}
export const useSimulateRepository = create<SimulateRepository>()(subscribeWithSelector((set, get) => new SimulateRepository("simulate.json", set, get)))



