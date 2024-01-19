import { Button, Switch } from "antd"
import { Fragment, useEffect, useState } from "react";
import { storyboardColumns } from "../data";
import { Chapter, usePersistChaptersStorage } from "@/stores/story";
import { v4 as uuid } from "uuid"
import TextArea from "antd/es/input/TextArea";
import { Actor, usePersistActorsStorage } from "@/stores/actor";

interface StoryboardTableTRProps {
    idx: number,
    chapter: Chapter,
}

const emptyChapter: Chapter = { id: 0, original: "", sceneDescription: "", sceneDialogues: [], actors: [], state: 1 }
const StoryboardTableTR: React.FC<StoryboardTableTRProps> = ({ idx, chapter }) => {

    const { chapters, removeChapter, updateChapter, addChapter } = usePersistChaptersStorage(state => state)
    const { actors } = usePersistActorsStorage(state => state)
    const [stateChapter, setChapter] = useState<Chapter>(chapter)


    const renderNumber = () => {
        return (
            <Fragment>
                <div className='index'>{idx + 1}</div>
                <Button type='default' className='btn-default-auto btn-default-98'>推理关键词</Button>
                <Button type='default' className='btn-default-auto btn-default-98' onClick={() => removeChapter(idx)} disabled={chapters!.length === 1}>删除</Button>
                <Button type='default' className='btn-default-auto btn-default-98' onClick={() => addChapter(idx, { ...emptyChapter, id: uuid() })}>插入分镜</Button>
            </Fragment >
        )
    }

    const isActorChecked = (alias: string) => {
        return stateChapter.actors && stateChapter.actors.indexOf(alias) !== -1
    }

    const renderChinesePrompts = (checkActors: string[]) => {
        return actors.filter(item => checkActors.indexOf(item.alias) !== -1).map(item => {
            return item.traits.map(f => f.label).join(",")
        }).join(";")
    }
    const renderEnglishPrompts = (checkActors: string[]) => {
        return actors.filter(item => checkActors.indexOf(item.alias) !== -1).map(item => {
            return item.traits.map(f => f.value).join(",")
        }).join(";")
    }

    const handleActorChange = (checked: boolean, actor: Actor) => {
        let actors = [...stateChapter.actors]
        if (checked) {
            actors.push(actor.alias)
        } else {
            actors = actors.filter(alias => alias !== actor.alias)
        }
        setChapter({ ...stateChapter, actors: actors })
    }

    useEffect(() => {
        //实时渲染角色关键词
        stateChapter.actorsPrompt = {
            cn: renderChinesePrompts(stateChapter.actors || []),
            en: renderEnglishPrompts(stateChapter.actors || []),
        }
        updateChapter(idx, stateChapter)
    }, [stateChapter])



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
                        {i.key === 'scene' ? stateChapter.sceneDescription : null}
                        {i.key === 'actors' ? renderActors() : null}
                        {i.key === 'prompts' ? stateChapter.actorsPrompt?.cn : null}
                    </div>
                )
            })}
        </div>
    )
}

export default StoryboardTableTR