import { QuestionCircleOutlined } from "@ant-design/icons"
import { Select } from "antd"
import { useState } from "react"
import DrawbathTableTR from "./table-tr"
import { batchDrawColumns, batchDrawColumnsData } from "./data"



const BatchDrawTab = () => {
  const [columnsData, setColumnsData] = useState(batchDrawColumnsData)

  const renderTable = () => {
    return (
      <div className='script-table-wrap'>
        <div className='th flexR'>
          {batchDrawColumns.map((i) => {
            return <div className='th-td' style={{ flex: `${i.space}` }} key={i.key}>{i.title}</div>
          })}
        </div>
        {
          columnsData.map((i, index) => {
            return (<DrawbathTableTR key={index} data={{ ...i, index }} />
            )
          })
        }
      </div>
    )
  }

  return (

    <div className="drawbatch-wrap">
      <div className="drawbatch-header flexR">
        <div className="lable">绘图模版 <QuestionCircleOutlined /></div>
        <Select
          className={`select-auto`}
          style={{ width: '300px' }}
          defaultValue="3"
          onChange={(v) => { }}
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
          defaultValue="3"
          onChange={(v) => { }}
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

export default BatchDrawTab