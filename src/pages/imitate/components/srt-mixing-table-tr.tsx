import { Button, Image, Modal, Typography, message } from "antd"
import TextArea from "antd/es/input/TextArea";
import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { srtMixingColumns } from "../data";
import { tauri } from "@tauri-apps/api";
import { SRTFrame, useSRTFrameRepository } from "@/repository/srt";
import { useGPTAssistantsApi } from "@/repository/gpt";

interface SRTMixingTRProps {
    index: number
    frame: SRTFrame,
}

const SRTMixingTR: React.FC<SRTMixingTRProps> = ({ index, frame }) => {
    const [stateFrame, setFrame] = useState<SRTFrame>({ ...frame })
    const srtFreamRepo = useSRTFrameRepository(state => state)
    const gptApi = useGPTAssistantsApi(state => state)

    console.info("渲染：", index)
    useMemo(() => {

        const unsub = useSRTFrameRepository.subscribe(
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
        srtFreamRepo.updateItem(index, { ...stateFrame, content: e.target.value }, false)
    }


    const handleEditRewrite = useCallback((e: any) => {
        srtFreamRepo.lazyUpdateItem(index, { ...stateFrame, rewrite: e.target.value })
    }, [index])



    const handleRewriteContent = async () => {
        message.loading("ai 改写中...")
        await srtFreamRepo.aiRewriteContent(index, gptApi).catch(err => message.error(err.message)).finally(() => message.destroy())
    }


    const renderNumber = () => {
        return (
            <Fragment>
                <div className='index'>{index + 1}</div>
                <Typography.Paragraph style={{ color: 'white' }}>开始:{stateFrame.startTime.text}</Typography.Paragraph>
                <Typography.Paragraph style={{ color: 'white' }}>结束:{stateFrame.endTime.text}</Typography.Paragraph>
                <Button type='default' className='btn-default-auto btn-default-98' disabled={index === 0}>向上合并</Button>
                <Button type='default' className='btn-default-auto btn-default-98' disabled={index === srtFreamRepo.items.length - 1}>向下合并</Button>
            </Fragment>
        )
    }


    const renderContent = () => {
        return (
            <TextArea rows={7} placeholder={"请输入台词"}
                maxLength={1000} className="text-area-auto"
                value={stateFrame.content}
                onChange={handleEditContent} />
        )
    }

    const renderRewriteContent = () => {
        return (
            <TextArea rows={7} placeholder={"请输入改写台词"}
                maxLength={1000} className="text-area-auto"
                value={stateFrame.rewrite}
                onChange={handleEditRewrite} />
        )
    }



    const renderImages = () => {
        if (!stateFrame.images) {
            return <div>待导入</div>
        }
        return (
            <div className="flexR" style={{ flexWrap: "wrap", justifyContent: "flex-start", width: '100%' }}>
                {stateFrame.images?.map((p, idx) => {
                    return <Image src={tauri.convertFileSrc(p.path)} className="generate-image" preview={false} key={idx} />
                })}
            </div>
        )
    }


    const renderOperate = () => {
        return (
            <Fragment>
                <Button type='default' className='btn-default-auto btn-default-98' onClick={handleRewriteContent}>AI改写</Button>
                <Button type='default' className='btn-default-auto btn-default-98' onClick={handleRewriteContent}>动效</Button>
            </Fragment>
        )
    }


    return (
        <div className='tr flexR'>
            {srtMixingColumns.map((i, index) => {
                return (
                    <div className='td script-id flexC' key={i.key + index} style={{ flex: `${i.space}` }}>
                        {i.key === 'number' ? renderNumber() : null}
                        {i.key === 'images' ? renderImages() : null}
                        {i.key === 'content' ? renderContent() : null}
                        {i.key === 'rewrite' ? renderRewriteContent() : null}
                        {i.key === 'operate' ? renderOperate() : null}
                    </div>
                )
            })}
        </div>
    )
}

export default React.memo(SRTMixingTR)