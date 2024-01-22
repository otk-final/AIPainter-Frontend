import { Button } from 'antd';
import React, { useEffect, useState } from 'react'
import { storyboardColumns } from '../data';
import StoryboardTableTR from './storyboard-table-tr'
import assets from '@/assets';
import FileImportModal from '../story-import';
import { useActorRepository, useChapterRepository } from '@/repository/story';


interface StoryboardProps {
    pid: string
}

const Storyboard: React.FC<StoryboardProps> = ({ pid }) => {
    const [isOpen, setOpen] = useState(false);
    const chapterRepo = useChapterRepository(state => state)
    const actorRepo = useActorRepository(state => state)
    const [hasCompletedCount, setCompletedCount] = useState<number>(0)

    useEffect(() => {
        setCompletedCount(chapterRepo.items.filter(item => item.image?.path).length)
        actorRepo.load(pid)

        //保存当前状态
        return () => {
            chapterRepo.sync()
        }
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

    const renderChapterList = () => {
        return (
            <div>
                <div className='script-header flexR'>
                    <div className='flexR'>
                        <Button type='default' className='btn-default-auto btn-default-150 l-p' onClick={() => setOpen(true)}>导入脚本文件</Button>
                        <Button type='primary' className='btn-primary-auto btn-primary-108'>推理关键词</Button>
                    </div>
                    <div className='text flexR'>已完成分镜: {hasCompletedCount}/{chapterRepo.items.length}</div>
                </div>
                <div className='script-table-wrap'>
                    <div className='th flexR'>
                        {storyboardColumns.map((i) => {
                            return <div className='th-td' style={{ flex: `${i.space}` }} key={i.key}>{i.title}</div>
                        })}
                    </div>
                    {
                        chapterRepo.items.map((item, index) => {
                            return <StoryboardTableTR key={item.id} idx={index} chapter={item} actors={actorRepo.items} />
                        })
                    }
                </div>
            </div>
        )
    }

    return (
        <div className="storyboard-wrap scrollbar">
            {chapterRepo.items ? renderChapterList() : renderEmpty()}
            <FileImportModal isOpen={isOpen} onClose={() => setOpen(false)} />
        </div>
    );
};

export default Storyboard
