import { Button, Switch } from "antd"
import { Fragment } from "react";
import { storyboardColumns } from "../data";
import { Chapter, usePersistActorsStorage } from "@/stores/story";

interface StoryboardTableTRProps {
    idx: number,
    data: Chapter,
}

const StoryboardTableTR: React.FC<StoryboardTableTRProps> = ({ idx, data }) => {

    const chapter = usePersistActorsStorage(state => state.chapters[idx])
    const handleRemove = usePersistActorsStorage(state => state.remove)
    const actors = usePersistActorsStorage(state => state.actors)

    const renderNumber = () => {
        return (
            <Fragment>
                <div className='index'>{idx + 1}</div>
                <Button type='default' className='btn-default-auto btn-default-98'>推理关键词</Button>
                <Button type='default' className='btn-default-auto btn-default-98' onClick={() => handleRemove(idx)}>删除</Button>
                <Button type='default' className='btn-default-auto btn-default-98'>插入分镜</Button>
            </Fragment>
        )
    }

    const renderActors = () => {
        return (
            <Fragment>
                {actors.map((item, idx) => {
                    return (
                        <div className="role-wrap flexR" key={idx}>
                            <div>角色{idx + 1}: <span className="">{item?.name}</span></div>
                            <Switch className="switch-auto" onChange={() => { }} />
                        </div>
                    )
                })}
            </Fragment>
        )
    }

    return (
        <div className='tr flexR'>
            {storyboardColumns.map((i, index) => {
                return (
                    <div className='td script-id flexC' key={i.key + index} style={{ flex: `${i.space}` }}>
                        {i.key === 'number' ? renderNumber() : null}
                        {i.key === 'original' ? chapter!.original : null}
                        {i.key === 'prompts' ? chapter!.prompts : null}
                        {i.key === 'actors' ? renderActors() : null}
                        {i.key === 'description' ? chapter!.description : null}
                    </div>
                )
            })}
        </div>
    )
}

export default StoryboardTableTR