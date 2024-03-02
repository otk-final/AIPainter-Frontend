import DrawTableTR from "./drawbatch-table-tr"
import { drawbatchColumns } from "../data"
import { useEffect, useState } from "react"
import { useActorRepository, useChapterRepository } from "@/repository/story"
import { ComyUIModeSelect } from "@/components/mode-select"
import { Button, InputNumber } from "antd"
import { List, AutoSizer, ListRowProps } from 'react-virtualized';
import { useComfyUIRepository } from "@/repository/comfyui"
import { CloseCircleFilled } from "@ant-design/icons"

interface DrawbatchTabProps {
    pid: string
}


const DrawbatchTab: React.FC<DrawbatchTabProps> = ({ pid }) => {
    console.info(pid)

    const [mode, setOption] = useState<string>("")
    const chapterRepo = useChapterRepository(state => state)


    const _rowRenderer = ({ index, key, style }: ListRowProps) => {
        const items = chapterRepo.items;
        return <DrawTableTR key={key} idx={index} chapter={items[index]} style={style} mode={mode} />
    }

    const renderTable = () => {
        return (
            <div className='script-table-wrap' style={{ height: 'calc(100% - 60px)', display: "flex", flexDirection: 'column' }}>
                <div className='th flexR'>
                    {drawbatchColumns.map((i) => {
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

    const comfyuiRepo = useComfyUIRepository(state => state)
    const actorRepo = useActorRepository(state => state)

    //批量处理
    const [batchPos, setBatchPos] = useState<number>(1)
    const [batchImageLoading, setBatchImageLoading] = useState<boolean>(false)
    const [batchPromptLoading, setBatchPromptLoading] = useState<boolean>(false)

    useEffect(() => {
        return () => { chapterRepo.setBatchExit() }
    }, [])



    //-------------------------------批量生成图片-----------------------------

    const batchGenerateImage = async (next_idx: number, end_idx: number) => {
        //查询状态
        if (chapterRepo.isBatchExit() || next_idx === end_idx) {
            return;
        }
        setBatchPos(next_idx + 1)
        //执行任务
        await chapterRepo.handleGenerateImage(next_idx, mode, comfyuiRepo, actorRepo).then(async () => {
            if (chapterRepo.isBatchExit()) {
                return;
            }
            await batchGenerateImage(next_idx + 1, end_idx)
        }).finally(chapterRepo.resetBatchExit)
    }
    const handleBatchGenerateImage = async () => {
        //重置
        setBatchImageLoading(true)
        chapterRepo.resetBatchExit()

        await batchGenerateImage(batchPos - 1, chapterRepo.items.length).finally(() => setBatchImageLoading(false))
    }

    const handleExitBatchGenerateImage = () => {
        chapterRepo.setBatchExit()
        setBatchImageLoading(false)
    }



    //-------------------------------批量生成关键词-----------------------------

    const batchGeneratePrompt = async (next_idx: number, end_idx: number) => {
        //查询状态
        if (chapterRepo.isBatchExit() || next_idx === end_idx) {
            return;
        }
        setBatchPos(next_idx + 1)
        //执行任务
        await chapterRepo.handleGeneratePrompt(next_idx).then(async () => {
            if (chapterRepo.isBatchExit()) {
                return;
            }
            await batchGeneratePrompt(next_idx + 1,end_idx)
        }).finally(chapterRepo.resetBatchExit)
    }
    const handleBatchGeneratePrompt = async () => {
        //重置
        setBatchImageLoading(true)
        chapterRepo.resetBatchExit()

        await batchGeneratePrompt(batchPos - 1, chapterRepo.items.length).finally(() => setBatchImageLoading(false))
    }

    const handleExitBatchGeneratePrompt = () => {
        chapterRepo.setBatchExit()
        setBatchPromptLoading(false)
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

                    <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleBatchGenerateImage} loading={batchImageLoading}>批量生图</Button>
                    <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleBatchGeneratePrompt} loading={batchPromptLoading}>批量生成关键词</Button>
                    {
                        batchImageLoading && <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleExitBatchGenerateImage} icon={<CloseCircleFilled />}>取消</Button>
                    }
                    {
                        batchPromptLoading && <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleExitBatchGeneratePrompt} icon={<CloseCircleFilled />}>取消</Button>
                    }
                </div>
            </div>
            {renderTable()}
        </div>
    )
}

export default DrawbatchTab