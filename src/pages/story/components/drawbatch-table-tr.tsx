import { Button, Image } from "antd"
import TextArea from "antd/es/input/TextArea";
import { Fragment, useEffect, useState } from "react";
import { drawbatchColumns } from "../data";
import { Chapter, usePersistChaptersStorage } from "@/stores/story";
import { tauri } from "@tauri-apps/api";
import { HistoryImageModule } from "@/components";

interface ChapterTableTRProps {
    idx: number,
    style: string
    chapter: Chapter,
}


const DrawTableTR: React.FC<ChapterTableTRProps> = ({ idx, style, chapter }) => {

    const [isOpenHistory, setIsOpenHistory] = useState(false);
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
        let imageUrl = tauri.convertFileSrc(stateChapter.drawImage)
        return (
            <div>
                <Image src={imageUrl} preview={false} />
            </div>
        )
    }


    //重绘制
    const handleRedraw = async () => {

        let path = "/Users/hxy/Desktop/图片/5af16a7e7a434_610.jpg"
        let imageHistroy = stateChapter.drawImageHistory ? [...stateChapter.drawImageHistory!] : []
        imageHistroy.push(path)

        setChapter({ ...stateChapter, drawImage: path, drawImageHistory: imageHistroy })

    }


    const renderImageHistory = () => {
        if (!stateChapter.drawImageHistory) {
            return <div>待生成</div>
        }
        return (
            <div className="flexR" style={{ flexWrap: "wrap", justifyContent: "flex-start", width: '100%' }}
                onClick={() => setIsOpenHistory(true)}>
                {stateChapter?.drawImageHistory?.map((p, idx) => {
                    return <Image src={tauri.convertFileSrc(p)} className="drawbath-image size-s" preview={false} key={idx} />
                })}
            </div>
        )
    }


    const renderOperate = () => {
        return (
            <Fragment>
                <Button type='default' className='btn-default-auto btn-default-98' onClick={handleRedraw}>重绘本镜</Button>
                <Button type='default' className='btn-default-auto btn-default-98' disabled={!stateChapter.drawImageHistory}>高清放大</Button>
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
                        {i.key === 'drawImageHistory' ? renderImageHistory() : null}
                        {i.key === 'operate' ? renderOperate() : null}
                    </div>
                )
            })}
            <HistoryImageModule
                isOpen={isOpenHistory} onClose={() => setIsOpenHistory(false)}
                paths={stateChapter.drawImageHistory || []} defaultPath={stateChapter.drawImage || ""}
                onChangeNewImage={(v) => setChapter(res => {
                    return { ...res, drawImage: v }
                })} />
        </div>
    )
}

export default DrawTableTR