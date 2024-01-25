import GenerateImagesTR from "./image-generate-table-tr"
import { generateImagesColumns } from "../data"
import { ImitateTabType } from ".."
import { useEffect, useState } from "react"
import { ComyUIModeSelect } from "@/components/mode-select"
import { List, AutoSizer, ListRowProps } from 'react-virtualized';
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
      <div className='script-table-wrap' style={{ height: 'calc(100% - 60px)', display: "flex", flexDirection: 'column', overflow: 'hidden' }}>
        <div className='th flexR'>
          {generateImagesColumns.map((i) => {
            return <div className='th-td' style={{ flex: `${i.space}` }} key={i.key}>{i.title}</div>
          })}
        </div>
        <div style={{ flex: 1 }} >
          <AutoSizer>
              {({height, width }) => {
                let len = keyFreamsRepo.items.length;
                return (
                    <List
                      className='autosizer scrollbar'
                      height={height - 50}
                      rowCount={len}
                      rowHeight={184}
                      rowRenderer={_rowRenderer}
                      width={width}
                      noRowsRenderer={()=> <div></div>}
                      overscanRowCount={20}
                    />
                  )
              }}
          </AutoSizer>
        </div>
      </div>
    )
  }


  const _rowRenderer = ({ index, key, style }: ListRowProps) => {
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
      <div className='generate-header flexR'>
        <ComyUIModeSelect mode={mode} onChange={setOption}></ComyUIModeSelect>
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