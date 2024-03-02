import { Button, message, Modal } from "antd"
import TextArea from "antd/es/input/TextArea";
import { Fragment, useEffect, useState } from "react";
import { drawbatchColumns } from "../data";
import { Actor, Chapter, useActorRepository, useChapterRepository } from "@/repository/story";
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

const ImageGenerateTab: React.FC<ChapterTableTRProps> = ({ idx, mode, chapter, style, key }) => {

    const chapterRepo = useChapterRepository(state => state)
    const actorRepo = useActorRepository(state => state)
    const comfyuiRepo = useComfyUIRepository(state => state)

    const [stateChapter, setChapter] = useState<Chapter>({ ...chapter })

    useEffect(() => {
        const unsub = useChapterRepository.subscribe(
            (state) => state.items[idx],
            (state,) => state && setChapter(state),
            { fireImmediately: true }
        )
        return unsub
    }, [idx])

    // const renderEnglishPrompts = (checkActors: string[]) => {
    //     if (!checkActors || checkActors.length === 0) {
    //         return ""
    //     }
    //     return actors!.filter(item => checkActors.indexOf(item.alias) !== -1).map(item => {
    //         return item.traits.map(f => f.value).join(",")
    //     }).join(";")
    // }

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
                value={stateChapter.prompt}
                onChange={handleEditPrompt} />
        )
    }

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

        await chapterRepo.handleGenerateImage(idx, mode, comfyuiRepo, actorRepo).catch(err => message.error(err)).finally(Modal.destroyAll)
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
        await chapterRepo.handleGenerateImage(idx, mode, comfyuiRepo, actorRepo).catch(err => message.error(err)).finally(Modal.destroyAll)
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
                        {i.key === 'description' ? stateChapter.description : null}
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

export default ImageGenerateTab