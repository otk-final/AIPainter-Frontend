import { QuestionCircleOutlined } from "@ant-design/icons"
import { Select } from "antd"
import DrawTableTR from "./drawbatch-table-tr"
import { drawbatchColumns } from "../data"
import { usePersistChaptersStorage } from "@/stores/story"
import { useEffect, useState } from "react"
import { usePersistComfyUIStorage } from "@/stores/comfyui"

const Drawbatch = () => {
    const [style, setStyle] = useState<string>("默认")
    const { chapters } = usePersistChaptersStorage(state => state)

    const renderTable = () => {
        return (
            <div className='script-table-wrap'>
                <div className='th flexR'>
                    {drawbatchColumns.map((i) => {
                        return <div className='th-td' style={{ flex: `${i.space}` }} key={i.key}>{i.title}</div>
                    })}
                </div>
                {
                    chapters && chapters?.map((chapter, index) => {
                        return (<DrawTableTR key={chapter.id} idx={index} chapter={chapter} style={style} />
                        )
                    })
                }
            </div>
        )
    }

    //模型选择
    const { modeApis } = usePersistComfyUIStorage(state => state)
    let styleOptions = modeApis.map(item => {
        return { label: item.name, value: item.name }
    })

    useEffect(()=>{
        
    }, [modeApis])
    return (
        <div className="drawbatch-wrap scrollbar">
            <div className="drawbatch-header flexR">
                <div className="lable">风格选择 <QuestionCircleOutlined /></div>
                <Select
                    className={`select-auto`}
                    style={{ width: '300px' }}
                    value={style}
                    onChange={setStyle}
                    options={styleOptions}
                />
            </div>
            {renderTable()}
        </div>
    )
}

export default Drawbatch