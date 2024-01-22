import GenerateImagesTR from "./image-generate-table-tr"
import { generateImagesColumns } from "../data"
import { ImitateTabType } from ".."
import { usePersistImtateFramesStorage } from "@/stores/frame"
import { useEffect, useState } from "react"
import { QuestionCircleOutlined } from "@ant-design/icons"
import { Select } from "antd"
import { usePersistComfyUIStorage } from "@/stores/comfyui"
import { useKeyFrameRepository } from "@/repository/simulate"
import { useComfyUIRepository } from "@/repository/comfyui"

interface ImageGenerateProps {
  pid: string,
  handleChangeTab: (key: ImitateTabType) => void,
}

const ImageGenerateTab: React.FC<ImageGenerateProps> = ({ pid }) => {


  const keyFreamsRepo = useKeyFrameRepository(state => state)
  const comfyuiRepo = useComfyUIRepository(state => state)

  const [style, setOption] = useState<string>("")
  const [styleOptions, setOptions] = useState<any[]>([])

  useEffect(() => {

    keyFreamsRepo.load(pid)

    //模型
    let styleOptions = comfyuiRepo.items.map(item => {
      return { label: item.name.split(".")[0], value: item.name }
    })
    setOptions(styleOptions)
    if (styleOptions.length > 0) setOption(styleOptions[0].value)
  }, [pid])


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
            return (<GenerateImagesTR key={item.id} frame={item} index={index} style={style} />)
          })
        }
      </div>
    )
  }

  return (
    <div className="generate-image-wrap scrollbar">
      <div className="generate-header flexR">
        <div className="lable">风格选择 <QuestionCircleOutlined /></div>
        <Select
          className={`select-auto`}
          style={{ width: '300px' }}
          value={style}
          onChange={setOption}
          options={styleOptions}
        />
      </div>
      {renderTable()}
    </div>
  )
}

export default ImageGenerateTab