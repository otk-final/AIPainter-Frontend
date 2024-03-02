import DrawTableTR from "./drawbatch-table-tr"
import { drawbatchColumns } from "../data"
import { useState } from "react"
import { useActorRepository, useChapterRepository } from "@/repository/story"
import { ComyUIModeSelect } from "@/components/mode-select"
import { Button, InputNumber } from "antd"
import { List, AutoSizer, ListRowProps } from 'react-virtualized';
import {  useComfyUIRepository } from "@/repository/comfyui"

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

    // await chapterRepo.handleGenerateImage(idx, mode, comfyuiRepo, actorRepo).catch(err => message.error(err)).finally(Modal.destroyAll)
    const comfyuiRepo = useComfyUIRepository(state => state)
    const actorRepo = useActorRepository(state => state)

    //批量处理
    const [pos, setPos] = useState<number>(0)

    const handleBatchGenerateImage = async () => {

    }

    const handleBatchExit = async () => {
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
                            value={pos}
                            onChange={(e) => setPos(e!)} /> 镜</div>
                    <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleBatchGenerateImage}>批量生图</Button>
                    <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleBatchExit}>退出</Button>
                    <Button type="primary" className="btn-primary-auto btn-primary-108" >批量生成关键词</Button>
                </div>
            </div>
            {renderTable()}
        </div>
    )
}

export default DrawbatchTab