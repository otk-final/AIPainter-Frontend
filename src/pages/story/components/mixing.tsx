import { mixingColumns } from "../data"
import { useChapterRepository } from "@/repository/story"
import { Button, InputNumber, message } from "antd"
import { List, AutoSizer, ListRowProps } from 'react-virtualized';
import MixingTableTR from "./mixing-table-tr"
import { dialog } from "@tauri-apps/api";
import { SRTGenerate } from "@/repository/generate_utils";

interface MixingTabProps {
    pid: string
}

const MixingTab: React.FC<MixingTabProps> = ({ pid }) => {
    console.info(pid)
    const chapterRepo = useChapterRepository(state => state)

    const handleExportSRTFile = async () => {
        let selected = await dialog.save({ title: "保存文件", filters: [{ name: "SRT文件", extensions: ["srt"] }] })
        if (!selected) {
            return
        }
        //有效片段
        let valids = await chapterRepo.formatFragments()
        await SRTGenerate(selected as string, valids).finally(() => { message.success("导出成功") })
    }

    const _rowRenderer = ({ index, key, style }: ListRowProps) => {
        const items = chapterRepo.items;
        return <MixingTableTR key={key} index={index} chapter={items[index]} style={style} />
    }

    const renderTable = () => {
        return (
            <div className='script-table-wrap' style={{ height: 'calc(100% - 60px)', display: "flex", flexDirection: 'column' }}>
                <div className='th flexR'>
                    {mixingColumns.map((i) => {
                        return <div className='th-td' style={{ flex: `${i.space}` }} key={i.key}>{i.title}</div>
                    })}
                </div>
                <div style={{ flex: 1 }} >
                    <AutoSizer>
                        {({ height, width }) => {
                            let len = chapterRepo.items.length;
                            return (
                                <List
                                    className='autosizer scrollbar'
                                    height={height - 50}
                                    rowCount={len}
                                    rowHeight={224}
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
        <div className="storyboard-wrap">
            <div className='script-header flexR'>
                <div className='flexR'>
                    <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleExportSRTFile}>导出新字幕文件</Button>
                </div>
                <div className='flexR'>
                    <div className='flexR'>批量开始起点 <InputNumber controls={false} style={{ width: "54px", marginLeft: '10px', marginRight: '10px' }} className="inputnumber-auto" placeholder='1' defaultValue={1} /> 镜</div>
                    <Button type="primary" className="btn-primary-auto btn-primary-108" >批量生成音频</Button>
                    <Button type="primary" className="btn-primary-auto btn-primary-108" >批量合成视频</Button>
                </div>
            </div>
            {renderTable()}
        </div>
    )
}

export default MixingTab