import { srtMixingColumns } from "../data"
import { ImitateTabType } from ".."
import SRTMixingTR from "./srt-mixing-table-tr"
import { dialog } from "@tauri-apps/api"
import { List, AutoSizer, ListRowProps } from 'react-virtualized';

import 'react-virtualized/styles.css'; // 导入样式文件
import { Button, InputNumber, message } from "antd"
import React, { useEffect, useState } from "react"
import { useKeyFrameRepository } from "@/repository/keyframe";
import { SRTGenerate } from "@/repository/generate_utils";
import { useBaisicSettingRepository } from "@/repository/draft";
import { useTTSRepository } from "@/repository/tts";
import { CloseCircleFilled } from "@ant-design/icons";
import { useGPTRepository } from "@/repository/gpt";

interface SRTMixingProps {
    pid: string,
    handleChangeTab: (key: ImitateTabType) => void,
}

const SRTMixingTab: React.FC<SRTMixingProps> = ({ }) => {
    const keyFrameRepo = useKeyFrameRepository(state => state)
    const settingRepo = useBaisicSettingRepository(state => state)
    const ttsRepo = useTTSRepository(state => state)
    const gptRepo = useGPTRepository(state => state)

    const handleExportSRTFile = async () => {
        let selected = await dialog.save({ title: "保存文件", filters: [{ name: "SRT文件", extensions: ["srt"] }] })
        if (!selected) {
            return
        }
        //有效片段
        let valids = await keyFrameRepo.formatFragments()
        await SRTGenerate(selected as string, valids).finally(() => { message.success("导出成功") })
    }

    const _rowRenderer = ({ index, key, style }: ListRowProps) => {
        const items = keyFrameRepo.items;
        return <SRTMixingTR key={key} frame={items[index]} style={style} index={index} />
    }

    //批量处理
    const [batchPos, setBatchPos] = useState<number>(1)
    const [batchAudioLoading, setBatchAudioLoading] = useState<boolean>(false)
    const [batchVideoLoading, setBatchVideoLoading] = useState<boolean>(false)
    const [batchRewriteLoading, setBatchRewriteLoading] = useState<boolean>(false)

    useEffect(() => {
        return () => { keyFrameRepo.setBatchExit() }
    }, [])




    //-------------------------------批量改写-----------------------------

    const batchRewrite = async (next_idx: number, end_idx: number) => {
        //查询状态
        if (keyFrameRepo.isBatchExit() || next_idx === end_idx) {
            return;
        }
        setBatchPos(next_idx + 1)
        //执行任务
        await keyFrameRepo.handleRewriteContent(next_idx, gptRepo).then(async () => {
            if (keyFrameRepo.isBatchExit()) {
                return;
            }
            await batchRewrite(next_idx + 1, end_idx)
        }).finally(keyFrameRepo.resetBatchExit)
    }
    const handleBatchRewrite = async () => {
        //重置
        setBatchRewriteLoading(true)
        keyFrameRepo.resetBatchExit()

        await batchRewrite(batchPos - 1, keyFrameRepo.items.length).finally(() => setBatchRewriteLoading(false))
    }

    const handleExitBatchRewrite = () => {
        keyFrameRepo.setBatchExit()
        setBatchRewriteLoading(false)
    }


    //-------------------------------批量生成音频-----------------------------

    const batchGenerateAudio = async (next_idx: number, end_idx: number) => {
        //查询状态
        if (keyFrameRepo.isBatchExit() || next_idx === end_idx) {
            return;
        }
        setBatchPos(next_idx + 1)

        //通用音频参数
        let audioOption = { ...settingRepo.audio.option };
        //执行任务
        await keyFrameRepo.handleGenerateAudio(next_idx, audioOption, settingRepo, ttsRepo).then(async () => {
            if (keyFrameRepo.isBatchExit()) {
                return;
            }
            await batchGenerateAudio(next_idx + 1, end_idx)
        }).finally(keyFrameRepo.resetBatchExit)
    }
    const handleBatchGenerateAudio = async () => {
        //重置
        setBatchAudioLoading(true)
        keyFrameRepo.resetBatchExit()

        await batchGenerateAudio(batchPos - 1, keyFrameRepo.items.length).finally(() => setBatchAudioLoading(false))
    }

    const handleExitBatchGenerateAudio = () => {
        keyFrameRepo.setBatchExit()
        setBatchAudioLoading(false)
    }

    //-------------------------------批量生成视频-----------------------------


    const batchGenerateVideo = async (next_idx: number, end_idx: number) => {
        //查询状态
        if (keyFrameRepo.isBatchExit() || next_idx === end_idx) {
            return;
        }
        setBatchPos(next_idx + 1)
        //执行任务
        await keyFrameRepo.handleGenerateVideo(next_idx, settingRepo).then(async () => {
            if (keyFrameRepo.isBatchExit()) {
                return;
            }
            await batchGenerateVideo(next_idx + 1, next_idx)
        }).finally(keyFrameRepo.resetBatchExit)
    }

    const handleBatchGenerateVideo = async () => {
        //重置
        setBatchVideoLoading(true)
        keyFrameRepo.resetBatchExit()

        await batchGenerateVideo(batchPos - 1, keyFrameRepo.items.length).finally(() => setBatchVideoLoading(false))
    }

    const handleExitBatchGenerateVideo = () => {
        keyFrameRepo.setBatchExit()
        setBatchVideoLoading(false)
    }



    return (
        <div className="generate-image-wrap">
            <div className='generate-header flexR'>
                {/* <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleExportSRTFile}>导出新字幕文件</Button> */}
                <div className='flexR'></div>
                <div className='flexR'>
                    <div className='flexR'>批量开始起点 <InputNumber controls={false} style={{ width: "54px", marginLeft: '10px', marginRight: '10px' }} className="inputnumber-auto" placeholder='1'
                        defaultValue={1}
                        min={1}
                        max={keyFrameRepo.items.length}
                        value={batchPos}
                        required
                        onChange={(e) => setBatchPos(e!)} /> 镜</div>
                    <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleBatchRewrite} loading={batchRewriteLoading}>一键改写</Button>
                    <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleBatchGenerateAudio} loading={batchAudioLoading}>批量生成音频</Button>
                    {/* <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleBatchGenerateVideo} loading={batchVideoLoading} >批量生成视频</Button> */}
                    {
                        batchRewriteLoading && <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleExitBatchRewrite} icon={<CloseCircleFilled />}>取消</Button>
                    }
                    {
                        batchAudioLoading && <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleExitBatchGenerateAudio} icon={<CloseCircleFilled />}>取消</Button>
                    }
                    {
                        // batchVideoLoading && <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleExitBatchGenerateVideo} icon={<CloseCircleFilled />}>取消</Button>
                    }
                </div>
            </div>

            <div className='script-table-wrap' style={{ height: 'calc(100% - 60px)', display: "flex", flexDirection: 'column' }}>
                <div className='th flexR'>
                    {srtMixingColumns.map((i) => {
                        return <div className='th-td' style={{ flex: `${i.space}` }} key={i.key}>{i.title}</div>
                    })}
                </div>
                <div style={{ flex: 1 }} >
                    <AutoSizer>
                        {({ height, width }) => {
                            let len = keyFrameRepo.items.length;
                            return (
                                <List
                                    className='autosizer scrollbar'
                                    height={height - 50}
                                    rowCount={len}
                                    rowHeight={184}
                                    rowRenderer={_rowRenderer}
                                    width={width}
                                    noRowsRenderer={() => <div></div>}
                                    overscanRowCount={20}
                                />
                            )
                        }}
                    </AutoSizer>
                </div>
            </div>
        </div>
    )
}

export default SRTMixingTab