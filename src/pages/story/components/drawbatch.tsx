import DrawTableTR from "./drawbatch-table-tr"
import { drawbatchColumns } from "../data"
import { useState } from "react"
import { useChapterRepository } from "@/repository/story"
import { ComyUIModeSelect } from "@/components/mode-select"
import { Button, InputNumber } from "antd"
import {List, AutoSizer, ListRowProps} from 'react-virtualized';

const Drawbatch = () => {
    const [mode, setOption] = useState<string>("")
    const chapterRepo = useChapterRepository(state => state)

    const _rowRenderer = ({index, key, style}: ListRowProps)=>{
        const items = chapterRepo.items;
        return <DrawTableTR key={key} idx={index} chapter={items[index]} style={style} mode={mode}/>
    }

    const renderTable = () => {
        return (
            <div className='script-table-wrap' style={{height: 'calc(100% - 60px)', display: "flex", flexDirection: 'column'}}>
                <div className='th flexR'>
                    {drawbatchColumns.map((i) => {
                        return <div className='th-td' style={{ flex: `${i.space}` }} key={i.key}>{i.title}</div>
                    })}
                </div>
                <div style={{flex: 1}} >
                    <AutoSizer>
                        {({height, width }) => {
                            let len = chapterRepo.items.length;
                            return (
                                <List
                                    className='autosizer scrollbar'
                                    height={height - 50}
                                    rowCount={len}
                                    rowHeight={224}
                                    rowRenderer={_rowRenderer}
                                    width={width}
                                    noRowsRenderer={()=> <div>...</div>}
                                    overscanRowCount={20}
                                />
                            )
                        }}
                    </AutoSizer>
                </div>
            </div>
        )
    }


    return (
        <div className="storyboard-wrap">
            <div className='script-header flexR'>
                <div className='flexR'>
                    <ComyUIModeSelect mode={mode} onChange={setOption}></ComyUIModeSelect>
                </div>
                <div className='flexR'>
                    <div className='flexR'>批量开始起点 <InputNumber controls={false} style={{ width: "54px", marginLeft: '10px', marginRight: '10px' }} className="inputnumber-auto" placeholder='1' defaultValue={1} /> 镜</div>
                    <Button type="primary" className="btn-primary-auto btn-primary-108" >批量生图</Button>
                    <Button type="primary" className="btn-primary-auto btn-primary-108" >批量反推关键词</Button>
                </div>
            </div>

            {renderTable()}
        </div>
    )
}

export default Drawbatch