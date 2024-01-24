import { srtMixingColumns } from "../data"
import { ImitateTabType } from ".."
import SRTMixingTR from "./srt-mixing-table-tr"
import { dialog } from "@tauri-apps/api"
import { List, AutoSizer, ListRowProps } from 'react-virtualized';

import 'react-virtualized/styles.css'; // 导入样式文件
import { Button } from "antd"
import React from "react"
import { useKeyFrameRepository } from "@/repository/keyframe";

interface SRTMixingProps {
    pid: string,
    handleChangeTab: (key: ImitateTabType) => void,
}

const SRTMixingTab: React.FC<SRTMixingProps> = ({ pid }) => {
    const keyFreamsRepo = useKeyFrameRepository(state => state)

    const handleImportSRTFile = async () => {
        let selected = await dialog.open({ title: "选择字幕文件", multiple: false, filters: [{ name: "SRT文件", extensions: ["srt"] }] })
        if (!selected) {
            return
        }
        await keyFreamsRepo.mergeSRTFile(selected as string)
    }

    const _rowRenderer = ({ index, key, style }: ListRowProps) => {
        const items = keyFreamsRepo.items;
        return <SRTMixingTR key={key} frame={items[index]} style={style} index={index} />
      }


    return (
        <div className="generate-image-wrap">
            <div className='generate-header flexR'>
                <div className='flexR'>
                    <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleImportSRTFile}>导入SRT字幕文件</Button>
                </div>
                <div className='flexR'>
                    <Button type="primary" className="btn-primary-auto btn-primary-108" >一键改写</Button>
                    <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleImportSRTFile}>导出新字幕文件</Button>
                    <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleImportSRTFile}>导出新音频文件</Button>
                </div>
            </div>

            <div className='script-table-wrap' style={{ height: 'calc(100% - 60px)', display: "flex", flexDirection: 'column' }}>
                <div className='th flexR'>
                    {srtMixingColumns.map((i) => {
                        return <div className='th-td' style={{ flex: `${i.space}` }} key={i.key}>{i.title}</div>
                    })}
                </div>
                <div style={{ flex: 1 }} >
                    <AutoSizer>
                        {({height, width }) => {
                            let len = keyFreamsRepo.items.length;
                            console.log("height", height, len);
                            return (
                                <List
                                className='autosizer scrollbar'
                                height={height - 50}
                                rowCount={len}
                                rowHeight={184}
                                rowRenderer={_rowRenderer}
                                width={width}
                                noRowsRenderer={()=> <div>...</div>}
                                overscanRowCount={20}
                                />
                            )
                        }}
                    </AutoSizer>
                    </div>
            </div>
        </div>
    )
}

export default SRTMixingTab