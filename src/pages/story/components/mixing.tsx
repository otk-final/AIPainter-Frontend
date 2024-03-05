import { mixingColumns } from "../data"
import { useActorRepository, useChapterRepository } from "@/repository/story"
import { Button, InputNumber, message } from "antd"
import { List, AutoSizer, ListRowProps } from 'react-virtualized';
import MixingTableTR from "./mixing-table-tr"
import { dialog } from "@tauri-apps/api";
import { SRTGenerate } from "@/repository/generate_utils";
import { useEffect, useState } from "react";
import { CloseCircleFilled } from "@ant-design/icons";
import { useBaisicSettingRepository } from "@/repository/draft";
import { useTTSRepository } from "@/repository/tts";

interface MixingTabProps {
    pid: string
}

const MixingTab: React.FC<MixingTabProps> = ({ pid }) => {
    console.info(pid)
    const chapterRepo = useChapterRepository(state => state)
    const settingRepo = useBaisicSettingRepository(state => state)
    const ttsRepo = useTTSRepository(state => state)
    const actorRepo = useActorRepository(state => state)

    const handleExportSRTFile = async () => {
        let selected = await dialog.save({ title: "保存文件", filters: [{ name: "SRT文件", extensions: ["srt"] }] })
        if (!selected) {
            return
        }
        //有效片段
        let valids = await chapterRepo.formatFragments()
        await SRTGenerate(selected as string, valids).finally(() => { message.success("导出成功") })
    }

    const _rowRenderer = ({ index, key, style }: ListRowProps) => {
        const items = chapterRepo.items;
        return <MixingTableTR key={key} index={index} chapter={items[index]} style={style} />
    }

    const renderTable = () => {
        return (
            <div className='script-table-wrap' style={{ height: 'calc(100% - 60px)', display: "flex", flexDirection: 'column' }}>
                <div className='th flexR'>
                    {mixingColumns.map((i) => {
                        return <div className='th-td' style={{ flex: `${i.space}` }} key={i.key}>{i.title}</div>
                    })}
                </div>
                <div style={{ flex: 1 }} >
                    <AutoSizer>
                        {({ height, width }) => {
                            let len = chapterRepo.items.length;
                            return (
                                <List
                                    className='autosizer scrollbar'
                                    height={height - 50}
                                    rowCount={len}
                                    rowHeight={224}
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
        )
    }


    useEffect(() => {
        return () => { chapterRepo.setBatchExit() }
    }, [])

    //批量处理
    const [batchPos, setBatchPos] = useState<number>(1)
    const [batchAudioLoading, setBatchAudioLoading] = useState<boolean>(false)
    const [batchVideoLoading, setBatchVideoLoading] = useState<boolean>(false)


    //-------------------------------批量生成音频-----------------------------

    const batchGenerateAudio = async (next_idx: number) => {
        //查询状态
        if (chapterRepo.isBatchExit() || next_idx === chapterRepo.items.length) {
            return;
        }
        setBatchPos(next_idx + 1)

        //执行任务
        await chapterRepo.handleGenerateAudio(next_idx, settingRepo, actorRepo, ttsRepo).then(async () => {
            if (chapterRepo.isBatchExit()) {
                return;
            }
            await batchGenerateAudio(next_idx + 1)
        }).finally(chapterRepo.resetBatchExit)
    }
    const handleBatchGenerateAudio = async () => {
        //重置
        setBatchAudioLoading(true)
        chapterRepo.resetBatchExit()

        await batchGenerateAudio(batchPos - 1).finally(() => setBatchAudioLoading(false))
    }

    const handleExitBatchGenerateAudio = () => {
        chapterRepo.setBatchExit()
        setBatchAudioLoading(false)
    }

    //-------------------------------批量生成视频-----------------------------


    const batchGenerateVideo = async (next_idx: number) => {
        //查询状态
        if (chapterRepo.isBatchExit() || next_idx === chapterRepo.items.length) {
            return;
        }
        setBatchPos(next_idx + 1)
        //执行任务
        await chapterRepo.handleGenerateVideo(next_idx, settingRepo).then(async () => {
            if (chapterRepo.isBatchExit()) {
                return;
            }
            await batchGenerateVideo(next_idx + 1)
        }).finally(chapterRepo.resetBatchExit)
    }
    const handleBatchGenerateVideo = async () => {
        //重置
        setBatchVideoLoading(true)
        chapterRepo.resetBatchExit()

        await batchGenerateVideo(batchPos - 1).finally(() => setBatchVideoLoading(false))
    }

    const handleExitBatchGenerateVideo = () => {
        chapterRepo.setBatchExit()
        setBatchVideoLoading(false)
    }



    return (
        <div className="storyboard-wrap">
            <div className='script-header flexR'>
                <div className='flexR'>
                    <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleExportSRTFile}>导出新字幕文件</Button>
                </div>
                <div className='flexR'>
                    <div className='flexR'>批量开始起点 <InputNumber controls={false} style={{ width: "54px", marginLeft: '10px', marginRight: '10px' }} className="inputnumber-auto" placeholder='1'
                        defaultValue={1}
                        min={1}
                        max={chapterRepo.items.length}
                        value={batchPos}
                        required
                        onChange={(e) => setBatchPos(e!)} /> 镜</div>
                    <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleBatchGenerateAudio} loading={batchAudioLoading}>批量生成音频</Button>
                    {/* <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleBatchGenerateVideo} loading={batchVideoLoading} >批量生成视频</Button> */}
                    {
                        batchAudioLoading && <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleExitBatchGenerateAudio} icon={<CloseCircleFilled />}>取消</Button>
                    }
                    {
                        batchVideoLoading && <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleExitBatchGenerateVideo} icon={<CloseCircleFilled />}>取消</Button>
                    }
                </div>
            </div>
            {renderTable()}
        </div>
    )
}

export default MixingTab