import { Button, Image, message } from "antd"
import TextArea from "antd/es/input/TextArea";
import { Fragment, useEffect, useState } from "react";
import { generateImagesColumns } from "../data";
import { ImtateFrame, usePersistImtateFramesStorage } from "@/stores/frame";
import { tauri } from "@tauri-apps/api";
import { HistoryImageModule } from "@/components"
import { Image2TextHandle, Text2ImageHandle, WorkflowScript, registerComfyUIPromptCallback, usePersistComfyUIStorage } from "@/stores/comfyui";
import { usePersistUserIdentificationStorage } from "@/stores/auth";
import OpenAI from "openai";

interface GenerateImagesTRProps {
    index: number
    style: string
    frame: ImtateFrame,
}

const GenerateImagesTR: React.FC<GenerateImagesTRProps> = ({ index, style, frame }) => {
    const [isOpenHistory, setIsOpenHistory] = useState(false);
    const [stateFrame, setFrame] = useState<ImtateFrame>({ ...frame })
    const { pid, frames, removeFrame, updateFrame, saveOutputFrameFile } = usePersistImtateFramesStorage(state => state)
    useEffect(() => {
        updateFrame(index, stateFrame)
    }, [index, stateFrame])



    //comfyui
    const comfyui = usePersistComfyUIStorage(state => state)
    const { clientId } = usePersistUserIdentificationStorage(state => state)


    //反推关键词
    const handleImage2Text = async () => {

        message.loading("反推关键词...", 0)

        let filename = stateFrame.name
        let comfyuiApi = comfyui.buildApi(clientId)
        //上传文件
        await comfyuiApi.upload(clientId, stateFrame.path, filename)

        //提交任务
        let ws = new WorkflowScript(await comfyui.loadReverseApi())
        let job = await comfyuiApi.prompt(ws, { subfolder: clientId, filename: filename }, Image2TextHandle)

        //关键词所在的节点数
        let step = ws.getWD14TaggerStep()
        const callback = async (promptId: string, respData: any) => {

            //定位结果
            let reversePrompts = respData[promptId]!.outputs![step]!.tags! as string[]
            if (reversePrompts) setFrame({ ...stateFrame, drawPrompt: reversePrompts.join(",") })
            message.destroy()
        }

        //监听任务
        registerComfyUIPromptCallback({ jobId: stateFrame.path, promptId: job.prompt_id, handle: callback })
    }


    const handleImage2TextCatch = () => {
        handleImage2Text().catch(err => { message.destroy(); message.error(err.message) })
    }



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
        let job = await comfyuiApi.prompt(ws, { positive: stateFrame.drawPrompt!, negative: comfyui.negativePrompt! }, Text2ImageHandle)
        let step = ws.getOutputImageStep()


        const callback = async (promptId: string, respData: any) => {
            //回调消息不及时 定时查询
            console.info("status", respData)

            //下载文件
            let images = respData[promptId]!.outputs![step].images! as { filename: string, subfolder: string, type: string }[]
            images.forEach(async (item) => {

                //下载，保存
                let fileBuffer = await comfyuiApi.download(item.subfolder, item.filename)
                let filePath = await saveOutputFrameFile(index, item.filename, fileBuffer)

                //更新状态
                stateFrame.drawImageHistory.push(filePath)
                stateFrame.drawImage = filePath

                setFrame({ ...stateFrame })
            })

            message.destroy()
        }

        //监听任务
        registerComfyUIPromptCallback({ jobId: stateFrame.path, promptId: job.prompt_id, handle: callback })
    }

    const handleImage2ImageCatch = () => {
        handleImage2Image().catch(err => { message.destroy(); message.error(err.message) })
    }



    const renderNumber = () => {
        return (
            <Fragment>
                <div className='index'>{index + 1}</div>
                <Button type='default' className='btn-default-auto btn-default-98' onClick={() => removeFrame(index)} disabled={frames!.length === 1}>删除</Button>
            </Fragment>
        )
    }


    const renderPrompt = () => {
        return (
            <TextArea rows={7} placeholder={"请输入关键词"}
                maxLength={1000} className="text-area-auto"
                value={stateFrame.drawPrompt}
                onChange={(e) => { setFrame({ ...stateFrame, drawPrompt: e.target.value }) }} />
        )
    }


    const renderImage = (path?: string) => {
        if (!path) {
            return null
        }
        return <Image src={tauri.convertFileSrc(path)} className="generate-image" preview={false} />
    }


    const renderImageHistory = () => {
        if (!stateFrame?.drawImageHistory?.length) {
            return <div>待生成</div>
        }
        return (
            <div className="flexR"
                style={{ flexWrap: "wrap", justifyContent: "flex-start", width: '100%' }}
                onClick={() => setIsOpenHistory(true)}
            >
                {stateFrame?.drawImageHistory?.map((p, idx) => {
                    return <Image src={tauri.convertFileSrc(p)} className="generate-image size-s" preview={false} key={idx} />
                })}
            </div>
        )
    }


    const renderOperate = () => {
        return (
            <Fragment>
                <Button type='default' className='btn-default-auto btn-default-98' onClick={handleImage2ImageCatch}>生成图片</Button>
                <Button type='default' className='btn-default-auto btn-default-98' onClick={handleImage2TextCatch}>反推关键词</Button>
            </Fragment>
        )
    }


    return (
        <div className='tr flexR'>
            {generateImagesColumns.map((i, index) => {
                return (
                    <div className='td script-id flexC' key={i.key + index} style={{ flex: `${i.space}` }}>
                        {i.key === 'number' ? renderNumber() : null}
                        {i.key === 'path' ? renderImage(stateFrame.path) : null}
                        {i.key === 'drawPrompt' ? renderPrompt() : null}
                        {i.key === 'drawImage' ? renderImage(stateFrame.drawImage) : null}
                        {i.key === 'drawImageHistory' ? renderImageHistory() : null}
                        {i.key === 'operate' ? renderOperate() : null}
                    </div>
                )
            })}
            <HistoryImageModule
                isOpen={isOpenHistory} onClose={() => setIsOpenHistory(false)}
                paths={stateFrame?.drawImageHistory || []} defaultPath={stateFrame.drawImage || ""}
                onChangeNewImage={(v) => setFrame(res => {
                    return { ...res, drawImage: v }
                })} />
        </div>
    )
}

export default GenerateImagesTR