import { useEffect } from "react"
import GenerateImagesTR from "./image-generate-table-tr"
import { generateImagesColumns } from "../data"
import { ImitateTabType } from ".."
import { usePersistImtateFramesStorage } from "@/stores/frame"

interface ImageGenerateProps {
  pid: string,
  handleChangeTab: (key: ImitateTabType) => void,
}

const ImageGenerateTab: React.FC<ImageGenerateProps> = ({ pid, handleChangeTab }) => {

  const { frames, load } = usePersistImtateFramesStorage(state => state)
  useEffect(() => {
    if (pid) load(pid)
  }, [pid])


  return (
    <div className="generate-image-wrap scrollbar">
      <div className='th flexR'>
        {generateImagesColumns.map((i) => {
          return <div className='th-td' style={{ flex: `${i.space}` }} key={i.key}>{i.title}</div>
        })}
      </div>
      {
        frames && frames.map((item, index) => {
          return (<GenerateImagesTR key={index} frame={item} index={index} />)
        })
      }
    </div>
  )
}

export default ImageGenerateTab