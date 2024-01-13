import { Button, Switch } from "antd"
import { Fragment, useEffect, useState } from "react";
import { storyboardColumns } from "../data";
import { Actor, Chapter, usePersistActorsStorage, usePersistChaptersStorage } from "@/stores/story";
import { v4 as uuid } from "uuid"

interface StoryboardTableTRProps {
    idx: number,
    chapter: Chapter,
}

const emptyChapter: Chapter = { id: "", original: "", prompts: "", actors: [], description: "", state: 1 }
const StoryboardTableTR: React.FC<StoryboardTableTRProps> = ({ idx, chapter }) => {

    const { chapters, removeChapter, updateChapter, addChapter } = usePersistChaptersStorage(state => state)
    const { actors } = usePersistActorsStorage(state => state)
    const [stateChapter, setChapter] = useState<Chapter>(chapter)

    useEffect(() => {
        updateChapter(idx, stateChapter)
    }, [stateChapter])

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
        return stateChapter.actors.indexOf(alias) !== -1
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

    return (
        <div className='tr flexR'>
            {stateChapter && storyboardColumns.map((i, index) => {
                return (
                    <div className='td script-id flexC' key={i.key + index} style={{ flex: `${i.space}` }}>
                        {i.key === 'number' ? renderNumber() : null}
                        {i.key === 'original' ? stateChapter.original : null}
                        {i.key === 'prompts' ? stateChapter.prompts : null}
                        {i.key === 'actors' ? renderActors() : null}
                        {i.key === 'description' ? stateChapter.description : null}
                    </div>
                )
            })}
        </div>
    )
}

export default StoryboardTableTR