import { QuestionCircleOutlined } from "@ant-design/icons"
import { Select } from "antd"
import DrawTableTR from "./drawbatch-table-tr"
import { drawbatchColumns } from "../data"
import { usePersistChaptersStorage, usePersistScriptStorage } from "@/stores/story"

const Drawbatch = () => {
    const { drawConfig, updateDrawConfig } = usePersistScriptStorage(state => state)
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
                    chapters?.map((chapter, index) => {
                        return (<DrawTableTR key={chapter.id} idx={index} chapter={chapter} />
                        )
                    })
                }
            </div>
        )
    }

    return (
        <div className="drawbatch-wrap scrollbar">
            <div className="drawbatch-header flexR">
                <div className="lable">绘图模版 <QuestionCircleOutlined /></div>
                <Select
                    className={`select-auto`}
                    style={{ width: '300px' }}
                    value={drawConfig?.template}
                    onChange={(v) => { updateDrawConfig({ ...drawConfig!, template: v }) }}
                    options={[
                        { value: '1', label: '通用模版' },
                        { value: '2', label: '“特殊符号”区分（#@#）' },
                        { value: '3', label: '通过"智能解析"分镜（适用于新手）' },
                    ]}
                />
                <div className="lable">当前 Stable Diffusion 模型</div>
                <Select
                    className={`select-auto`}
                    style={{ width: '400px' }}
                    value={drawConfig?.model}
                    onChange={(v) => { updateDrawConfig({ ...drawConfig!, model: v }) }}
                    options={[
                        { value: '1', label: '通用模版' },
                        { value: '2', label: '“特殊符号”区分（#@#）' },
                        { value: '3', label: '通过"智能解析"分镜（适用于新手）' },
                    ]}
                />
            </div>
            {renderTable()}
        </div>
    )
}

export default Drawbatch