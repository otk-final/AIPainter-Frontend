import { Button, Modal, Switch, message } from "antd"
import { Fragment, useEffect, useState } from "react";
import { storyboardColumns } from "../data";
import TextArea from "antd/es/input/TextArea";
import { Actor, Chapter, useChapterRepository } from "@/repository/story";
import { useGPTRepository } from "@/repository/gpt";
import ButtonGroup from "antd/es/button/button-group";
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons";

interface StoryboardTableTRProps {
    idx: number,
    chapter: Chapter,
    actors: Actor[],
    style: React.CSSProperties,
    key: string
}

const emptyChapter: Chapter = {
    id: 0,
    name: "",
    draft: "",
    scene: "",
    srt: "",
    actors: [],
    image: {
        history: [] as string[]
    },
    effect: { orientation: "random" }
}


const StoryboardTableTR: React.FC<StoryboardTableTRProps> = ({ idx, chapter, actors, style, key }) => {

    //页面级状态
    const [stateChapter, setChapter] = useState<Chapter>({ ...chapter })

    const chapterRepo = useChapterRepository(state => state)
    const gptRepo = useGPTRepository(state => state)

    useEffect(() => {
        const unsub = useChapterRepository.subscribe(
            (state) => state.items[idx],
            (state, prev) => setChapter(state),
            { fireImmediately: true })
        return unsub
    }, [idx, chapter])


    const isActorChecked = (alias: string) => {
        return stateChapter.actors && stateChapter.actors.indexOf(alias) !== -1
    }

    // const renderChinesePrompts = (checkActors: string[]) => {
    //     if (!checkActors || checkActors.length === 0) {
    //         return ""
    //     }
    //     return actors.filter(item => checkActors.indexOf(item.alias) !== -1).map(item => {
    //         return item.traits.map(f => f.label).join(",")
    //     }).join(";")
    // }


    const handleAddBeforeChapter = async () => {
        await chapterRepo.addItemBefore(idx, { ...emptyChapter })
    }
    const handleAddAfterChapter = async () => {
        await chapterRepo.addItemAfter(idx, { ...emptyChapter })
    }

    const handleDelChapter = async () => {
        await chapterRepo.delItem(idx, true)
    }

    const renderNumber = () => {
        return (
            <Fragment>
                <div className='index'>{idx + 1}</div>
                <Button type='default' className='btn-default-auto btn-default-98' onClick={handleDelChapter} disabled={chapterRepo.items!.length === 1}>删除</Button>
                <ButtonGroup>
                    <Button type='default' className='btn-default-auto btn-default-98' onClick={handleAddBeforeChapter} icon={<ArrowUpOutlined/>}>添加分镜</Button>
                    <Button type='default' className='btn-default-auto btn-default-98' onClick={handleAddAfterChapter} icon={<ArrowDownOutlined />}>添加分镜</Button>
                </ButtonGroup>
            </Fragment >
        )
    }


    const handleActorChange = async (checked: boolean, actor: Actor) => {
        let actors = stateChapter.actors ? [...stateChapter.actors] : []
        if (checked) {
            actors.push(actor.alias)
        } else {
            actors = actors.filter(alias => alias !== actor.alias)
        }
        await chapterRepo.updateItem(idx, { ...stateChapter, actors: actors }, true)
    }


    const renderActors = () => {
        return (
            <Fragment>
                {actors.map((item, idx) => {
                    return (
                        <div className="role-wrap flexR" key={idx}>
                            <div>角色{idx + 1}: <span className="">{item.name}</span></div>
                            <Switch className="switch-auto" onChange={(checked) => { handleActorChange(checked, item) }} checked={isActorChecked(item.alias)} />
                        </div>
                    )
                })}
            </Fragment>
        )
    }

    const handleEditDraft = async (e: any) => {
        await chapterRepo.updateItem(idx, { ...stateChapter, draft: e.target.value }, false)
    }
    const renderDraft = () => {
        return (
            <TextArea rows={6} placeholder={"请输入剧本内容"}
                maxLength={1000} className="text-area-auto"
                value={stateChapter.draft}
                onChange={handleEditDraft} />
        )
    }

    const handleEditScene = async (e: any) => {
        await chapterRepo.updateItem(idx, { ...stateChapter, scene: e.target.value }, false)
    }
    const renderScene = () => {
        return (
            <TextArea rows={6} placeholder={"请输入场景关键词"}
                maxLength={1000} className="text-area-auto"
                value={stateChapter.scene}
                onChange={handleEditScene} />
        )
    }

    const handleResloveChapter = async () => { 
        Modal.info({
            content: <div style={{ color: '#fff' }}>推理关键词中...</div>,
            footer: null,
            mask: true,
            maskClosable: false,
        })
        await chapterRepo.handleResolveChapter(idx, gptRepo).catch(err => message.error(err.message)).finally(Modal.destroyAll)
    }

    const renderOperate = () => {
        return (
            <Fragment>
                <Button type='default' className='btn-default-auto btn-default-98' disabled={!stateChapter.draft} onClick={handleResloveChapter}>推理关键词</Button>
            </Fragment>
        )
    }

    return (
        <div className='list-tr flexR' style={style} key={key}>
            {stateChapter && storyboardColumns.map((i, index) => {
                return (
                    <div className='list-td script-id flexC' key={i.key + index} style={{ flex: `${i.space}` }}>
                        {i.key === 'number' ? renderNumber() : null}
                        {i.key === 'draft' ? renderDraft() : null}
                        {i.key === 'scene' ? renderScene() : null}
                        {i.key === 'actors' ? renderActors() : null}
                        {i.key === 'operate' ? renderOperate() : null}
                    </div>
                )
            })}
        </div>
    )
}

export default StoryboardTableTR