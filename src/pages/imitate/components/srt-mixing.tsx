import { srtMixingColumns } from "../data"
import { ImitateTabType } from ".."
import SRTMixingTR from "./srt-mixing-table-tr"
import { dialog } from "@tauri-apps/api"
import { List, AutoSizer, ListRowProps } from 'react-virtualized';

import 'react-virtualized/styles.css'; // 导入样式文件
import { Button, message } from "antd"
import React, { useState } from "react"
import { useKeyFrameRepository } from "@/repository/keyframe";
import { QuestionCircleOutlined } from "@ant-design/icons";
import TTSVoiceSelect from "@/components/voice-select";
import { AudioOption } from "@/repository/tts_api";

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
        let valids = keyFreamsRepo.filterValidFragments()
        await keyFreamsRepo.srtExport(selected as string, valids).finally(() => { message.success("导出成功") })
    }

    const [audioOption, setAudioOption] = useState<AudioOption>()
    const _rowRenderer = ({ index, key, style }: ListRowProps) => {
        const items = keyFreamsRepo.items;
        return <SRTMixingTR key={key} frame={items[index]} geAudioOption={() => audioOption} style={style} index={index} />
    }

    return (
        <div className="generate-image-wrap">
            <div className='generate-header flexR'>
                <div className='flexR'>
                    <div className="lable">声音 <QuestionCircleOutlined />
                        <TTSVoiceSelect onChange={setAudioOption} />
                    </div>
                </div>
                <div className='flexR'>
                    <Button type="primary" className="btn-primary-auto btn-primary-108" >一键改写</Button>
                    <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleExportSRTFile}>导出新字幕文件</Button>
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