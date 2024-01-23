import { srtMixingColumns } from "../data"
import { ImitateTabType } from ".."
import SRTMixingTR from "./srt-mixing-table-tr"
import { useSRTFrameRepository } from "@/repository/srt"
import { dialog } from "@tauri-apps/api"
import { useKeyFrameRepository } from "@/repository/simulate"

import 'react-virtualized/styles.css'; // 导入样式文件
import { Button } from "antd"
import React from "react"

interface SRTMixingProps {
    pid: string,
    handleChangeTab: (key: ImitateTabType) => void,
}

const SRTMixingTab: React.FC<SRTMixingProps> = ({ pid }) => {
    const srtFreamsRepo = useSRTFrameRepository(state => state)
    const keyFreamsRepo = useKeyFrameRepository(state => state)


    const handleImportSRTFile = async () => {
        let selected = await dialog.open({ title: "选择字幕文件", multiple: false, filters: [{ name: "SRT文件", extensions: ["srt"] }] })
        if (!selected) {
            return
        }
        await srtFreamsRepo.initialization(selected as string)
    }

    const handleSyncKeyFrames = async () => {
        await srtFreamsRepo.mergeKeyFrames(keyFreamsRepo.items)
    }


    return (
        <div className="generate-image-wrap scrollbar">
            <div className='generate-header flexR'>
                <div className='flexR'>
                    <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleSyncKeyFrames}>导入关键帧</Button>
                    <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleImportSRTFile}>导入SRT字幕文件</Button>
                </div>
                <div className='flexR'>
                    <Button type="primary" className="btn-primary-auto btn-primary-108" >一键改写</Button>
                    <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleImportSRTFile}>导出新字幕文件</Button>
                    <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleImportSRTFile}>导出新音频文件</Button>
                </div>
            </div>

            <div className='script-table-wrap'>
                <div className='th flexR'>
                    {srtMixingColumns.map((i) => {
                        return <div className='th-td' style={{ flex: `${i.space}` }} key={i.key}>{i.title}</div>
                    })}
                </div>
                {
                    srtFreamsRepo.items.map((item, index) => {
                        return (<SRTMixingTR key={item.id} frame={item} index={index} />)
                    })
                }
            </div>
        </div>
    )
}

export default SRTMixingTab