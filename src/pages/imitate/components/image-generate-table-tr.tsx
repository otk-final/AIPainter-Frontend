import { Button, Image, message, Modal } from "antd"
import TextArea from "antd/es/input/TextArea";
import React, { Fragment, useEffect, useState } from "react";
import { generateImagesColumns } from "../data";
import { tauri } from "@tauri-apps/api";
import { HistoryImageModule } from "@/components"
import { KeyFrame, useKeyFrameRepository } from "@/repository/keyframe";
import { useComfyUIRepository } from "@/repository/comfyui";

interface GenerateImagesTRProps {
    key: string
    index: number
    mode: string
    style: React.CSSProperties
    frame: KeyFrame,
}

const GenerateImagesTR: React.FC<GenerateImagesTRProps> = ({ key, index, style, mode, frame }) => {
    const [isOpenHistory, setIsOpenHistory] = useState(false);
    const [stateFrame, setFrame] = useState<KeyFrame>({ ...frame })
    const keyFreamRepo = useKeyFrameRepository(state => state)
    const comfyUIRepo = useComfyUIRepository(state => state)

    useEffect(() => {
        const unsub = useKeyFrameRepository.subscribe(
            (state) => state.items[index],
            async (state, pre) => state && setFrame(state),
            { fireImmediately: true })
        return unsub
    }, [index])


    const handleEditPrompt = async (e: any) => {
        await keyFreamRepo.updateItem(index, { ...stateFrame, prompt: e.target.value }, false)
    }

    const handleImage2TextCatch = async () => {
        const modal = Modal.info({
            content: <div style={{ color: '#fff' }}>反推关键词...</div>,
            footer: null,
            mask: true,
            maskClosable: false,
        });
        try {
            await keyFreamRepo.handleReversePrompt(index, comfyUIRepo);
            modal.destroy();
        } catch (ex: any) {
            modal.destroy();
            Modal.error({
                content: <div style={{ color: '#fff' }}>反推关键词 {ex}</div>,
                mask: true,
            });
        }
    }

    const handleText2ImageCatch = async () => {
        Modal.info({
            content: <div style={{ color: '#fff' }}>生成图片...</div>,
            footer: null,
            mask: true,
            maskClosable: false,
        })
        await keyFreamRepo.handleGenerateImage(index, mode, comfyUIRepo).catch(err => { message.error(err) }).finally(Modal.destroyAll)
    }

    const handleDelKeyFrame = async () => {
        await keyFreamRepo.delItem(index, true)
    }


    const renderNumber = () => {
        return (
            <Fragment>
                <div className='index'>{index + 1}</div>
                <Button type='default' className='btn-default-auto btn-default-98' onClick={handleDelKeyFrame}>删除</Button>
            </Fragment>
        )
    }


    const renderPrompt = () => {
        return (
            <TextArea rows={7} placeholder={"请输入关键词"}
                maxLength={1000} className="text-area-auto"
                value={stateFrame.prompt}
                onChange={handleEditPrompt} />
        )
    }


    const renderImage = (path?: string) => {
        if (!path) {
            return null
        }
        return <Image src={tauri.convertFileSrc(path)} className="generate-image" preview={true} />
    }


    const renderImageHistory = () => {
        if (!stateFrame.image?.history.length) {
            return <div>待生成</div>
        }
        return (
            <div className="flexR"
                style={{ flexWrap: "wrap", justifyContent: "flex-start", width: '100%' }}
                onClick={() => setIsOpenHistory(true)}
            >
                {stateFrame.image?.history.map((p, idx) => {
                    return <Image src={tauri.convertFileSrc(p)} className="generate-image size-s" preview={false} key={idx} />
                })}
            </div>
        )
    }


    const renderOperate = () => {
        return (
            <Fragment>
                <Button type='default' className='btn-default-auto btn-default-98' onClick={handleImage2TextCatch}>反推关键词</Button>
                <Button type='default' className='btn-default-auto btn-default-98' onClick={handleText2ImageCatch} disabled={!stateFrame.prompt}>生成图片</Button>
            </Fragment>
        )
    }


    const handleUpdateCurrentImage = async (path: string) => {
        await keyFreamRepo.updateItem(index, { ...stateFrame, image: { ...stateFrame.image, path: path } }, true)
    }


    return (
        <div className='tr flexR' style={style} key={key}>
            {generateImagesColumns.map((i, index) => {
                return (
                    <div className='td script-id flexC' key={i.key + index} style={{ flex: `${i.space}` }}>
                        {i.key === 'number' ? renderNumber() : null}
                        {i.key === 'path' && <AssetImage path={stateFrame.path} />}
                        {i.key === 'drawPrompt' ? renderPrompt() : null}
                        {i.key === 'drawImage' && <AssetImage path={stateFrame.image?.path} />}
                        {i.key === 'drawImageHistory' ? renderImageHistory() : null}
                        {i.key === 'operate' ? renderOperate() : null}
                    </div>
                )
            })}
            <HistoryImageModule
                isOpen={isOpenHistory} onClose={() => setIsOpenHistory(false)}
                paths={stateFrame.image?.history || []} defaultPath={stateFrame.image?.path || ""}
                onChangeNewImage={handleUpdateCurrentImage} />
        </div>
    )
}

const AssetImage: React.FC<{ path?: string }> = ({ path }) => {
    // const AssetImage = (path?: string) => {

    const [url, setUrl] = useState<string | undefined>(path)
    const keyFreamRepo = useKeyFrameRepository(state => state)

    const render = async (path: string) => {
        setUrl(tauri.convertFileSrc(await keyFreamRepo.absulotePath(path)))
    }
    useEffect(() => {
        if (path) render(path)
    }, [path])

    if (url) {
        return <Image src={url} className="generate-image" preview={true} />
    }
    return <Fragment />
}


export default GenerateImagesTR