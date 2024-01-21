import { create } from "zustand"
import { BaseCRUDRepository, BaseRepository, Directory, delay } from "./tauri_repository"
import { subscribeWithSelector } from "zustand/middleware"
import { fs, path, shell } from "@tauri-apps/api"
import { Image2TextHandle, Text2ImageHandle, WFScript, registerComfyUIPromptCallback } from "./comfyui_api"
import { ComfyUIRepository } from "./comfyui"


//剧本
export class SimulateRepository extends BaseRepository<SimulateRepository> {


    repoEmpty(): SimulateRepository {
        this.videoPath = undefined
        this.payload = undefined
        this.audioPath = undefined
        this.audioText = undefined
        return this
    }

    repoInitialization(thisData: SimulateRepository): void {
        this.videoPath = thisData.videoPath
        this.payload = thisData.payload
        this.audioPath = thisData.audioPath
        this.audioText = thisData.audioText
    }

    // 导入视频地址
    videoPath?: string

    // 视频基础信息
    payload?: any

    // 导出音频信息
    audioPath?: string

    // 导出音频文字
    audioText?: string


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

        //save
        this.reactived(true)
    }
    //抽帧关键帧
    handleCollectFrames = async () => {

        //存储目录
        let framesDir = await path.join(this.repoDir, "frames")
        await fs.createDir(framesDir, { dir: this.baseDir(), recursive: true })

        //图片路径
        let framesPath = await path.join(await this.basePath(), framesDir, "%05d.png")
        console.info(this.videoPath, framesPath)
        //抽帧 关键帧
        let cmd = shell.Command.sidecar("bin/ffmpeg", [
            "-i", this.videoPath!,
            "-vf", 'select=eq(pict_type\\,I)',
            "-vsync", "vfr",
            "-qscale:v", "10",
            "-f", "image2",
            framesPath
        ])
        let output = await cmd.execute()
        console.info(output.stderr)
        console.info(output.stdout)
        await delay(1000)

        //导出所有关键帧
        let frameImageFiles = await fs.readDir(framesDir, { dir: this.baseDir(), recursive: false })
        return frameImageFiles.map(file => {
            let seq = file.name?.substring(0, file.name.lastIndexOf("."))
            return {
                id: Number.parseInt(seq!),
                name: file.name,
                path: file.path,
            } as KeyFrame
        }).sort((a, b) => a.id - b.id)
    }

    //抽取音频
    handleCollectAudio = async () => {

        //导出音频
        let audioPath = await path.join(await path.appLocalDataDir(), this.repoDir, "audio.mp3")
        let cmd = shell.Command.sidecar("bin/ffmpeg", [
            "-i", this.videoPath!,
            "-vn",
            "-ab", "128k",  //音频格式
            "-f", "mp3",
            audioPath
        ])

        let output = await cmd.execute()
        console.info(output.stderr)
        console.info(output.stdout)
        this.audioPath = audioPath

        await delay(1000)

        //TODO 生成字幕文件

    }


}
export const useSimulateRepository = create<SimulateRepository>()(subscribeWithSelector((set, get) => new SimulateRepository("simulate.json", set, get)))




export interface KeyFrame {
    id: number
    name: string,
    path: string,
    image: {
        prompt?: string,
        path?: string
        history: string[]
    }
}


export class KeyFrameRepository extends BaseCRUDRepository<KeyFrame, KeyFrameRepository> {
    repoInitialization(thisData: KeyFrameRepository): void {
        this.items = thisData.items
    }

    repoEmpty(dir: string): KeyFrameRepository {
        console.info(dir)
        return this
    }

    //初始化
    initializationKeyFrames = async (frames: KeyFrame[]) => {
        this.items = [...frames]

        //写入文件
        let framesJsonPath = await path.join(this.repoDir, "frames.json")
        await fs.writeTextFile(framesJsonPath, JSON.stringify(this, null, '\t'), { dir: this.baseDir(), append: false })
    }


    //反推关键词
    handleReversePrompt = async (index: number, comyuiRepo: ComfyUIRepository) => {
        let frame = this.items[index]

        let api = comyuiRepo.newClient()
        let text = comyuiRepo.buildReversePrompt()
        let script = new WFScript(text)

        //上传文件
        await api.upload("", frame.path, frame.name)

        //提交任务
        let ws = new WFScript(script)
        let job = await api.prompt(ws, { subfolder: "", filename: frame.name }, Image2TextHandle)

        //关键词所在的节点数
        let step = ws.getWD14TaggerStep()
        const callback = async (promptId: string, respData: any) => {
            //定位结果
            let reversePrompts = respData[promptId]!.outputs![step]!.tags! as string[]
            if (reversePrompts) frame.image.prompt = reversePrompts.join(",")

            this.reactived(true)
        }
        //监听任务
        registerComfyUIPromptCallback({ jobId: "", promptId: job.prompt_id, handle: callback })
    }

    //生成图片
    handleGenerateImage = async (index: number, style: string, comyuiRepo: ComfyUIRepository) => {
        let frame = this.items[index]

        //comyui api
        let api = comyuiRepo.newClient()
        let text = comyuiRepo.buildModePrompt(style)
        let script = new WFScript(text)

        //add prompt task
        let job = await api.prompt(script, { positive: frame.image.prompt || comyuiRepo.positivePrompt, negative: comyuiRepo.negativePrompt || "" }, Text2ImageHandle)

        //获取 当前流程中 输出图片节点位置
        let step = script.getOutputImageStep()
        const callback = async (promptId: string, respData: any) => {

            //下载文件
            let images = respData[promptId]!.outputs![step].images! as { filename: string, subfolder: string, type: string }[]
            images.forEach(async (imageItem) => {
                //保存
                let fileBuffer = await api.download(imageItem.subfolder, imageItem.filename)
                let filePath = await this.saveImage("outputs", imageItem.filename, fileBuffer)

                frame.image.history.push(filePath)
                frame.image.path = filePath
            })
            this.reactived(true)
        }

        //监听任务
        registerComfyUIPromptCallback({ jobId: "", promptId: job.prompt_id, handle: callback })
    }
}

export const useKeyFrameRepository = create<KeyFrameRepository>()(subscribeWithSelector((set, get) => new KeyFrameRepository("frames.json", set, get)))



