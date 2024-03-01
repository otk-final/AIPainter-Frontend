import GenerateImagesTR from "./image-generate-table-tr"
import { generateImagesColumns } from "../data"
import { ImitateTabType } from ".."
import { useCallback, useEffect, useRef, useState } from "react"
import { ComyUIModeSelect } from "@/components/mode-select"
import { List, AutoSizer, ListRowProps } from 'react-virtualized';
import { Button, InputNumber, Progress } from "antd"
import { useKeyFrameRepository } from "@/repository/keyframe"
import { CloseOutlined } from "@ant-design/icons"
import { useComfyUIRepository } from "@/repository/comfyui"

interface ImageGenerateProps {
  pid: string,
  handleChangeTab: (key: ImitateTabType) => void,
}

const ImageGenerateTab: React.FC<ImageGenerateProps> = ({  }) => {

  const [startN, setStartN] = useState(0);
  const [percent, setPercent] = useState(0);
  const keyFreamsRepo = useKeyFrameRepository(state => state)
  const keyFreamRepo = useKeyFrameRepository(state => state)
  const comfyUIRepo = useComfyUIRepository(state => state)
  const [mode, setOption] = useState<string>("")
  const [secondConfirm, setSecondConfirm] = useState(false)
  const [isModal, setIsModal] = useState("");

  let processing = false;

  const items = keyFreamsRepo.items;
  const handleBatchKeyWords = (i) => {
    if(items[i].prompt) {
      handleBatchKeyWords(i++)
    } else {
      keyFreamRepo.handleReversePrompt(i, comfyUIRepo).then(()=>{
        if(processing) {
         return;
        }
        handleBatchKeyWords(i++);
      })
    }
  }


  const renderModal = () => {
    return (
        <div className='auto-modal'>
            {!secondConfirm ? <div className='content'>
                <CloseOutlined className='close' onClick={()=>setSecondConfirm(true)}/>
                <Progress percent={20} status="active" showInfo/>
            </div> : null}
            {
                secondConfirm ? (
                    <div className='content'>
                        <CloseOutlined className='close' onClick={()=>setSecondConfirm(false)}/>
                        <div className='title'>确认要终止任务吗？</div>
                        <div className='btn-wrap flexR'>
                            <Button type="default" className="btn-default-auto btn-default-100" style={{ width: '130px' }}
                             onClick={()=> { 
                              console.log('点击终止')
                              processing = true;
                              setIsModal("");
                               setSecondConfirm(false); 
                             }} >确认</Button>
                            <Button type="primary" className="btn-primary-auto btn-primary-108" style={{ width: '130px' }} onClick={() => setSecondConfirm(false)}>取消</Button>
                        </div>
                    </div>
                ): null
            }
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

  const renderTable = () => {
    return (
      <div className='script-table-wrap' style={{ height: 'calc(100% - 60px)', display: "flex", flexDirection: 'column', overflow: 'hidden' }}>
        <div className='th flexR'>
          {generateImagesColumns.map((i) => {
            return <div className='th-td' style={{ flex: i.key === 'number' ? `0 0 124px`: `${i.space}` }} key={i.key}>{i.title}</div>
          })}
        </div>
        <div style={{ flex: 1 }} >
          <AutoSizer>
            {({ height, width }) => {
              let len = keyFreamsRepo.items.length;
              return (
                <List
                  className='autosizer scrollbar'
                  height={height - 50}
                  rowCount={len}
                  rowHeight={184}
                  rowRenderer={_rowRenderer}
                  width={width}
                  noRowsRenderer={() => <div></div>}
                  overscanRowCount={20}
                />
              )
            }}
          </AutoSizer>
        </div>
      </div>
    )
  }


  return (
    <div className="generate-image-wrap">
      <div onClick={()=>{
         processing = true;
         console.log("停止循环")
      }}>停止循环</div>
      <div className='generate-header flexR'>
        <ComyUIModeSelect mode={mode} onChange={setOption}></ComyUIModeSelect>
        <div className='flexR'>
          <div className='flexR'>批量开始起点 
          <InputNumber controls={false} style={{ width: "54px", marginLeft: '10px', marginRight: '10px' }}
           className="inputnumber-auto" placeholder='1' defaultValue={1} 
           onChange={(v)=> setStartN(Number(v))}/> 镜</div>
          <Button type="primary" className="btn-primary-auto btn-primary-108">批量生图</Button>
          <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={()=> {
            setIsModal("开始");
            handleBatchKeyWords(0);
          }} >批量反推关键词</Button>
        </div>
      </div>
      {renderTable()}
      {isModal ?  renderModal() : null}
    </div>
  )
}

export default ImageGenerateTab