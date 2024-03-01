import { srtMixingColumns } from "../data"
import { ImitateTabType } from ".."
import SRTMixingTR from "./srt-mixing-table-tr"
import { dialog } from "@tauri-apps/api"
import { List, AutoSizer, ListRowProps } from 'react-virtualized';

import 'react-virtualized/styles.css'; // 导入样式文件
import { Button, InputNumber, message } from "antd"
import React from "react"
import { useKeyFrameRepository } from "@/repository/keyframe";

interface SRTMixingProps {
    pid: string,
    handleChangeTab: (key: ImitateTabType) => void,
}

const SRTMixingTab: React.FC<SRTMixingProps> = ({ }) => {
    const keyFreamsRepo = useKeyFrameRepository(state => state)

    const handleExportSRTFile = async () => {
        let selected = await dialog.save({ title: "保存文件", filters: [{ name: "SRT文件", extensions: ["srt"] }] })
        if (!selected) {
            return
        }
        //有效片段
        let valids = await keyFreamsRepo.formatFragments()
        await keyFreamsRepo.handleExportSRT(selected as string, valids).finally(() => { message.success("导出成功") })
    }

    const _rowRenderer = ({ index, key, style }: ListRowProps) => {
        const items = keyFreamsRepo.items;
        return <SRTMixingTR key={key} frame={items[index]} style={style} index={index} />
    }

    return (
        <div className="generate-image-wrap">
            <div className='generate-header flexR'>
                <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleExportSRTFile}>导出新字幕文件</Button>
                <div className='flexR'>
                    <div className='flexR'>批量开始起点 <InputNumber controls={false} style={{ width: "54px", marginLeft: '10px', marginRight: '10px' }} className="inputnumber-auto" placeholder='1' defaultValue={1} /> 镜</div>
                    <Button type="primary" className="btn-primary-auto btn-primary-108" >一键改写</Button>
                    <Button type="primary" className="btn-primary-auto btn-primary-108" >批量生成音频</Button>
                    <Button type="primary" className="btn-primary-auto btn-primary-108" >批量合成视频</Button>
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
        </div>
    )
}

export default SRTMixingTab