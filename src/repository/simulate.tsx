import { create } from "zustand"
import { BaseCRUDRepository, BaseRepository, ItemIdentifiable, delay } from "./tauri_repository"
import { subscribeWithSelector } from "zustand/middleware"
import { fs, path, shell } from "@tauri-apps/api"
import { Image2TextHandle, Text2ImageHandle, WFScript, registerComfyUIPromptCallback } from "./comfyui_api"
import { ComfyUIRepository } from "./comfyui"


//剧本
export class SimulateRepository extends BaseRepository<SimulateRepository> {


    free() {
        console.info('释放.....')
        this.videoPath = undefined
        this.payload = undefined
        this.audioPath = undefined
        this.audioText = undefined
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
        this.sync()
    }
    //抽帧关键帧
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

    //抽取音频
    handleCollectAudio = async (savePath: string) => {

        //导出音频
        let cmd = shell.Command.sidecar("bin/ffmpeg", [
            "-i", this.videoPath!,
            "-vn",
            "-ab", "128k",  //音频格式
            "-f", "mp3",
            savePath
        ])

        let output = await cmd.execute()
        console.info(output.stderr)
        console.info(output.stdout)
        this.audioPath = savePath

        //TODO 生成字幕文件
    }

    handleCollectSrtFile = async (savePath: string) => {
        console.info(savePath)
        await delay(3000)
        await fs.writeTextFile(savePath, "xxx", { append: false })
    }

}
export const useSimulateRepository = create<SimulateRepository>()(subscribeWithSelector((set, get) => new SimulateRepository("simulate.json", set, get)))



export interface KeyFrame extends ItemIdentifiable {
    id: number
    name: string,
    path: string,
    prompt?: string,
    image: {
        path?: string
        history: string[]
    }
}


export class KeyFrameRepository extends BaseCRUDRepository<KeyFrame, KeyFrameRepository> {
    repoInitialization(thisData: KeyFrameRepository): void {
        this.items = thisData.items
    }

    //初始化
    initializationKeyFrames = async (frames: KeyFrame[]) => {
        this.items = [...frames]
        this.sync()
    }

    //反推关键词
    handleReversePrompt = async (index: number, comyuiRepo: ComfyUIRepository) => {
        let frame = this.items[index]

        let api = comyuiRepo.newClient()
        let text = await comyuiRepo.buildReversePrompt()
        let script = new WFScript(text)

        //上传文件
        await api.upload("hxy", frame.path, frame.name)

        //提交任务
        let job = await api.prompt(script, { subfolder: "hxy", filename: frame.name }, Image2TextHandle)
        //关键词所在的节点数
        let step = script.getWD14TaggerStep()
        const callback = async (promptId: string, respData: any) => {
            //定位结果
            let reversePrompts = respData[promptId]!.outputs![step]!.tags! as string[]
            if (reversePrompts) frame.prompt = reversePrompts.join(",")

            //save
            this.sync()
        }
        //监听任务
        registerComfyUIPromptCallback({ jobId: "", promptId: job.prompt_id, handle: callback })
    }

    //生成图片
    handleGenerateImage = async (index: number, style: string, comyuiRepo: ComfyUIRepository) => {
        let frame = this.items[index]

        //comyui api
        let api = comyuiRepo.newClient()
        let text = await comyuiRepo.buildModePrompt(style)
        let script = new WFScript(text)

        //add prompt task
        let job = await api.prompt(script, { positive: frame.prompt || comyuiRepo.positivePrompt, negative: comyuiRepo.negativePrompt || "" }, Text2ImageHandle)

        //获取 当前流程中 输出图片节点位置
        let step = script.getOutputImageStep()
        const callback = async (promptId: string, respData: any) => {

            //下载文件
            let images = respData[promptId]!.outputs![step].images! as { filename: string, subfolder: string, type: string }[]
            images.forEach(async (imageItem) => {
                //保存
                let fileBuffer = await api.download(imageItem.subfolder, imageItem.filename)
                let filePath = await this.saveImage("outputs", imageItem.filename, fileBuffer)

                frame.image.path = filePath
                frame.image.history.push(filePath)
            })

            //save
            this.sync()
        }

        //监听任务
        registerComfyUIPromptCallback({ jobId: "", promptId: job.prompt_id, handle: callback })
    }
}

export const useKeyFrameRepository = create<KeyFrameRepository>()(subscribeWithSelector((set, get) => new KeyFrameRepository("frames.json", set, get)))



