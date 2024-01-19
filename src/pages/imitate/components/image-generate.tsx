import GenerateImagesTR from "./image-generate-table-tr"
import { generateImagesColumns } from "../data"
import { ImitateTabType } from ".."
import { usePersistImtateFramesStorage } from "@/stores/frame"
import { useEffect, useState } from "react"
import { QuestionCircleOutlined } from "@ant-design/icons"
import { Select } from "antd"
import { usePersistComfyUIStorage } from "@/stores/comfyui"

interface ImageGenerateProps {
  pid: string,
  handleChangeTab: (key: ImitateTabType) => void,
}

const ImageGenerateTab: React.FC<ImageGenerateProps> = ({ pid }) => {

  const [style, setStyle] = useState<string>("")
  const { frames } = usePersistImtateFramesStorage(state => state)
  const framesLoadHandle = usePersistImtateFramesStorage(state => state.load)

  useEffect(() => {
    framesLoadHandle(pid)
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
          frames && frames.map((item, index) => {
            return (<GenerateImagesTR key={item.id} frame={item} index={index} style={style} />)
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

  return (
    <div className="generate-image-wrap scrollbar">
      <div className="generate-header flexR">
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

export default ImageGenerateTab