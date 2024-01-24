import GenerateImagesTR from "./image-generate-table-tr"
import { generateImagesColumns } from "../data"
import { ImitateTabType } from ".."
import { useState } from "react"
import { useKeyFrameRepository } from "@/repository/simulate"
import { ComyUIModeSelect } from "@/components/mode-select"
import {List, AutoSizer, ListRowProps} from 'react-virtualized';

interface ImageGenerateProps {
  pid: string,
  handleChangeTab: (key: ImitateTabType) => void,
}

const ImageGenerateTab: React.FC<ImageGenerateProps> = ({ pid }) => {


  const keyFreamsRepo = useKeyFrameRepository(state => state)
  const [mode, setOption] = useState<string>("")


  const renderTable = () => {
    return (
      <div className='script-table-wrap' style={{height: 'calc(100% - 60px)', display: "flex", flexDirection: 'column'}}>
        <div className='th flexR'>
          {generateImagesColumns.map((i) => {
            return <div className='th-td' style={{ flex: `${i.space}` }} key={i.key}>{i.title}</div>
          })}
        </div>
        <div  style={{flex: 1}} >
          <AutoSizer className='scrollbar'>
              {({height, width }) => {
                let len = keyFreamsRepo.items.length;
                console.log("height", height, len);
                return (
                  (
                    <List
                      ref="List"
                      height={height}
                      rowCount={len}
                      rowHeight={184}
                      rowRenderer={_rowRenderer}
                      width={width}
                      noRowsRenderer={()=> <div>...</div>}
                      overscanRowCount={10}
                    />
                  )
                )
              }}
            </AutoSizer>
        </div>
      </div>
    )
  }


  const _rowRenderer = ({index, key, style}: ListRowProps)=>{
    const items = keyFreamsRepo.items;
    return <GenerateImagesTR key={key} 
            frame={items[index]} 
            index={index} 
            style={style} 
            mode={mode}
          />
  }

  
  return (
    <div className="generate-image-wrap">
      <ComyUIModeSelect mode={mode} onChange={setOption}></ComyUIModeSelect>
      {renderTable()}
    </div>
  )
}

export default ImageGenerateTab