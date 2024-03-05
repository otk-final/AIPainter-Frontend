import GenerateImagesTR from "./image-generate-table-tr"
import { generateImagesColumns } from "../data"
import { ImitateTabType } from ".."
import { useEffect, useMemo, useState } from "react"
import { ComyUIModeSelect } from "@/components/mode-select"
import { List, AutoSizer, ListRowProps } from 'react-virtualized';
import { Button, InputNumber, Progress } from "antd"
import { useKeyFrameRepository } from "@/repository/keyframe"
import { CloseCircleFilled, CloseOutlined } from "@ant-design/icons"
import { useComfyUIRepository } from "@/repository/comfyui"

interface ImageGenerateProps {
  pid: string,
  handleChangeTab: (key: ImitateTabType) => void,
}

const ImageGenerateTab: React.FC<ImageGenerateProps> = ({ }) => {

  const keyFrameRepo = useKeyFrameRepository(state => state)
  const comfyUIRepo = useComfyUIRepository(state => state)
  const [mode, setOption] = useState<string>("")
  const [secondConfirm, setSecondConfirm] = useState(false);
  const [isModal, setIsModal ] = useState(false)
  const comfyuiRepo = useComfyUIRepository(state => state)

  //批量处理
  const [batchPos, setBatchPos] = useState<number>(1)
  const [batchImageLoading, setBatchImageLoading] = useState<boolean>(false)
  const [batchPromptLoading, setBatchPromptLoading] = useState<boolean>(false)

  let progressPercent = useMemo(()=>{
    let rest = keyFrameRepo.items.filter((i)=>{
      if(batchImageLoading && i.image.path) {
       return i;
      }
      if(batchPromptLoading && i.prompt) {
        return i;
      }
      return;
    })
    return Number((rest.length / keyFrameRepo.items.length * 100).toFixed(0)) || 0;
  },[batchImageLoading, batchPromptLoading, keyFrameRepo]);

  const renderModal = () => {
    return (
      <div className='auto-modal' >
        {!secondConfirm ? <div className='content' style={{paddingLeft: '30px', paddingRight: '30px', width: '400px'}}>
          <CloseOutlined className='close' onClick={() => setSecondConfirm(true)} />
          <Progress percent={progressPercent} status="active" showInfo style={{marginTop: '140px'}}/>
        </div> : null}
        {
          secondConfirm ? (
            <div className='content' style={{width: '400px'}}>
              <CloseOutlined className='close' onClick={() => setSecondConfirm(false)} />
              <div className='title'>确认要终止任务吗？</div>
                  <Button type="primary" className="btn-primary-auto btn-primary-108"
                  style={{marginTop: '30px'}}
                      onClick={()=>{
                        batchImageLoading ? handleExitBatchGenerateImage():handleExitBatchGeneratePrompt();
                        setIsModal(false);
                        setSecondConfirm(false);
                      }}
                        icon={<CloseCircleFilled />}>确认取消{batchImageLoading ? "批量生图" : "批量反推关键词"}</Button>
            </div>
          ) : null
        }
      </div>
    )
  }

  useEffect(()=>{
    return () => { keyFrameRepo.setBatchExit() }
  },[])

  const _rowRenderer = ({ index, key, style }: ListRowProps) => {
    const items = keyFrameRepo.items;
    return <GenerateImagesTR key={key} frame={items[index]} index={index} style={style} mode={mode} />
  }

  const renderTable = () => {
    return (
      <div className='script-table-wrap' style={{ height: 'calc(100% - 60px)', display: "flex", flexDirection: 'column', overflow: 'hidden' }}>
        <div className='th flexR'>
          {generateImagesColumns.map((i) => {
            return <div className='th-td' style={{ flex: i.key === 'number' ? `0 0 124px` : `${i.space}` }} key={i.key}>{i.title}</div>
          })}
        </div>
        <div style={{ flex: 1 }} >
          <AutoSizer>
            {({ height, width }) => {
              let len = keyFrameRepo.items.length;
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





  //-------------------------------批量生成图片-----------------------------

  const batchGenerateImage = async (next_idx: number, end_idx: number) => {
    //查询状态
    if (keyFrameRepo.isBatchExit() || next_idx === end_idx) {
      return;
    }
    setBatchPos(next_idx + 1)
    //执行任务
    await keyFrameRepo.handleGenerateImage(next_idx, mode, comfyuiRepo).then(async () => {
      if (keyFrameRepo.isBatchExit()) {
        return;
      }
      await batchGenerateImage(next_idx + 1, end_idx)
    }).finally(keyFrameRepo.resetBatchExit)
  }
  const handleBatchGenerateImage = async () => {
    //重置
    setIsModal(true)
    setBatchImageLoading(true)
    keyFrameRepo.resetBatchExit()

    await batchGenerateImage(batchPos - 1, keyFrameRepo.items.length).finally(() => setBatchImageLoading(false))
  }

  const handleExitBatchGenerateImage = () => {
    keyFrameRepo.setBatchExit()
    setBatchImageLoading(false)
  }


  //-------------------------------批量生成关键词-----------------------------

  const batchGeneratePrompt = async (next_idx: number, end_idx: number) => {
    //查询状态
    if (keyFrameRepo.isBatchExit() || next_idx === end_idx) {
      return;
    }
    setBatchPos(next_idx + 1)
    //执行任务
    await keyFrameRepo.handleGeneratePrompt(next_idx, comfyUIRepo).then(async () => {
      if (keyFrameRepo.isBatchExit()) {
        return;
      }
      console.info("开始下一个任务", next_idx + 1)
      await batchGeneratePrompt(next_idx + 1, end_idx)
    }).finally(() => { console.info("递归任务退出"); keyFrameRepo.resetBatchExit() })
  }

  const handleBatchGeneratePrompt = async () => {
    //重置
    setIsModal(true)
    setBatchPromptLoading(true)
    keyFrameRepo.resetBatchExit()

    await batchGeneratePrompt(batchPos - 1, keyFrameRepo.items.length).finally(() => { console.info("主任务退出"); setBatchPromptLoading(false) })
  }

  const handleExitBatchGeneratePrompt = () => {
    keyFrameRepo.setBatchExit()
    setBatchPromptLoading(false)
  }

  return (
    <div className="generate-image-wrap">
      <div className='generate-header flexR'>
        <ComyUIModeSelect mode={mode} onChange={setOption}></ComyUIModeSelect>
        <div className='flexR'>
          <div className='flexR'>批量开始起点 <InputNumber controls={false} style={{ width: "54px", marginLeft: '10px', marginRight: '10px' }} className="inputnumber-auto" placeholder='1'
            defaultValue={1}
            min={1}
            max={keyFrameRepo.items.length}
            value={batchPos}
            required
            onChange={(e) => setBatchPos(e!)} /> 镜</div>
          <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleBatchGeneratePrompt} loading={batchPromptLoading}>批量反推关键词</Button>
          <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleBatchGenerateImage} loading={batchImageLoading} >批量生图</Button>
        </div>
      </div>
      {renderTable()}
      {isModal && (batchImageLoading || batchPromptLoading) ? renderModal() : null}
    </div>
  )
}

export default ImageGenerateTab