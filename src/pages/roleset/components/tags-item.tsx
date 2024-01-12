import assets from "@/assets"
import { CaretDownFilled, CaretUpFilled, CloseOutlined } from "@ant-design/icons"
import { Button, Input } from "antd"
import { useEffect, useState } from "react"

export type TagRenderType = "text" | "image"
export type TagLangType = "en" | "cn"



export interface TagItemProps {
    renderType: TagRenderType
    langType: TagLangType,
    isChecked: boolean
    tag?: any
    handleCheckTag?: (checked: boolean, item: any) => void
    handleRemoveTag?: (item: any) => void
}


export const TagItem: React.FC<TagItemProps> = ({ renderType, langType, isChecked = false, tag, handleCheckTag, handleRemoveTag }) => {

    const [stateChecked, setChecked] = useState<boolean>(false)
    const handleClick = () => {
        if (!handleCheckTag) {
            return
        }
        let isChecked = !stateChecked
        setChecked(isChecked)
        handleCheckTag!(isChecked, tag)
    }

    useEffect(() => {
        setChecked(isChecked)
    }, [isChecked])

    if (renderType === "image") {
        return (
            <div className={`role-tag-img-wrap ${stateChecked ? "cur" : ""}`}
                onClick={handleClick}>
                <img src={assets.actor} className="tag-img" />
                <div className="tag-img-text">{tag.cn}</div>
            </div>
        )
    }

    return (
        <div className={`role-tag-wrap ${stateChecked ? "cur" : ""}`} onClick={handleClick}>
            {handleRemoveTag && <CloseOutlined className="icon" onClick={() => handleRemoveTag!(tag)} />}
            {langType === "cn" ? tag.cn : tag.en}
        </div>
    )
}



interface RoleTagsProps {
    renderType: TagRenderType
    tags?: any
    hasTags: any[]
    handleCheckTag: (checked: boolean, item: any) => void
    handleRemoveTag?: (item: any) => void
}

export const CustomTags: React.FC<RoleTagsProps> = ({ tags, hasTags, handleCheckTag }) => {
    const [input, setInput] = useState("");
    const [customTags, setCustomTags] = useState<any[]>([...tags.options])

    const handleDelete = (tag: any) => {
        setCustomTags([...customTags.filter(item => item.key !== tag.key)])
        handleCheckTag(false, tag)
    }

    const handleAdd = () => {

        if (!input) {
            return
        }

        //默认选中
        const newTag = { key: "custom-" + customTags.length + 1, cn: input, en: input }
        customTags.push(newTag)

        setCustomTags([...customTags])
        handleCheckTag(true, newTag)
        setInput("")
    }


    const isChecked = (tag: any) => {
        return hasTags.some(t => t.key === tag.key)
    }


    return (<div style={{ width: '100%' }}>
        <div className="title-tags">自定义提示词</div>
        <div className="has-tags custom-tas-tags">
            <div className="role-tags-box flexR">
                {customTags.map((tag: any, idx: number) => <TagItem key={idx} renderType={'text'} langType={'cn'} tag={tag} isChecked={isChecked(tag)}  handleRemoveTag={handleDelete}></TagItem>)}
            </div>
        </div>

        <div className="flexR">
            <Input size="large" value={input} onChange={(v) => setInput(v.target.value)} style={{ height: "40px" }} />
            <Button type="primary" className="bottom-item btn-primary-auto" style={{ height: "40px", marginLeft: '20px' }} onClick={handleAdd}>添加</Button>
        </div>
    </div>)
}





export const OptionalTags: React.FC<RoleTagsProps> = ({ renderType, tags, hasTags, handleCheckTag }) => {
    const [fold, setFold] = useState(false)

    const isChecked = (tag: any) => {
        return hasTags.some(t => t.key === tag.key)
    }

    return (
        <div className="role-tags-wrap">
            <div className="role-tags-title" onClick={() => setFold(!fold)}>
                {!fold ? <CaretUpFilled className="icon" /> : <CaretDownFilled className="icon" />}
                {tags.text}
                <span>{tags.subText}</span>
            </div>
            {!fold ? (
                <div className="role-tags-box flexR">
                    {tags.options.map((tag: any, idx: number) => <TagItem key={idx} renderType={renderType} langType={'cn'} tag={tag} isChecked={isChecked(tag)} handleCheckTag={handleCheckTag}></TagItem>)}
                </div>
            ) : null}
        </div>
    )
}


export const CheckedTags: React.FC<RoleTagsProps> = ({ tags, handleCheckTag }) => {
    const [lang, setLang] = useState<TagLangType>("cn")

    const handleConfirm = () => {

    }
    const handleReset = () => {

    }

    const handleRemoveTag = (tag: any) => {
        handleCheckTag(false, tag)
    }

    return (
        <div className="right flexC">
            <div className="has-tags">
                <div className="content flexR">
                    {tags.map((tag: any, idx: number) => <TagItem key={idx} renderType={'text'} langType={lang} tag={tag} isChecked={true} handleRemoveTag={handleRemoveTag}></TagItem>)}
                </div>
            </div>
            <div style={{ width: '100%' }}>
                <div className="bottom flexRB">
                    <div className="choose-wrap flexR">
                        <div className={`choose-item ${lang === 'cn' ? "cur" : ''}`} onClick={() => setLang('cn')}>中</div>
                        <div className={`choose-item ${lang === 'en' ? "cur" : ''}`} onClick={() => setLang('en')}>En</div>
                    </div>
                    <div className="clean" onClick={handleReset}>清空</div>
                </div>
                <Button type="primary" block className="bottom-item btn-primary-auto" onClick={handleConfirm}>保存</Button>
            </div>
        </div>
    )
}