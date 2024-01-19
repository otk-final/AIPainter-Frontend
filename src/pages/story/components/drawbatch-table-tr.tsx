import { Button, Image, message } from "antd"
import TextArea from "antd/es/input/TextArea";
import { Fragment, useEffect, useState } from "react";
import { drawbatchColumns } from "../data";
import { Chapter, usePersistChaptersStorage } from "@/stores/story";
import { tauri } from "@tauri-apps/api";
import { HistoryImageModule } from "@/components";
import { Text2ImageHandle, WorkflowScript, registerComfyUIPromptCallback, usePersistComfyUIStorage } from "@/stores/comfyui";
import { usePersistUserIdentificationStorage } from "@/stores/auth";

interface ChapterTableTRProps {
    idx: number,
    style: string
    chapter: Chapter,
}


const DrawTableTR: React.FC<ChapterTableTRProps> = ({ idx, style, chapter }) => {

    const [isOpenHistory, setIsOpenHistory] = useState(false);
    const { pid, updateChapter, saveOutputFrameFile } = usePersistChaptersStorage(state => state)
    const [stateChapter, setChapter] = useState<Chapter>(chapter)
    useEffect(() => {

        //当前绘画页面，ai关键词默认取英文
        if (!stateChapter.drawPrompt) stateChapter.drawPrompt = stateChapter.actorsPrompt?.en

        updateChapter(idx, stateChapter)
    }, [stateChapter])

    const renderNumber = () => {
        return (
            <Fragment>
                <div className='index'>{idx + 1}</div>
            </Fragment>
        )
    }


    const renderEditPrompts = () => {
        return (
            <TextArea rows={6} placeholder={"请输入画面描述词"}
                maxLength={1000} className="text-area-auto"
                value={stateChapter.drawPrompt}
                onChange={(e) => { setChapter({ ...stateChapter, drawPrompt: e.target.value }) }} />
        )
    }

    const renderImage = () => {
        if (!stateChapter.drawImage) {
            return <div>待生成</div>
        }
        let imageUrl = tauri.convertFileSrc(stateChapter.drawImage)
        return (
            <div>
                <Image src={imageUrl} preview={false} />
            </div>
        )
    }


    //重绘制
    const handleRedraw = async () => {

        let path = "/Users/hxy/Desktop/图片/5af16a7e7a434_610.jpg"
        let imageHistroy = stateChapter.drawImageHistory ? [...stateChapter.drawImageHistory!] : []
        imageHistroy.push(path)

        setChapter({ ...stateChapter, drawImage: path, drawImageHistory: imageHistroy })

    }


    const renderImageHistory = () => {
        if (!stateChapter.drawImageHistory) {
            return <div>待生成</div>
        }
        return (
            <div className="flexR" style={{ flexWrap: "wrap", justifyContent: "flex-start", width: '100%' }}
                onClick={() => setIsOpenHistory(true)}>
                {stateChapter?.drawImageHistory?.map((p, idx) => {
                    return <Image src={tauri.convertFileSrc(p)} className="drawbath-image size-s" preview={false} key={idx} />
                })}
            </div>
        )
    }

    //comfyui
    const comfyui = usePersistComfyUIStorage(state => state)
    const { clientId } = usePersistUserIdentificationStorage(state => state)

    const handleImage2Image = async () => {
        if (!style) {
            await message.warning("请选择图片风格")
            return
        }
        message.loading("图片生成中...", 30 * 1000, () => {
            console.info("xxx")
        })
        let comfyuiApi = comfyui.buildApi(clientId)

        //根据当前风格选择脚本 提交当前关键词，和默认反向关键词
        let ws = new WorkflowScript(await comfyui.loadModeApi(style))
        let job = await comfyuiApi.prompt(ws, { positive: stateChapter.drawPrompt!, negative: comfyui.negativePrompt! }, Text2ImageHandle)
        let step = ws.getOutputImageStep()


        const callback = async (promptId: string, respData: any) => {
            //回调消息不及时 定时查询
            console.info("status", respData)

            //下载文件
            let images = respData[promptId]!.outputs![step].images! as { filename: string, subfolder: string, type: string }[]
            images.forEach(async (item) => {

                //下载，保存
                let fileBuffer = await comfyuiApi.download(item.subfolder, item.filename)
                let filePath = await saveOutputFrameFile(idx, item.filename, fileBuffer)

                //更新状态
                stateChapter.drawImageHistory.push(filePath)
                stateChapter.drawImage = filePath

                setChapter({ ...stateChapter })
            })
            message.destroy()
        }
        //监听任务
        registerComfyUIPromptCallback({ jobId: pid!, promptId: job.prompt_id, handle: callback })
    }

    const handleImage2ImageCatch = () => {
        handleImage2Image().catch(err => { message.destroy(); message.error(err.message) })
    }


    const renderOperate = () => {
        return (
            <Fragment>
                <Button type='default' className='btn-default-auto btn-default-98' onClick={handleImage2ImageCatch}>重绘本镜</Button>
                <Button type='default' className='btn-default-auto btn-default-98' disabled={!stateChapter.drawImageHistory}>高清放大</Button>
            </Fragment>
        )
    }

    return (
        <div className='tr flexR'>
            {stateChapter && drawbatchColumns.map((i, index) => {
                return (
                    <div className='td script-id flexC' key={i.key + index} style={{ flex: `${i.space}` }}>
                        {i.key === 'number' ? renderNumber() : null}
                        {i.key === 'original' ? stateChapter.original : null}
                        {i.key === 'drawPrompt' ? renderEditPrompts() : null}
                        {i.key === 'drawImage' ? renderImage() : null}
                        {i.key === 'drawImageHistory' ? renderImageHistory() : null}
                        {i.key === 'operate' ? renderOperate() : null}
                    </div>
                )
            })}
            <HistoryImageModule
                isOpen={isOpenHistory} onClose={() => setIsOpenHistory(false)}
                paths={stateChapter.drawImageHistory || []} defaultPath={stateChapter.drawImage || ""}
                onChangeNewImage={(v) => setChapter(res => {
                    return { ...res, drawImage: v }
                })} />
        </div>
    )
}

export default DrawTableTR