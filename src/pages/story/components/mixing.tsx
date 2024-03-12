import { mixingColumns } from "../data"
import { useActorRepository, useChapterRepository } from "@/repository/story"
import { Button, InputNumber, message } from "antd"
import { List, AutoSizer, ListRowProps } from 'react-virtualized';
import MixingTableTR from "./mixing-table-tr"
import { dialog, event } from "@tauri-apps/api";
import { SRTGenerate } from "@/repository/generate_utils";
import { useEffect, useState } from "react";
import { useTTSRepository } from "@/repository/tts";
import HandleProcessModal from "@/components/handle-process";
import { Project } from "@/repository/workspace";
import { TTSVoiceModal } from "@/components/voice-select";
import { AudioOption, DEFAULT_AUDIO_OPTION } from "@/repository/tts_api";

interface MixingTabProps {
    pid: string
    project: Project
}

const MixingTab: React.FC<MixingTabProps> = ({ pid, project }) => {
    console.info(pid)
    const chapterRepo = useChapterRepository(state => state)
    const ttsRepo = useTTSRepository(state => state)
    const actorRepo = useActorRepository(state => state)

    //批量处理
    const [batchPos, setBatchPos] = useState<number>(1)
    const [stateProcess, setProcess] = useState<{ open: boolean, title: string, run_event?: string, exit_event?: string }>({ open: false, title: "" });
    const [stateTTS, setTTS] = useState<{ open: boolean, audio: AudioOption }>({ open: false, audio: DEFAULT_AUDIO_OPTION });


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
        return <MixingTableTR key={key} index={index} chapter={items[index]} style={style} audio={stateTTS.audio} />
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


    const destroyProcessModal = () => {
        //变更状态位
        chapterRepo.setBatchExit()
        setProcess({ open: false, title: "" })
    }

    //-------------------------------批量生成音频-----------------------------

    const batchGenerateAudio = async (next_idx: number, end_idx: number) => {

        //查询状态
        if (chapterRepo.isBatchExit() || next_idx === chapterRepo.items.length) {
            return;
        }
        let next_pos = next_idx + 1
        setBatchPos(next_pos)


        //通知进度
        await event.emit("batchGenerateAudio", {
            title: "正在处理第" + next_pos + "个镜头",
            except: end_idx,
            completed: next_pos,
            current: next_pos
        })

        //执行任务
        await chapterRepo.handleGenerateAudio(next_idx, stateTTS.audio, actorRepo, ttsRepo).then(async () => {
            if (chapterRepo.isBatchExit()) {
                return;
            }
            await batchGenerateAudio(next_idx + 1, end_idx)
        }).finally(chapterRepo.resetBatchExit)
    }

    const handleBatchGenerateAudio = async () => {
        //重置
        setProcess({ open: true, run_event: "batchGenerateAudio", title: "批量生成音频..." })

        chapterRepo.resetBatchExit()
        await batchGenerateAudio(batchPos - 1, chapterRepo.items.length).catch(err => { message.error(err.message) }).finally(destroyProcessModal)
    }


    //-------------------------------批量生成视频-----------------------------

    // const batchGenerateVideo = async (next_idx: number) => {
    //     //查询状态
    //     if (chapterRepo.isBatchExit() || next_idx === chapterRepo.items.length) {
    //         return;
    //     }
    //     setBatchPos(next_idx + 1)
    //     //执行任务
    //     await chapterRepo.handleGenerateVideo(next_idx, draftRepo).then(async () => {
    //         if (chapterRepo.isBatchExit()) {
    //             return;
    //         }
    //         await batchGenerateVideo(next_idx + 1)
    //     }).finally(chapterRepo.resetBatchExit)
    // }
    // const handleBatchGenerateVideo = async () => {
    //     //重置
    //     chapterRepo.resetBatchExit()
    //     await batchGenerateVideo(batchPos - 1).finally(() => setBatchVideoLoading(false))
    // }




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
                    <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleBatchGenerateAudio}>批量生成音频</Button>
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

            {stateTTS.open && <TTSVoiceModal
                isOpen={stateTTS.open}
                audio={stateTTS.audio}
                setOpen={(flag) => setTTS({ ...stateTTS, open: flag })}
                onChange={(v) => setTTS({ open: false, audio: v })} />}
        </div>
    )
}

export default MixingTab