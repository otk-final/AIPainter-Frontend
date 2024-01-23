import DrawTableTR from "./drawbatch-table-tr"
import { drawbatchColumns } from "../data"
import { useState } from "react"
import { useChapterRepository } from "@/repository/story"
import { ComyUIModeSelect } from "@/components/mode-select"
import { Button, InputNumber } from "antd"

const Drawbatch = () => {
    const [mode, setOption] = useState<string>("")
    const chapterRepo = useChapterRepository(state => state)

    const renderTable = () => {
        return (
            <div className='script-table-wrap'>
                <div className='th flexR'>
                    {drawbatchColumns.map((i) => {
                        return <div className='th-td' style={{ flex: `${i.space}` }} key={i.key}>{i.title}</div>
                    })}
                </div>
                {
                    chapterRepo.items.map((chapter, index) => {
                        return (<DrawTableTR key={chapter.id} idx={index} chapter={chapter} style={mode} />
                        )
                    })
                }
            </div>
        )
    }


    return (
        <div className="storyboard-wrap scrollbar">
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