import { srtMixingColumns } from "../data"
import { ImitateTabType } from ".."
import SRTMixingTR from "./srt-mixing-table-tr"
// import { dialog } from "@tauri-apps/api"
import { List, AutoSizer, ListRowProps } from 'react-virtualized';

import 'react-virtualized/styles.css'; // 导入样式文件
import { Button, InputNumber, message } from "antd"
import React, { useEffect, useState } from "react"
import { useKeyFrameRepository } from "@/repository/keyframe";
// import { SRTGenerate } from "@/repository/generate_utils";
import { useTTSRepository } from "@/repository/tts";
import { useGPTRepository } from "@/repository/gpt";
import HandleProcessModal from "@/components/handle-process";
import { event } from "@tauri-apps/api";
// import { useJYDraftRepository } from "@/repository/draft";

interface SRTMixingProps {
    pid: string,
    handleChangeTab: (key: ImitateTabType) => void,
}

const SRTMixingTab: React.FC<SRTMixingProps> = ({ pid }) => {
    const keyFrameRepo = useKeyFrameRepository(state => state)
    // const draftRepo = useJYDraftRepository(state => state)
    const ttsRepo = useTTSRepository(state => state)
    const gptRepo = useGPTRepository(state => state)
    const [stateProcess, setProcess] = useState<{ open: boolean, title: string, run_event?: string, exit_event?: string }>({ open: false, title: "" });

    // const handleExportSRTFile = async () => {
    //     let selected = await dialog.save({ title: "保存文件", filters: [{ name: "SRT文件", extensions: ["srt"] }] })
    //     if (!selected) {
    //         return
    //     }
    //     //有效片段
    //     let valids = await keyFrameRepo.formatFragments()
    //     await SRTGenerate(selected as string, valids).finally(() => { message.success("导出成功") })
    // }

    const _rowRenderer = ({ index, key, style }: ListRowProps) => {
        const items = keyFrameRepo.items;
        return <SRTMixingTR key={key} frame={items[index]} style={style} index={index} />
    }

    //批量处理
    const [batchPos, setBatchPos] = useState<number>(1)

    useEffect(() => {
        return () => { keyFrameRepo.setBatchExit() }
    }, [])


    const destroyProcessModal = () => {
        //变更状态位
        keyFrameRepo.setBatchExit()
        setProcess({ open: false, title: "" })
    }


    //-------------------------------批量改写-----------------------------

    const batchRewrite = async (next_idx: number, end_idx: number) => {
        //查询状态
        if (keyFrameRepo.isBatchExit() || next_idx === end_idx) {
            return;
        }

        let next_pos = next_idx + 1
        setBatchPos(next_pos)


        //通知进度
        await event.emit("batchRewrite", {
            title: "正在处理第" + next_pos + "帧",
            except: end_idx,
            completed: next_pos,
            current: next_pos
        })


        //执行任务
        await keyFrameRepo.handleRewriteContent(next_idx, gptRepo).then(async () => {
            if (keyFrameRepo.isBatchExit()) {
                return;
            }
            await batchRewrite(next_idx + 1, end_idx)
        }).finally(keyFrameRepo.resetBatchExit)
    }
    const handleBatchRewrite = async () => {

        if (batchPos <= 0 || batchPos > keyFrameRepo.items.length) {
            return message.error("批量起始位置错误")
        }


        setProcess({ open: true, run_event: "batchRewrite", title: "批量重写字幕..." })

        keyFrameRepo.resetBatchExit()
        await batchRewrite(batchPos - 1, keyFrameRepo.items.length).finally(destroyProcessModal)
    }

    //-------------------------------批量生成音频-----------------------------

    const batchGenerateAudio = async (next_idx: number, end_idx: number) => {
        //查询状态
        if (keyFrameRepo.isBatchExit() || next_idx === end_idx) {
            return;
        }
        let next_pos = next_idx + 1
        setBatchPos(next_pos)

        //通知进度
        await event.emit("batchGenerateAudio", {
            title: "正在处理第" + next_pos + "帧",
            except: end_idx,
            completed: next_pos,
            current: next_pos
        })

        //执行任务
        await keyFrameRepo.handleGenerateAudio(next_idx, ttsRepo).then(async () => {
            if (keyFrameRepo.isBatchExit()) {
                return;
            }
            await batchGenerateAudio(next_idx + 1, end_idx)
        }).finally(keyFrameRepo.resetBatchExit)
    }
    const handleBatchGenerateAudio = async () => {

        if (batchPos <= 0 || batchPos > keyFrameRepo.items.length) {
            return message.error("批量起始位置错误")
        }


        //重置
        setProcess({ open: true, run_event: "batchGenerateAudio", title: "批量生成音频..." })
        keyFrameRepo.resetBatchExit()

        await batchGenerateAudio(batchPos - 1, keyFrameRepo.items.length).catch(err => message.error(err.message)).finally(destroyProcessModal)
    }


    //-------------------------------批量生成视频-----------------------------


    // const batchGenerateVideo = async (next_idx: number, end_idx: number) => {
    //     //查询状态
    //     if (keyFrameRepo.isBatchExit() || next_idx === end_idx) {
    //         return;
    //     }
    //     setBatchPos(next_idx + 1)
    //     //执行任务
    //     await keyFrameRepo.handleGenerateVideo(next_idx, draftRepo).then(async () => {
    //         if (keyFrameRepo.isBatchExit()) {
    //             return;
    //         }
    //         await batchGenerateVideo(next_idx + 1, next_idx)
    //     }).finally(keyFrameRepo.resetBatchExit)
    // }


    // const handleBatchGenerateVideo = async () => {
    //     //重置
    //     setBatchVideoLoading(true)
    //     keyFrameRepo.resetBatchExit()

    //     await batchGenerateVideo(batchPos - 1, keyFrameRepo.items.length).finally(() => setBatchVideoLoading(false))
    // }

    // const handleExitBatchGenerateVideo = () => {
    //     keyFrameRepo.setBatchExit()
    //     setBatchVideoLoading(false)
    // }

    const renderTable = () => {
        return <div className='script-table-wrap' style={{ height: 'calc(100% - 60px)', display: "flex", flexDirection: 'column' }}>
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
                    <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleBatchRewrite}>一键改写</Button>
                    <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleBatchGenerateAudio}>批量生成音频</Button>
                    {/* <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleBatchGenerateVideo} loading={batchVideoLoading} >批量生成视频</Button> */}
                </div>
            </div>
            {renderTable()}

            {stateProcess.open && <HandleProcessModal
                open={stateProcess.open}
                pid={pid}
                title={stateProcess.title}
                running_event={stateProcess.run_event}
                exit_event={stateProcess.exit_event}
                onClose={destroyProcessModal} />}
        </div>
    )
}

export default SRTMixingTab