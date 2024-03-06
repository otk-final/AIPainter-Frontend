import GenerateImagesTR from "./image-generate-table-tr"
import { generateImagesColumns } from "../data"
import { ImitateTabType } from ".."
import { useEffect, useState } from "react"
import { ComyUIModeSelect } from "@/components/mode-select"
import { List, AutoSizer, ListRowProps } from 'react-virtualized';
import { Button, InputNumber, message } from "antd"
import { useKeyFrameRepository } from "@/repository/keyframe"
import { useComfyUIRepository } from "@/repository/comfyui"
import HandleProcessModal from "@/components/handle-process"
import { event } from "@tauri-apps/api"

interface ImageGenerateProps {
  pid: string,
  handleChangeTab: (key: ImitateTabType) => void,
}

const ImageGenerateTab: React.FC<ImageGenerateProps> = ({ pid }) => {

  const keyFrameRepo = useKeyFrameRepository(state => state)
  const comfyUIRepo = useComfyUIRepository(state => state)
  const [mode, setOption] = useState<string>("")
  const comfyuiRepo = useComfyUIRepository(state => state)

  //批量处理
  const [batchPos, setBatchPos] = useState<number>(1)
  const [stateProcess, setProcess] = useState<{ open: boolean, title: string, run_event?: string, exit_event?: string }>({ open: false, title: "" });


  useEffect(() => {
    return () => { keyFrameRepo.setBatchExit() }
  }, [])

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


  const destroyProcessModal = () => {
    //变更状态位
    keyFrameRepo.setBatchExit()
    setProcess({ open: false, title: "" })
  }


  //-------------------------------批量生成图片-----------------------------

  const batchGenerateImage = async (next_idx: number, end_idx: number) => {
    //查询状态
    if (keyFrameRepo.isBatchExit() || next_idx === end_idx) {
      return;
    }

    let next_pos = next_idx + 1
    setBatchPos(next_pos)


    //通知进度
    await event.emit("batchGenerateImage", {
      title: "正在处理第" + next_pos + "帧",
      except: end_idx,
      completed: next_pos,
      current: next_pos
    })

    //执行任务
    await keyFrameRepo.handleGenerateImage(next_idx, mode, comfyuiRepo).then(async () => {
      if (keyFrameRepo.isBatchExit()) {
        return;
      }
      await batchGenerateImage(next_idx + 1, end_idx)
    }).finally(keyFrameRepo.resetBatchExit)
  }

  const handleBatchGenerateImage = async () => {

    if (batchPos <= 0 || batchPos > keyFrameRepo.items.length) {
      return message.error("批量起始位置错误")
    }

    //重置
    setProcess({ open: true, run_event: "batchGenerateImage", title: "正在生成图片..." })

    keyFrameRepo.resetBatchExit()
    await batchGenerateImage(batchPos - 1, keyFrameRepo.items.length).finally(destroyProcessModal)
  }




  //-------------------------------批量生成关键词-----------------------------

  const batchGeneratePrompt = async (next_idx: number, end_idx: number) => {
    //查询状态
    if (keyFrameRepo.isBatchExit() || next_idx === end_idx) {
      return;
    }

    let next_pos = next_idx + 1
    setBatchPos(next_pos)

    //通知进度
    await event.emit("batchGeneratePrompt", {
      title: "正在处理第" + next_pos + "帧",
      except: end_idx,
      completed: next_pos,
      current: next_pos
    });

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

    if (batchPos <= 0 || batchPos > keyFrameRepo.items.length) {
      return message.error("批量起始位置错误")
    }

    //重置
    setProcess({ open: true, run_event: "batchGeneratePrompt", title: "正在反推关键词..." })
    keyFrameRepo.resetBatchExit()

    await batchGeneratePrompt(batchPos - 1, keyFrameRepo.items.length).finally(destroyProcessModal)
  }


  //-------------------------------批量图片放大-----------------------------

  const handleBatchScaleImage = async () => {
    setProcess({ open: true, run_event: "key_image_scale_process", exit_event: "", title: "正在高清放大..." })
    //按音频
    await keyFrameRepo.batchScaleImage(batchPos - 1).catch(err => message.error(err.message)).finally(destroyProcessModal)
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
          <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleBatchGeneratePrompt} >批量反推关键词</Button>
          <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleBatchGenerateImage}  >批量生图</Button>
          <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleBatchScaleImage}  >批量高清放大</Button>
        </div>
      </div>
      {renderTable()}
      {stateProcess.open && <HandleProcessModal
        open={stateProcess.open}
        pid={pid}
        title={stateProcess.title}
        running_event={stateProcess.run_event}
        exit_event={stateProcess.exit_event}
        onClose={destroyProcessModal} />}

    </div>
  )
}

export default ImageGenerateTab