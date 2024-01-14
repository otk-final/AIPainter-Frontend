import { Button, Image } from "antd"
import TextArea from "antd/es/input/TextArea";
import { Fragment, useEffect, useState } from "react";
import { drawbatchColumns } from "../data";
import { Chapter, usePersistChaptersStorage } from "@/stores/story";
import { fs } from "@tauri-apps/api";
import { convertFileSrc } from "@tauri-apps/api/tauri";

interface ChapterTableTRProps {
    idx: number,
    chapter: Chapter,
}


const DrawTableTR: React.FC<ChapterTableTRProps> = ({ idx, chapter }) => {


    const { updateChapter } = usePersistChaptersStorage(state => state)
    const [stateChapter, setChapter] = useState<Chapter>(chapter)
    useEffect(() => {

        //当前绘画页面，ai关键词默认取英文
        if (!stateChapter.drawPrompt) stateChapter.drawPrompt = stateChapter.actorsPrompt?.en

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
                value={stateChapter.drawPrompt}
                onChange={(e) => { setChapter({ ...stateChapter, drawPrompt: e.target.value }) }} />
        )
    }

    const renderImage = () => {
        if (!stateChapter.drawImage) {
            return <div>待生成</div>
        }
        let imageUrl = convertFileSrc(stateChapter.drawImage)
        return (
            <div>
                <img src={imageUrl} className="drawbath-image" />
            </div>
        )
    }


    //重绘制
    const handleRedraw = () => {
        setChapter({ ...stateChapter, drawImage: "/Users/hxy/Desktop/图片/2671692240023_.pic.jpg" })
    }


    const renderOperate = () => {
        return (
            <Fragment>
                <Button type='default' className='btn-default-auto btn-default-98' onClick={handleRedraw}>重绘本镜</Button>
                <Button type='default' className='btn-default-auto btn-default-98'>调整参数</Button>
            </Fragment>
        )
    }

    return (
        <div className='tr flexR'>
            {stateChapter && drawbatchColumns.map((i, index) => {
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

export default DrawTableTR