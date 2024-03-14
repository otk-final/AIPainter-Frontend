import { Button, message, Modal } from "antd"
import TextArea from "antd/es/input/TextArea";
import { Fragment, useEffect, useState } from "react";
import { drawbatchColumns } from "../data";
import { Chapter, useChapterRepository } from "@/repository/chapter";
import { Actor, useActorRepository } from "@/repository/actor";
import { useComfyUIRepository } from "@/repository/comfyui";
import { AssetImage, ChapterHistoryImages, ModalHistoryImages } from "@/components/history-image";
import { Project } from "@/repository/workspace";

interface ChapterTableTRProps {
    index: number,
    mode: string
    chapter: Chapter,
    style: React.CSSProperties,
    key: string,
    actors?: Actor[]
    project: Project
}

const ImageGenerateTab: React.FC<ChapterTableTRProps> = ({ index, mode, chapter, style, key, project }) => {

    const chapterRepo = useChapterRepository(state => state)
    const actorRepo = useActorRepository(state => state)
    const comfyuiRepo = useComfyUIRepository(state => state)
    const [stateChapter, setChapter] = useState<Chapter>({ ...chapter })

    useEffect(() => {
        const unsub = useChapterRepository.subscribe(
            (state) => state.items[index],
            (state,) => state && setChapter(state),
            { fireImmediately: true }
        )
        return unsub
    }, [index])

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
                <div className='index'>{index + 1}</div>
            </Fragment>
        )
    }

    const handleEditPrompt = async (e: any) => {
        await chapterRepo.updateItem(index, { ...stateChapter, prompt: e.target.value }, false)
    }

    const renderEditPrompt = () => {
        return (
            <TextArea rows={6} placeholder={"请输入画面关键词"}
                maxLength={1000} className="text-area-auto"
                value={stateChapter.prompt}
                onChange={handleEditPrompt} />
        )
    }

    const handleEditScene = async (e: any) => {
        await chapterRepo.updateItem(index, { ...stateChapter, scene: e.target.value }, false)
    }

    const renderEditScene = () => {
        return (
            <TextArea rows={6} placeholder={"请输入画面描述词"}
                maxLength={1000} className="text-area-auto"
                value={stateChapter.scene}
                onChange={handleEditScene} />
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

        await chapterRepo.handleGenerateImage(index, mode, project, comfyuiRepo, actorRepo).catch(err => message.error(err.message)).finally(Modal.destroyAll)
    }

    const handleImageScale = async () => {
        Modal.info({
            content: <div style={{ color: '#fff' }}>图片放大中...</div>,
            footer: null,
            mask: true,
            maskClosable: false,
        })
        await chapterRepo.handleScaleImage(index, comfyuiRepo).catch(err => message.error(err.message)).finally(Modal.destroyAll)
    }


    const handleTranslatePrompt = async () => {
        Modal.info({
            content: <div style={{ color: '#fff' }}>关键词翻译中...</div>,
            footer: null,
            mask: true,
            maskClosable: false,
        })
        await chapterRepo.handleTranslatePrompt(index).catch(err => message.error(err.message)).finally(Modal.destroyAll)
    }



    const renderOperate = () => {
        return (
            <Fragment>
                <Button type='default' className='btn-default-auto btn-default-98' onClick={handleText2Image} disabled={!stateChapter.prompt}>{stateChapter.image?.path ? "重绘本镜" : "生成图片"}</Button>
                <Button type='default' className='btn-default-auto btn-default-98' disabled={!stateChapter.image?.path} onClick={handleImageScale}>高清放大</Button>
                <Button type='default' className='btn-default-auto btn-default-98' disabled={!stateChapter.scene} onClick={handleTranslatePrompt}>翻译描述</Button>
            </Fragment>
        )
    }

    const handleUpdateCurrentImage = async (path: string) => {
        await chapterRepo.updateItem(index, { ...stateChapter, image: { ...stateChapter.image!, path: path } }, true)
    }
    const [isOpen, setOpen] = useState(false)
    return (
        <div className='list-tr flexR' style={style} key={key}>
            {stateChapter && drawbatchColumns.map((i, idx) => {
                return (
                    <div className='list-td script-id flexC' key={i.key + idx} style={{ flex: `${i.space}` }}>
                        {i.key === 'number' ? renderNumber() : null}
                        {i.key === 'description' ? renderEditScene() : null}
                        {i.key === 'drawPrompt' ? renderEditPrompt() : null}
                        {i.key === 'drawImage' && <AssetImage path={stateChapter.image?.path} repo={chapterRepo} />}
                        {i.key === 'drawImageHistory' && <ChapterHistoryImages pid={project.id} setOpen={setOpen} idx={index} />}
                        {i.key === 'operate' ? renderOperate() : null}
                    </div>
                )
            })}
            <ModalHistoryImages isOpen={isOpen} setOpen={setOpen} path={stateChapter.image?.path} history={stateChapter.image?.history || []} repo={chapterRepo} onChange={handleUpdateCurrentImage} />
        </div>
    )
}

export default ImageGenerateTab