import DrawTableTR from "./drawbatch-table-tr"
import { drawbatchColumns } from "../data"
import { useEffect, useState } from "react"
import { useActorRepository, useChapterRepository } from "@/repository/story"
import { ComyUIModeSelect } from "@/components/mode-select"
import { Button, InputNumber, message } from "antd"
import { List, AutoSizer, ListRowProps } from 'react-virtualized';
import { useComfyUIRepository } from "@/repository/comfyui"
import HandleProcessModal from "@/components/handle-process"
import { event } from "@tauri-apps/api"
import { useTranslateRepository } from "@/repository/translate"
import { Project } from "@/repository/workspace"

interface DrawbatchTabProps {
    pid: string
    project: Project
}


const DrawbatchTab: React.FC<DrawbatchTabProps> = ({ pid, project }) => {
    const chapterRepo = useChapterRepository(state => state)
    const comfyuiRepo = useComfyUIRepository(state => state)
    const actorRepo = useActorRepository(state => state)
    const translateRepo = useTranslateRepository(state => state)

    const [mode, setOption] = useState<string>("")
    const [batchPos, setBatchPos] = useState<number>(1)
    const [stateProcess, setProcess] = useState<{ open: boolean, title: string, run_event?: string, exit_event?: string }>({ open: false, title: "" });


    useEffect(() => {
        return () => { chapterRepo.setBatchExit() }
    }, [])

    const _rowRenderer = ({ index, key, style }: ListRowProps) => {
        const items = chapterRepo.items;
        return <DrawTableTR key={key} index={index} chapter={items[index]} style={style} mode={mode} project={project} />
    }

    const renderTable = () => {
        return (
            <div className='script-table-wrap' style={{ height: 'calc(100% - 60px)', display: "flex", flexDirection: 'column' }}>
                <div className='list-th flexR'>
                    {drawbatchColumns.map((i) => {
                        return <div className='list-th-td' style={{ flex: `${i.space}` }} key={i.key}>{i.title}</div>
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

    //批量处理
    const destroyProcessModal = () => {
        //变更状态位
        chapterRepo.setBatchExit()
        setProcess({ open: false, title: "" })
    }




    //-------------------------------批量生成图片-----------------------------

    const batchGenerateImage = async (next_idx: number, end_idx: number) => {
        //查询状态
        if (chapterRepo.isBatchExit() || next_idx === end_idx) {
            return;
        }
        let next_pos = next_idx + 1
        setBatchPos(next_pos)


        //通知进度
        await event.emit("batchGenerateImage", {
            title: "正在处理第" + next_pos + "个镜头",
            except: end_idx,
            completed: next_pos,
            current: next_pos
        })

        //执行任务
        await chapterRepo.handleGenerateImage(next_idx, mode, project, comfyuiRepo, actorRepo).then(async () => {
            if (chapterRepo.isBatchExit()) {
                return;
            }
            await batchGenerateImage(next_idx + 1, end_idx)
        }).finally(chapterRepo.resetBatchExit)
    }
    const handleBatchGenerateImage = async () => {
        if (batchPos <= 0 || batchPos > chapterRepo.items.length) {
            return message.error("批量起始位置错误")
        }

        //重置
        setProcess({ open: true, run_event: "batchGenerateImage", title: "批量生成音频..." })



        chapterRepo.resetBatchExit()
        await batchGenerateImage(batchPos - 1, chapterRepo.items.length).catch(err => { message.error(err.message) }).finally(destroyProcessModal)
    }



    //-------------------------------批量翻译关键词-----------------------------

    const batchTranslatePrompt = async (next_idx: number, end_idx: number) => {
        //查询状态
        if (chapterRepo.isBatchExit() || next_idx === end_idx) {
            return;
        }
        let next_pos = next_idx + 1
        setBatchPos(next_pos)


        //通知进度
        await event.emit("batchTranslatePrompt", {
            title: "正在处理第" + next_pos + "个镜头",
            except: end_idx,
            completed: next_pos,
            current: next_pos
        })

        //执行任务
        await chapterRepo.handleTranslatePrompt(next_idx, translateRepo).then(async () => {
            if (chapterRepo.isBatchExit()) {
                return;
            }
            await batchTranslatePrompt(next_idx + 1, end_idx)
        }).finally(chapterRepo.resetBatchExit)
    }
    const handleBatchTranslatePrompt = async () => {

        if (batchPos <= 0 || batchPos > chapterRepo.items.length) {
            return message.error("批量起始位置错误")
        }

        //重置
        setProcess({ open: true, run_event: "batchTranslatePrompt", title: "批量翻译关键词..." })
        chapterRepo.resetBatchExit()

        await batchTranslatePrompt(batchPos - 1, chapterRepo.items.length).catch(err => { message.error(err.message) }).finally(destroyProcessModal)
    }


    //-------------------------------批量图片放大-----------------------------

    const handleBatchScaleImage = async () => {
        setProcess({ open: true, run_event: "key_image_scale_process", exit_event: "", title: "正在高清放大..." })
        //按音频
        await chapterRepo.batchScaleImage(batchPos - 1).catch(err => message.error(err.message)).finally(destroyProcessModal)
    }

    return (
        <div className="storyboard-wrap">
            <div className='script-header flexR'>
                <div className='flexR'>
                    <ComyUIModeSelect mode={mode} onChange={setOption}></ComyUIModeSelect>
                </div>
                <div className='flexR'>
                    <div className='flexR'>批量开始起点
                        <InputNumber controls={false}
                            style={{ width: "54px", marginLeft: '10px', marginRight: '10px' }} className="inputnumber-auto" placeholder='1'
                            defaultValue={1}
                            min={1}
                            max={chapterRepo.items.length}
                            value={batchPos}
                            required
                            onChange={(e) => setBatchPos(e!)} /> 镜</div>

                    <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleBatchGenerateImage} >批量生图</Button>
                    <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleBatchScaleImage} >批量高清放大</Button>
                    <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleBatchTranslatePrompt} >批量翻译关键词</Button>
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

export default DrawbatchTab