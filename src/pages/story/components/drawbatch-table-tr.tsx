import { Button, Image, message, Modal } from "antd"
import TextArea from "antd/es/input/TextArea";
import { Fragment, useEffect, useState } from "react";
import { drawbatchColumns } from "../data";
import { tauri } from "@tauri-apps/api";
import { Actor, Chapter, useChapterRepository } from "@/repository/story";
import { useComfyUIRepository } from "@/repository/comfyui";
import { AssetHistoryImages, AssetImage, ModalHistoryImages } from "@/components/history-image";

interface ChapterTableTRProps {
    idx: number,
    mode: string
    chapter: Chapter,
    style: React.CSSProperties,
    key: string,
    actors?: Actor[]
}


const DrawTableTR: React.FC<ChapterTableTRProps> = ({ idx, mode, actors, chapter, style, key }) => {

    const [isOpenHistory, setIsOpenHistory] = useState(false);
    const chapterRepo = useChapterRepository(state => state)
    const [stateChapter, setChapter] = useState<Chapter>({ ...chapter })
    useEffect(() => {
        const unsub = useChapterRepository.subscribe(
            (state) => state.items[idx],
            (state, prev) => setChapter(state),
            { fireImmediately: true }
        )
        return unsub
    }, [idx])

    const renderEnglishPrompts = (checkActors: string[]) => {
        if (!checkActors || checkActors.length === 0) {
            return ""
        }
        return actors!.filter(item => checkActors.indexOf(item.alias) !== -1).map(item => {
            return item.traits.map(f => f.value).join(",")
        }).join(";")
    }

    const renderNumber = () => {
        return (
            <Fragment>
                <div className='index'>{idx + 1}</div>
            </Fragment>
        )
    }

    const handleEditPrompt = async (e: any) => {
        await chapterRepo.updateItem(idx, { ...stateChapter, prompt: e.target.value }, false)
    }

    const renderEditPrompts = () => {
        return (
            <TextArea rows={6} placeholder={"请输入画面描述词"}
                maxLength={1000} className="text-area-auto"
                value={stateChapter.prompt?.en}
                onChange={handleEditPrompt} />
        )
    }

    const renderImage = () => {
        if (!stateChapter.image?.path) {
            return <div>待生成</div>
        }
        let imageUrl = tauri.convertFileSrc(stateChapter.image?.path)
        return (
            <div>
                <Image src={imageUrl} preview={false} />
            </div>
        )
    }

    const renderImageHistory = () => {
        if (!stateChapter.image?.history) {
            return <div>待生成</div>
        }
        return (
            <div className="flexR" style={{ flexWrap: "wrap", justifyContent: "flex-start", width: '100%' }}
                onClick={() => setIsOpenHistory(true)}>
                {stateChapter.image?.history?.map((p, idx) => {
                    return <Image src={tauri.convertFileSrc(p)} className="drawbath-image size-s" preview={false} key={idx} />
                })}
            </div>
        )
    }

    //comfyui
    const comfyuiRepo = useComfyUIRepository(state => state)

    const handleText2Image = async () => {
        if (!mode) {
            await message.warning("请选择图片风格")
            return
        }

        Modal.info({
            content: <div style={{ color: '#fff' }}>图片生成中...</div>,
            footer: null,
            mask: true,
            maskClosable: false,
        })

        await chapterRepo.handleGenerateImage(idx, mode, comfyuiRepo).catch(err => message.error(err)).finally(Modal.destroyAll)
    }

    const handleImageScale = async () => {
        if (!mode) {
            await message.warning("请选择图片风格")
            return
        }
        Modal.info({
            content: <div style={{ color: '#fff' }}>图片生成中...</div>,
            footer: null,
            mask: true,
            maskClosable: false,
        })
        await chapterRepo.handleGenerateImage(idx, mode, comfyuiRepo).catch(err => message.error(err)).finally(Modal.destroyAll)
    }


    const renderOperate = () => {
        return (
            <Fragment>
                <Button type='default' className='btn-default-auto btn-default-98' onClick={handleText2Image}>重绘本镜</Button>
                <Button type='default' className='btn-default-auto btn-default-98' disabled={!stateChapter.image?.path} onClick={handleImageScale}>高清放大</Button>
            </Fragment>
        )
    }

    const handleUpdateCurrentImage = async (path: string) => {
        await chapterRepo.updateItem(idx, { ...stateChapter, image: { ...stateChapter.image!, path: path } }, true)
    }
    const [isOpen, setOpen] = useState(false)
    return (
        <div className='tr flexR' style={style} key={key}>
            {stateChapter && drawbatchColumns.map((i, index) => {
                return (
                    <div className='td script-id flexC' key={i.key + index} style={{ flex: `${i.space}` }}>
                        {i.key === 'number' ? renderNumber() : null}
                        {i.key === 'original' ? stateChapter.original : null}
                        {i.key === 'drawPrompt' ? renderEditPrompts() : null}
                        {i.key === 'drawImage' && <AssetImage path={stateChapter.image?.path} repo={chapterRepo} />}
                        {i.key === 'drawImageHistory' && <AssetHistoryImages setOpen={setOpen} path={stateChapter.image?.path} history={stateChapter.image?.history || []} repo={chapterRepo} />}
                        {i.key === 'operate' ? renderOperate() : null}
                    </div>
                )
            })}
            <ModalHistoryImages isOpen={isOpen} setOpen={setOpen} path={stateChapter.image?.path} history={stateChapter.image?.history || []} repo={chapterRepo} onChange={handleUpdateCurrentImage} />
        </div>
    )
}

export default DrawTableTR