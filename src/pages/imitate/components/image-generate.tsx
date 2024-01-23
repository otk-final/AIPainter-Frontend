import GenerateImagesTR from "./image-generate-table-tr"
import { generateImagesColumns } from "../data"
import { ImitateTabType } from ".."
import { useEffect, useState } from "react"
import { useKeyFrameRepository } from "@/repository/simulate"
import { ComyUIModeSelect } from "@/components/mode-select"

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
      <ComyUIModeSelect mode={mode} onChange={setOption}></ComyUIModeSelect>
      {renderTable()}
    </div>
  )
}

export default ImageGenerateTab