import { Button, Switch } from "antd"
import { Fragment, useEffect, useState } from "react";
import { storyboardColumns } from "../data";
import TextArea from "antd/es/input/TextArea";
import { v4 as uuid } from "uuid"
import { Actor, Chapter, useActorRepository, useChapterRepository } from "@/repository/story";

interface StoryboardTableTRProps {
    idx: number,
    chapter: Chapter,
}

const emptyChapter: Chapter = { id: "", original: "", actors: [] }

const StoryboardTableTR: React.FC<StoryboardTableTRProps> = ({ idx, chapter }) => {

    const actorRepo = useActorRepository(state => state)
    const chapterRepo = useChapterRepository(state => state)

    //页面级状态
    const [stateChapter, setChapter] = useState<Chapter>({ ...chapter })

    useEffect(() => {
        const unsub = useChapterRepository.subscribe(
            (state) => state.items[idx],
            (state, prev) => {
                console.info("state change")
                let stateCopy = { ...state }
                stateCopy.prompt = {
                    cn: renderChinesePrompts(stateCopy.actors || []),
                    en: renderEnglishPrompts(stateCopy.actors || []),
                }
                setChapter(stateCopy)
            },
            { fireImmediately: true })
        return unsub
    }, [idx])



    const handleAddChapter = () => {
        chapterRepo.addItem(idx, { ...emptyChapter, id: uuid() })
    }

    const handleDelChapter = () => {
        chapterRepo.delItem(idx)
    }


    const renderNumber = () => {
        return (
            <Fragment>
                <div className='index'>{idx + 1}</div>
                <Button type='default' className='btn-default-auto btn-default-98'>推理关键词</Button>
                <Button type='default' className='btn-default-auto btn-default-98' onClick={handleDelChapter} disabled={chapterRepo.items!.length === 1}>删除</Button>
                <Button type='default' className='btn-default-auto btn-default-98' onClick={handleAddChapter}>插入分镜</Button>
            </Fragment >
        )
    }

    const isActorChecked = (alias: string) => {
        return stateChapter.actors && stateChapter.actors.indexOf(alias) !== -1
    }

    const renderChinesePrompts = (checkActors: string[]) => {
        return actorRepo.items.filter(item => checkActors.indexOf(item.alias) !== -1).map(item => {
            return item.traits.map(f => f.label).join(",")
        }).join(";")
    }

    const renderEnglishPrompts = (checkActors: string[]) => {
        return actorRepo.items.filter(item => checkActors.indexOf(item.alias) !== -1).map(item => {
            return item.traits.map(f => f.value).join(",")
        }).join(";")
    }

    const handleActorChange = (checked: boolean, actor: Actor) => {
        let actors = stateChapter.actors ? [...stateChapter.actors] : []
        if (checked) {
            actors.push(actor.alias)
        } else {
            actors = actors.filter(alias => alias !== actor.alias)
        }

        setChapter({ ...stateChapter, actors: actors })
    }


    const renderActors = () => {
        return (
            <Fragment>
                {actorRepo.items.map((item, idx) => {
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

    const renderEditOriginal = () => {

        return (
            <TextArea rows={6} placeholder={"请输入剧本内容"}
                maxLength={1000} className="text-area-auto"
                value={stateChapter.original}
                onChange={(e) => { setChapter({ ...stateChapter, original: e.target.value }) }} />
        )
    }


    return (
        <div className='tr flexR'>
            {stateChapter && storyboardColumns.map((i, index) => {
                return (
                    <div className='td script-id flexC' key={i.key + index} style={{ flex: `${i.space}` }}>
                        {i.key === 'number' ? renderNumber() : null}
                        {i.key === 'original' ? renderEditOriginal() : null}
                        {i.key === 'scene' ? stateChapter.ai?.scene : null}
                        {i.key === 'actors' ? renderActors() : null}
                        {i.key === 'prompts' ? stateChapter.prompt?.cn : null}
                    </div>
                )
            })}
        </div>
    )
}

export default StoryboardTableTR