import { Button, message, Modal } from "antd"
import TextArea from "antd/es/input/TextArea";
import React, { Fragment, useEffect, useState } from "react";
import { generateImagesColumns } from "../data";
import { KeyFrame, useKeyFrameRepository } from "@/repository/keyframe";
import { useComfyUIRepository } from "@/repository/comfyui";
import { AssetHistoryImages, AssetImage, ModalHistoryImages } from "@/components/history-image";

interface GenerateImagesTRProps {
    key: string
    index: number
    mode: string
    style: React.CSSProperties
    frame: KeyFrame,
}

const GenerateImagesTR: React.FC<GenerateImagesTRProps> = ({ key, index, style, mode, frame }) => {
    const [stateFrame, setFrame] = useState<KeyFrame>({ ...frame })
    const keyFreamRepo = useKeyFrameRepository(state => state)
    const comfyUIRepo = useComfyUIRepository(state => state)

    useEffect(() => {
        const unsub = useKeyFrameRepository.subscribe(
            (state) => state.items[index],
            async (state) => state && setFrame(state),
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

    const [isOpen, setOpen] = useState(false)
    return (
        <div className='tr flexR' style={style} key={key}>
            {generateImagesColumns.map((i, index) => {
                return (
                    <div className='td script-id flexC' key={i.key + index} style={{ flex: `${i.space}` }}>
                        {i.key === 'number' ? renderNumber() : null}
                        {i.key === 'path' && <AssetImage path={stateFrame.path} repo={keyFreamRepo} />}
                        {i.key === 'drawPrompt' ? renderPrompt() : null}
                        {i.key === 'drawImage' && <AssetImage path={stateFrame.image?.path} repo={keyFreamRepo} />}
                        {i.key === 'drawImageHistory' && <AssetHistoryImages setOpen={setOpen} path={stateFrame.image?.path} history={stateFrame.image?.history} repo={keyFreamRepo} />}
                        {i.key === 'operate' ? renderOperate() : null}
                    </div>
                )
            })}
            <ModalHistoryImages isOpen={isOpen} setOpen={setOpen} path={stateFrame.image?.path} history={stateFrame.image?.history} repo={keyFreamRepo} onChange={handleUpdateCurrentImage} />
        </div>
    )
}

export default GenerateImagesTR