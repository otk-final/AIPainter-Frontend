import GenerateImagesTR from "./image-generate-table-tr"
import { generateImagesColumns } from "../data"
import { ImitateTabType } from ".."
import { useEffect, useState } from "react"
import { ComyUIModeSelect } from "@/components/mode-select"
import { Button, InputNumber } from "antd"
import { useKeyFrameRepository } from "@/repository/keyframe"

interface ImageGenerateProps {
  pid: string,
  handleChangeTab: (key: ImitateTabType) => void,
}

const ImageGenerateTab: React.FC<ImageGenerateProps> = ({ pid }) => {


  const keyFreamsRepo = useKeyFrameRepository(state => state)
  const [mode, setOption] = useState<string>("")


  const renderTable = () => {
    return (
      <div className='script-table-wrap'>
        <div className='th flexR'>
          {generateImagesColumns.map((i) => {
            return <div className='th-td' style={{ flex: `${i.space}` }} key={i.key}>{i.title}</div>
          })}
        </div>
        {
          keyFreamsRepo.items.map((item, index) => {
            return (<GenerateImagesTR key={item.id} frame={item} index={index} style={mode} />)
          })
        }
      </div>
    )
  }

  return (
    <div className="generate-image-wrap scrollbar">

      <div className='generate-header flexR'>
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

export default ImageGenerateTab