import { Button, Image } from "antd"
import TextArea from "antd/es/input/TextArea";
import { Fragment, useEffect, useState } from "react";
import { generateImagesColumns } from "../data";
import { ImtateFrame, usePersistImtateFramesStorage } from "@/stores/frame";
import { tauri } from "@tauri-apps/api";
import { HistoryImageModule } from "@/components"
import { ComfyUIApi, Image2TextHandle, WorkflowScript, usePersistComfyUIStorage } from "@/stores/comfyui";
import { v4 as uuid } from "uuid"
import { usePersistUserIdentificationStorage } from "@/stores/auth";

interface GenerateImagesTRProps {
    index: number
    frame: ImtateFrame,
}

const GenerateImagesTR: React.FC<GenerateImagesTRProps> = ({ index, frame }) => {
    const [isOpenHistory, setIsOpenHistory] = useState(false);
    const [stateFrame, setFrame] = useState<ImtateFrame>({ ...frame })
    const { frames, removeFrame, updateFrame } = usePersistImtateFramesStorage(state => state)
    useEffect(() => {
        updateFrame(index, stateFrame)
    }, [index, stateFrame])

    const handleGenerateImage = async () => {
        let randIdx = Math.floor(Math.random() * frames.length)
        let randPath = frames[randIdx].path

        let imageHistroy = stateFrame.drawImageHistory ? [...stateFrame.drawImageHistory!] : []
        imageHistroy.push(randPath)

        setFrame({ ...stateFrame, drawImage: randPath, drawImageHistory: imageHistroy })
    }


    //comfyui
    const comfyui = usePersistComfyUIStorage(state => state)
    const { clientId } = usePersistUserIdentificationStorage(state => state)
    const comfyuiApi = new ComfyUIApi(clientId, comfyui)


    //反推关键词
    const handleImage2Text = async () => {

        let filename = uuid()
        //上传文件
        await comfyuiApi.upload("imitate/" + uuid(), stateFrame.path, filename)

        //提交任务
        let ws = new WorkflowScript(comfyui.loadReverseApi())
        let job = await comfyuiApi.prompt(ws, { subfolder: clientId, filename: filename }, Image2TextHandle)

        console.info("job", job)
        //监听任务
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
                <Button type='default' className='btn-default-auto btn-default-98' onClick={handleGenerateImage}>生成图片</Button>
                <Button type='default' className='btn-default-auto btn-default-98' onClick={handleImage2Text}>反推关键词</Button>
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