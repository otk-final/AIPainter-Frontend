import { Button, Switch } from "antd"
import { Fragment, useState } from "react";
import { extractFramesColumns, extractFramesColumnsData } from "./data";

interface ExtractFramesTableTRProps {
    data: any,
    onDelete: (data: any) => void
}

const ExtractFramesTableTR: React.FC<ExtractFramesTableTRProps> = ({ data, onDelete }) => {
    const [dele, setDele] = useState(false);
    const handleDelete = () => {
        setDele(true)
        onDelete(data)
    }
    const renderNumber = () => {
        return (
            <Fragment>
                <div className='index'>{data.index + 1}</div>
                <Button type='default' className='btn-default-auto btn-default-98'>推理关键词</Button>
                <Button type='default' className='btn-default-auto btn-default-98' onClick={handleDelete}>删除</Button>
                <Button type='default' className='btn-default-auto btn-default-98'>插入分镜</Button>
            </Fragment>
        )
    }

    const renderRole = () => {
        return (
            <Fragment>
                {[1, 2, 3, 4].map((i) => {
                    return (
                        <div className="role-wrap flexR" key={i}>
                            <div>角色{i}: <span className="">胡八一</span></div>
                            <Switch className="switch-auto" onChange={() => { }} />
                        </div>
                    )
                })}
            </Fragment>
        )
    }

    if (dele) {
        return null
    }
    return (
        <div className='tr flexR'>
            {extractFramesColumns.map((i, index) => {
                return (
                    <div className='td script-id flexC' key={i.key + index} style={{ flex: `${i.space}` }}>
                        {i.key === 'number' ? renderNumber() : null}
                        {i.key === 'role' ? renderRole() : null}
                        {i.key !== 'number' && i.key !== 'role' ? data[i.key] : null}
                    </div>
                )
            })}
        </div>
    )
}

export default ExtractFramesTableTR