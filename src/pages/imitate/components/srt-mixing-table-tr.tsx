import { Button, Image, Modal, Typography, message } from "antd"
import TextArea from "antd/es/input/TextArea";
import React, { Fragment, useMemo, useState } from "react";
import { srtMixingColumns } from "../data";
import { tauri } from "@tauri-apps/api";
import { useGPTAssistantsApi } from "@/repository/gpt";
import { KeyFrame, useKeyFrameRepository } from "@/repository/keyframe";

interface SRTMixingTRProps {
    voiceType: string
    key: string,
    index: number,
    frame: KeyFrame,
    style: React.CSSProperties
}


const SRTMixingTR: React.FC<SRTMixingTRProps> = ({ index, frame, voiceType, key, style }) => {
    const [stateFrame, setFrame] = useState<KeyFrame>({ ...frame })
    const srtFreamRepo = useKeyFrameRepository(state => state)
    const gptApi = useGPTAssistantsApi(state => state)

    useMemo(() => {
        const unsub = useKeyFrameRepository.subscribe(
            (state) => state.items[index],
            (state, pre) => {
                state && setFrame(state)
            },
            {
                fireImmediately: true
            })
        return unsub
    }, [index])



    const handleEditContent = async (e: any) => {
        await srtFreamRepo.updateItem(index, { ...stateFrame, srt: e.target.value }, false)
    }

    const handleEditRewrite = async (e: any) => {
        await srtFreamRepo.updateItem(index, { ...stateFrame, srt_rewrite: e.target.value }, false)
    }


    const handleRewriteContent = async () => {
        Modal.info({
            content: <div style={{color: '#fff'}}>ai 改写中...</div>,
            footer: null,
            mask: true,
            maskClosable: false,
        })
        await srtFreamRepo.aiRewriteContent(index, gptApi).catch(err => message.error(err)).finally(Modal.destroyAll)
    }

    const handleRecognize = async () => {
        Modal.info({
            content: <div style={{color: '#fff'}}>识别字幕...</div>,
            footer: null,
            mask: true,
            maskClosable: false,
        })
        await srtFreamRepo.recognizeContent(index).catch(err => message.error(err)).finally(Modal.destroyAll)
    }

    const handleGenerateAudio = async () => {
        Modal.info({
            content: <div style={{color: '#fff'}}>生成音频...</div>,
            footer: null,
            mask: true,
            maskClosable: false,
        })
        await srtFreamRepo.handleGenerateAudio(index, voiceType, gptApi).catch(err => message.error(err)).finally(Modal.destroyAll)
    }

    const renderNumber = () => {
        return (
            <Fragment>
                <div className='index'>{index + 1}</div>
                <div>
                    <Typography.Paragraph style={{ color: 'white', fontSize: 10 }}>开始:{stateFrame.srt_duration?.start}</Typography.Paragraph>
                    <Typography.Paragraph style={{ color: 'white', fontSize: 10 }}>结束:{stateFrame.srt_duration?.end}</Typography.Paragraph>
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


    const renderImage = (path?: string) => {
        if (!path) {
            return null
        }
        return <Image src={tauri.convertFileSrc(path)} className="generate-image" preview={true} />
    }

    const renderOperate = () => {
        return (
            <Fragment>
                <Button type='default' className='btn-default-auto btn-default-98' onClick={handleRecognize}>原字幕识别</Button>
                <Button type='default' className='btn-default-auto btn-default-98' onClick={handleRewriteContent} disabled={!stateFrame.srt}>AI改写</Button>
                <Button type='default' className='btn-default-auto btn-default-98' onClick={handleGenerateAudio} disabled={!stateFrame.srt_rewrite}>生成音频</Button>
            </Fragment>
        )
    }


    return (
        <div className='tr flexR' style={style} key={key}>
            {srtMixingColumns.map((i, index) => {
                return (
                    <div className='td script-id flexC' key={i.key + index} style={{ flex: `${i.space}` }}>
                        {i.key === 'number' ? renderNumber() : null}
                        {i.key === 'srcImage' ? renderImage(stateFrame.path) : null}
                        {i.key === 'newImage' ? renderImage(stateFrame.image?.path) : null}
                        {i.key === 'srt' ? renderContent() : null}
                        {i.key === 'srt_rewrite' ? renderRewriteContent() : null}
                        {i.key === 'operate' ? renderOperate() : null}
                    </div>
                )
            })}
        </div>
    )
}

export default React.memo(SRTMixingTR)