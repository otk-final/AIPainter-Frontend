import { Button, Image } from "antd"
import TextArea from "antd/es/input/TextArea";
import { Fragment, useEffect, useState } from "react";
import { drawbatchColumns } from "../data";
import { Chapter, usePersistChaptersStorage } from "@/stores/story";

interface ChapterTableTRProps {
    idx: number,
    chapter: Chapter,
}


const DrawbathTableTR: React.FC<ChapterTableTRProps> = ({ idx, chapter }) => {


    const { updateChapter } = usePersistChaptersStorage(state => state)
    const [stateChapter, setChapter] = useState<Chapter>(chapter)

    useEffect(() => {

        //当前绘画页面，ai关键词默认取英文
        stateChapter.drawPrompt = stateChapter.actorsPrompt?.en
        updateChapter(idx, stateChapter)
    }, [stateChapter])

    const renderNumber = () => {
        return (
            <Fragment>
                <div className='index'>{idx + 1}</div>
            </Fragment>
        )
    }


    const renderEditPrompts = () => {
        return (
            <TextArea rows={6} placeholder={"请输入画面描述词"}
                maxLength={1000} className="text-area-auto"
                onChange={(e) => { setChapter({ ...stateChapter, drawPrompt: e.target.value }) }} />
        )
    }

    const renderImage = () => {
        // if (!data.url) {
        //     return <div>待生成</div>
        // }
        return (
            <div>
                <Image src="" className="drawbath-image" />
            </div>
        )
    }

    const renderOperate = () => {
        return (
            <Fragment>
                <Button type='default' className='btn-default-auto btn-default-98'>重绘本镜</Button>
                <Button type='default' className='btn-default-auto btn-default-98'>调整参数</Button>
            </Fragment>
        )
    }

    return (
        <div className='tr flexR'>
            {drawbatchColumns.map((i, index) => {
                return (
                    <div className='td script-id flexC' key={i.key + index} style={{ flex: `${i.space}` }}>
                        {i.key === 'number' ? renderNumber() : null}
                        {i.key === 'original' ? stateChapter.original : null}
                        {i.key === 'drawPrompt' ? renderEditPrompts() : null}
                        {i.key === 'drawImage' ? renderImage() : null}
                        {i.key === 'drawImageHistory' ? renderImage() : null}
                        {i.key === 'operate' ? renderOperate() : null}
                    </div>
                )
            })}
        </div>
    )
}

export default DrawbathTableTR