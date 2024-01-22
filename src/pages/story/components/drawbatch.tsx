import DrawTableTR from "./drawbatch-table-tr"
import { drawbatchColumns } from "../data"
import { useState } from "react"
import { useChapterRepository } from "@/repository/story"
import { ComyUIModeSelect } from "@/components/mode-select"

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
        <div className="drawbatch-wrap scrollbar">
            <ComyUIModeSelect mode={mode} onChange={setOption}></ComyUIModeSelect>
            {renderTable()}
        </div>
    )
}

export default Drawbatch