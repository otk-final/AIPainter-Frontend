import { Button } from 'antd';
import React, { useEffect, useState } from 'react'
import { storyboardColumns } from '../data';
import StoryboardTableTR from './storyboard-table-tr'
import assets from '@/assets';
import FileImportModal from '../story-import';
import { useActorRepository, useChapterRepository } from '@/repository/story';
import { history } from 'umi';
import { AutoSizer, ListRowProps, List } from 'react-virtualized';


interface StoryboardTabProps {
    pid: string
}

const StoryboardTab: React.FC<StoryboardTabProps> = ({ pid }) => {
    const [isOpen, setOpen] = useState(false);
    const chapterRepo = useChapterRepository(state => state)
    const actorRepo = useActorRepository(state => state)
    const [hasCompletedCount, setCompletedCount] = useState<number>(0)

    useEffect(() => {
        setCompletedCount(chapterRepo.items.filter(item => item.image?.path).length)
    }, [pid])




    const renderEmpty = () => {
        return (
            <div className='empty flexC'>
                <img src={assets.emptyC} className='empty-img' />
                <div className='empty-text'>故事分镜列表为空， 请导入脚本文件</div>
                <div className='import-btn' onClick={() => setOpen(true)}>导入脚本文件</div>
                <div className='sub-text'>请上传故事分镜脚本文件，并完成基于镜头画面的描述词编辑。<span>新手可参考：剧本教学文档</span></div>
            </div>
        )
    }

    const _rowRenderer = ({ index, key, style }: ListRowProps) => {
        const items = chapterRepo.items;
        return <StoryboardTableTR key={key} idx={index} style={style} chapter={items[index]} actors={[...actorRepo.items]} />
    }
    const renderChapterList = () => {
        return (
            <div style={{ height: '100%' }}>
                <div className='script-header flexR'>
                    <div className='flexR'>
                        <Button type='default' className='btn-default-auto btn-default-150 l-p' onClick={() => setOpen(true)}>导入脚本文件</Button>
                        <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={() => { history.push('/roleset/' + pid) }} >设置角色</Button>
                    </div>
                    <div className='flexR'>
                        <div className='text'>已完成分镜: {hasCompletedCount}/{chapterRepo.items.length}</div>
                        <Button type='primary' className='btn-primary-auto btn-primary-108'>批量推理关键词</Button>
                    </div>
                </div>
                <div className='script-table-wrap' style={{ height: 'calc(100% - 60px)', display: "flex", flexDirection: 'column' }}>
                    <div className='th flexR'>
                        {storyboardColumns.map((i) => {
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

    return (
        <div className="storyboard-wrap">
            {chapterRepo.items ? renderChapterList() : renderEmpty()}
            <FileImportModal isOpen={isOpen} onClose={() => setOpen(false)} />
        </div>
    );
};

export default StoryboardTab
