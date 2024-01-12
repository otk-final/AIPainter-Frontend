import { useState } from "react"
import GenerateImagesTR from "./generate-image-table-tr"
import { generateImagesColumns, generateImagesColumnsData } from "../data"



const GenerateImages = () => {
  const [columnsData, setColumnsData] = useState(generateImagesColumnsData)


  return (
    <div className="generate-image-wrap scrollbar">
        <div className='th flexR'>
          {generateImagesColumns.map((i) => {
            return <div className='th-td' style={{ flex: `${i.space}` }} key={i.key}>{i.title}</div>
          })}
        </div>
        {
          columnsData.map((i, index) => {
            return (<GenerateImagesTR key={index} data={{ ...i, index }} />
            )
          })
        }
    </div>
  )
}

export default GenerateImages