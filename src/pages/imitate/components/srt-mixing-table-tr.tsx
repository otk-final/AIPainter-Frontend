import { Button, Modal, Typography, message } from "antd"
import TextArea from "antd/es/input/TextArea";
import React, { Fragment, useMemo, useState } from "react";
import { srtMixingColumns } from "../data";
import { useGPTAssistantsApi } from "@/repository/gpt";
import { KeyFrame, useKeyFrameRepository } from "@/repository/keyframe";
import { useTTSRepository } from "@/repository/tts";
import { CameraFilled, SoundFilled } from "@ant-design/icons";
import { AssetImage } from "@/components/history-image";
import ButtonGroup from "antd/es/button/button-group";
import VideoPlayerModal from "./video-player";
import { AudioOption } from "@/repository/tts_api";

interface SRTMixingTRProps {
    geAudioOption: () => AudioOption | undefined
    key: string,
    index: number,
    frame: KeyFrame,
    style: React.CSSProperties
}


const SRTMixingTR: React.FC<SRTMixingTRProps> = ({ index, frame, geAudioOption, key, style }) => {
    const [stateFrame, setFrame] = useState<KeyFrame>({ ...frame })
    const keyFreamRepo = useKeyFrameRepository(state => state)
    const ttsRepo = useTTSRepository(state => state)
    const gptApi = useGPTAssistantsApi(state => state)


    useMemo(() => {
        const unsub = useKeyFrameRepository.subscribe(
            (state) => state.items[index],
            async (state) => {
                if (state) setFrame(state)
            },
            {
                fireImmediately: true
            })
        return unsub
    }, [index])



    const handleEditContent = async (e: any) => {
        await keyFreamRepo.updateItem(index, { ...stateFrame, srt: e.target.value }, false)
    }

    const handleEditRewrite = async (e: any) => {
        await keyFreamRepo.updateItem(index, { ...stateFrame, srt_rewrite: e.target.value }, false)
    }


    const [isOpen, setOpen] = useState<boolean>(false)
    const [playerUrl, setPlayerUrl] = useState<string | undefined>()

    const hanldePlayer = async (path: string) => {
        setOpen(true)
        setPlayerUrl(await keyFreamRepo.absulotePath(path))
    }


    const handleRewriteContent = async () => {
        Modal.info({
            content: <div style={{ color: '#fff' }}>GPT改写中...</div>,
            footer: null,
            mask: true,
            maskClosable: false,
        })
        await keyFreamRepo.handleRewriteContent(index, gptApi).catch(err => message.error(err)).finally(Modal.destroyAll)
    }

    const handleRecognize = async () => {
        Modal.info({
            content: <div style={{ color: '#fff' }}>识别字幕...</div>,
            footer: null,
            mask: true,
            maskClosable: false,
        })
        await keyFreamRepo.recognizeContent(index).catch(err => message.error(err)).finally(Modal.destroyAll)
    }

    const handleGenerateAudio = async () => {
        let option = geAudioOption()
        if (!option) {
            return message.error("选择声音")
        }
        Modal.info({
            content: <div style={{ color: '#fff' }}>生成音频...</div>,
            footer: null,
            mask: true,
            maskClosable: false,
        })
        let ttsApi = await ttsRepo.newClient()
        let path = await keyFreamRepo.handleGenerateAudio(index, option, ttsApi).catch(err => message.error(err)).finally(Modal.destroyAll)

        //播放
        hanldePlayer(path as string)

    }
    const handleGenerateVideo = async () => {

        Modal.info({
            content: <div style={{ color: '#fff' }}>合成视频...</div>,
            footer: null,
            mask: true,
            maskClosable: false,
        })
        let path = await keyFreamRepo.handleGenerateVideo(index).catch(err => message.error(err)).finally(Modal.destroyAll)

        hanldePlayer(path as string)
    }

    const renderNumber = () => {
        return (
            <Fragment>
                <div className='index'>{index + 1}</div>
                <div>
                    <Typography.Paragraph style={{ color: 'white', fontSize: 10 }}>原始:{stateFrame.srt_duration}</Typography.Paragraph>
                    <Typography.Paragraph style={{ color: 'white', fontSize: 10 }}>改写:{stateFrame.srt_rewrite_duration}</Typography.Paragraph>
                </div>
            </Fragment>
        )
    }

    const renderContent = () => {
        return (
            <TextArea rows={7} placeholder={"请输入台词"}
                maxLength={1000} className="text-area-auto"
                value={stateFrame.srt}
                onChange={handleEditContent} />
        )
    }

    const renderRewriteContent = () => {
        return (
            <TextArea rows={7} placeholder={"请输入改写台词"}
                maxLength={1000} className="text-area-auto"
                value={stateFrame.srt_rewrite}
                onChange={handleEditRewrite} />
        )
    }

    const renderOperate = () => {
        return (
            <Fragment>
                <Button type='default' className='btn-default-auto btn-default-98' onClick={handleRecognize}>原字幕识别</Button>
                <Button type='default' className='btn-default-auto btn-default-98' onClick={handleRewriteContent} disabled={!stateFrame.srt}>AI改写</Button>
                <ButtonGroup>
                    <Button type='default' className='btn-default-auto btn-default-98' onClick={handleGenerateAudio} disabled={!stateFrame.srt_rewrite}>生成音频</Button>
                    <Button type='default' className='btn-default-auto btn-default-98' onClick={() => hanldePlayer(stateFrame.srt_rewrite_audio_path!)} disabled={!stateFrame.srt_rewrite_audio_path} icon={<SoundFilled />}>播放</Button>
                </ButtonGroup>
                <ButtonGroup>
                    <Button type='default' className='btn-default-auto btn-default-98' onClick={handleGenerateVideo} disabled={!(stateFrame.srt_rewrite_audio_path && stateFrame.image.path)}>生成视频</Button>
                    <Button type='default' className='btn-default-auto btn-default-98' onClick={() => hanldePlayer(stateFrame.srt_rewrite_video_path!)} disabled={!stateFrame.srt_rewrite_video_path} icon={<CameraFilled />}>播放</Button>
                </ButtonGroup>
            </Fragment>
        )
    }


    return (
        <div className='tr flexR' style={style} key={key}>
            {srtMixingColumns.map((i, index) => {
                return (
                    <div className='td script-id flexC' key={i.key + index} style={{ flex: `${i.space}` }}>
                        {i.key === 'number' ? renderNumber() : null}
                        {i.key === 'srcImage' && <AssetImage path={stateFrame.path} repo={keyFreamRepo} />}
                        {i.key === 'newImage' && <AssetImage path={stateFrame.image.path} repo={keyFreamRepo} />}
                        {i.key === 'srt' ? renderContent() : null}
                        {i.key === 'srt_rewrite' ? renderRewriteContent() : null}
                        {i.key === 'operate' ? renderOperate() : null}
                    </div>
                )
            })}
            {(isOpen && playerUrl) && <VideoPlayerModal videoPath={playerUrl} isOpen={isOpen} onClose={() => setOpen(false)} />}
        </div>
    )
}

export default React.memo(SRTMixingTR)