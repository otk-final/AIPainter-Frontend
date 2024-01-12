import assets from "@/assets"
import { CaretDownFilled, CaretUpFilled, CloseOutlined } from "@ant-design/icons"
import { Button, Image, Input } from "antd"
import { useState } from "react"

export type TagDisplayType = "text" | "image"

interface RoleTagsProps {
    displayType: TagDisplayType
    tags?: any
    hasTags: any[]
    handleCheckTag: (item: any) => void
    onDelete?: (item: any) => void
}

export const RoleTags: React.FC<RoleTagsProps> = ({ displayType, tags, hasTags, handleCheckTag }) => {
    const [fold, setFold] = useState(false)

    


    return (
        <div className="role-tags-wrap">
            <div className="role-tags-title" onClick={() => setFold(!fold)}>
                {!fold ? <CaretUpFilled className="icon" /> : <CaretDownFilled className="icon" />}
                {tags.text}
                <span>{tags.subText}</span>
            </div>
            {!fold ? (
                <div className="role-tags-box flexR">
                    {tags.options.map((i: any, idx: number) => <RoleItem key={idx} displayType={displayType} tag={i} hasTags={hasTags} handleCheckTag={handleCheckTag}></RoleItem>)}
                </div>
            ) : null}
        </div>
    )
}


export const RoleCustomTags: React.FC<RoleTagsProps> = ({ displayType, tags, hasTags, handleCheckTag }) => {
    const [input, setInput] = useState("");
    const [customTags, setCustomTags] = useState<any[]>([...tags.options])

    const handleDelete = (tag: any) => {
        setCustomTags([...customTags.filter(item => item.key !== tag.key)])
    }

    const handleAdd = () => {
        if (!input) {
            return
        }

        //默认选中
        const newTag = { key: "custom-" + customTags.length + 1, label: input, checked: true }
        customTags.push(newTag)

        setInput("")
    }


    return (<div style={{ width: '100%' }}>
        <div className="title-tags">自定义提示词</div>
        <div className="has-tags custom-tas-tags">
            <div className="role-tags-box flexR">
                {customTags.map((tag: any, idx: number) => <RoleItem key={idx} displayType={displayType} tag={tag} hasTags={hasTags} canDelete={true} handleCheckTag={handleCheckTag} handleRemoveTag={handleDelete}></RoleItem>)}
            </div>
        </div>

        <div className="flexR">
            <Input size="large" value={input} onChange={(v) => setInput(v.target.value)} style={{ height: "40px" }} />
            <Button type="primary" className="bottom-item btn-primary-auto" style={{ height: "40px", marginLeft: '20px' }} onClick={handleAdd}>添加</Button>
        </div>
    </div>)
}




interface RoleItemProps {
    displayType: TagDisplayType
    canDelete?: boolean
    tag?: any
    hasTags: any[]
    handleCheckTag: (checked: boolean, item: any) => void
    handleRemoveTag?: (item: any) => void
}


const RoleItem: React.FC<RoleItemProps> = ({ displayType, canDelete = false, tag, handleCheckTag, handleRemoveTag }) => {

    const [stateTag, setTag] = useState<any>(tag)
    const handleClick = () => {
        setTag({ ...stateTag, checked: !stateTag.checked })
    }

    if (displayType === "image") {
        return (
            <div className={`role-tag-img-wrap ${tag.checked ? "cur" : ""}`}
                onClick={handleClick}>
                <img src={assets.actor} className="tag-img" />
                <div className="tag-img-text">{tag.label}</div>
            </div>
        )
    }

    return (
        <div className={`role-tag-wrap ${tag.checked ? "cur" : ""}`} onClick={handleClick}>
            {canDelete && <CloseOutlined className="icon" onClick={() => handleRemoveTag!(tag)} />}
            {tag.label}
        </div>
    )
}

