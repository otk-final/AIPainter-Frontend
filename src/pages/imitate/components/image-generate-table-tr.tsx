import { Button, message, Modal } from "antd"
import TextArea from "antd/es/input/TextArea";
import React, { Fragment, useEffect, useState } from "react";
import { generateImagesColumns } from "../data";
import { KeyFrame, useKeyFrameRepository } from "@/repository/keyframe";
import { useComfyUIRepository } from "@/repository/comfyui";
import { AssetImage, KeyFrameHistoryImages, ModalHistoryImages } from "@/components/history-image";
import VideoPlayerModal from "./video-player";
import { Project } from "@/repository/workspace";
import dialog from '@tauri-apps/plugin-dialog';

interface GenerateImagesTRProps {
    key: string
    index: number
    mode: string
    style: React.CSSProperties
    frame: KeyFrame,
    project: Project
}

const GenerateImagesTR: React.FC<GenerateImagesTRProps> = ({ key, index, style, mode, frame, project }) => {
    const [stateFrame, setFrame] = useState<KeyFrame>({ ...frame })
    const keyFrameRepo = useKeyFrameRepository(state => state)
    const comfyUIRepo = useComfyUIRepository(state => state)

    useEffect(() => {
        const unsub = useKeyFrameRepository.subscribe(
            (state) => state.items[index],
            async (state) => state && setFrame(state),
            { fireImmediately: true })
        return unsub
    }, [index])


    const handleEditPrompt = async (e: any) => {
        await keyFrameRepo.updateItem(index, { ...stateFrame, prompt: e.target.value }, false)
    }

    const handleImage2Text = async () => {
        Modal.info({
            content: <div style={{ color: '#fff' }}>反推关键词...</div>,
            footer: null,
            mask: true,
            maskClosable: false,
        });
        await keyFrameRepo.handleGeneratePrompt(index, comfyUIRepo).catch(err => { message.error(err.message) }).finally(Modal.destroyAll)
    }

    const handleText2Image = async () => {
        Modal.info({
            content: <div style={{ color: '#fff' }}>生成图片...</div>,
            footer: null,
            mask: true,
            maskClosable: false,
        })
        await keyFrameRepo.handleGenerateImage(index, mode, comfyUIRepo).catch(err => { message.error(err.message) }).finally(Modal.destroyAll)
    }

    const handleScaleImage = async () => {
        Modal.info({
            content: <div style={{ color: '#fff' }}>图片放大...</div>,
            footer: null,
            mask: true,
            maskClosable: false,
        })
        await keyFrameRepo.handleScaleImage(index).catch(err => { message.error(err.message) }).finally(Modal.destroyAll)
    }

    const handleDelKeyFrame = async () => {
        const ok = await dialog.confirm('删除当前画面时，对应原始字幕一并删除', { title: '删除画面', kind: "warning" });
        if (ok) await keyFrameRepo.delItem(index, true)
    }

    const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
    const [videoPlayerUrl, setVideoPlayerUrl] = useState<string | undefined>();
    const startPlayerFrament = async () => {
        setVideoPlayerUrl(await keyFrameRepo.absulotePath(stateFrame.srt_video_path!))
        setIsVideoPlayerOpen(true);
    }


    const renderNumber = () => {
        return (
            <Fragment>
                <div className='index'>{index + 1}</div>
                <Button type='default' className='btn-default-auto btn-default-98' style={{ width: '76px' }} onClick={handleDelKeyFrame}>删除</Button>
                {/* <Button type='default' className='btn-default-auto btn-default-98' style={{ width: '76px' }} onClick={startPlayerFrament}>播放片段</Button> */}
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
                <Button type='default' className='btn-default-auto btn-default-98' onClick={handleImage2Text}>反推关键词</Button>
                <Button type='default' className='btn-default-auto btn-default-98' onClick={handleText2Image} disabled={!stateFrame.prompt}>{stateFrame.image.path ? "重新生成" : "生成图片"}</Button>
                <Button type='default' className='btn-default-auto btn-default-98' onClick={handleScaleImage} disabled={!stateFrame.image.path}>高清放大</Button>
            </Fragment>
        )
    }



    const handleUpdateCurrentImage = async (path: string) => {
        await keyFrameRepo.updateItem(index, { ...stateFrame, image: { ...stateFrame.image, path: path } }, true)
    }

    const [isOpen, setOpen] = useState(false)
    return (
        <div className='list-tr flexR' style={style} key={key}>
            {generateImagesColumns.map((i, idx) => {
                return (
                    <div className='list-td script-id flexC' key={i.key + idx} style={{ flex: i.key === 'number' ? `0 0 124px` : `${i.space}` }}>
                        {i.key === 'number' ? renderNumber() : null}
                        {i.key === 'path' && <AssetImage path={stateFrame.path} repo={keyFrameRepo} />}
                        {i.key === 'drawPrompt' ? renderPrompt() : null}
                        {i.key === 'drawImage' && <AssetImage path={stateFrame.image?.path} repo={keyFrameRepo} />}
                        {i.key === 'drawImageHistory' && <KeyFrameHistoryImages pid={project.id} setOpen={setOpen} idx={index} />}
                        {i.key === 'operate' ? renderOperate() : null}
                    </div>
                )
            })}
            <ModalHistoryImages isOpen={isOpen} setOpen={setOpen} path={stateFrame.image?.path} history={stateFrame.image?.history} repo={keyFrameRepo} onChange={handleUpdateCurrentImage} />
            {isVideoPlayerOpen && <VideoPlayerModal videoPath={videoPlayerUrl!} isOpen={isVideoPlayerOpen} onClose={() => setIsVideoPlayerOpen(false)} />}
        </div>
    )
}

export default GenerateImagesTR