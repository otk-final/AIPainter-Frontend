import { CaretDownFilled, CaretUpFilled, CloseOutlined } from "@ant-design/icons"
import { Button, Input, message, Modal } from "antd"
import { useEffect, useState } from "react"
import { TraitsConfig, TraitsOption } from "./traits"
import tauri from "@tauri-apps/api/core"
import { useComfyUIRepository } from "@/repository/comfyui"
import { useActorRepository } from "@/repository/actor"

export type TagRenderType = "text" | "image"
export type TagLangType = "en" | "cn"



export interface TagItemProps {
    renderType: TagRenderType
    langType: TagLangType,
    isChecked: boolean
    tag?: TraitsOption
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
                <img src={tag?.image} className="tag-img" />
                <div className="tag-img-text">{tag?.label}</div>
            </div>
        )
    }

    return (
        <div className={`role-tag-wrap ${stateChecked ? "cur" : ""}`} onClick={handleClick}>
            {handleRemoveTag && <CloseOutlined className="icon" onClick={() => handleRemoveTag!(tag)} />}
            {langType === "cn" ? tag?.label : tag?.value}
        </div>
    )
}



interface RoleTagsProps {
    renderType: TagRenderType
    tags?: TraitsConfig
    hasTags: any[]
    handleCheckTag: (checked: boolean, item: any) => void
    handleRemoveTag?: (item: any) => void
}

export const CustomTags: React.FC<RoleTagsProps> = ({ tags, hasTags, handleCheckTag }) => {
    const [input, setInput] = useState("");
    const [customTags, setCustomTags] = useState<any[]>([...tags!.options])

    const handleDelete = (tag: any) => {
        setCustomTags([...customTags.filter(item => item.key !== tag.key)])
        handleCheckTag(false, tag)
    }

    const handleAdd = () => {

        if (!input) {
            return
        }

        //默认选中
        const newTag: TraitsOption = { key: "custom@" + customTags.length + 1, label: input, value: input }
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
                {customTags.map((tag: any, idx: number) => <TagItem key={idx} renderType={'text'} langType={'cn'} tag={tag} isChecked={isChecked(tag)} handleRemoveTag={handleDelete}></TagItem>)}
            </div>
        </div>

        <div className="flexR">
            <Input size="large"  style={{ width: '160px', height: '28px', borderRadius: '2px', marginRight: '8px' }} value={input} onChange={(v) => setInput(v.target.value)}  />
            <Button type="primary" className="btn-primary-auto btn-primary-88" onClick={handleAdd}>添加</Button>
        </div>
    </div>)
}





export const OptionalTags: React.FC<RoleTagsProps> = ({ renderType, tags, hasTags, handleCheckTag }) => {
    const [fold, setFold] = useState(false)

    const isChecked = (tag: TraitsOption) => {
        return hasTags.some(t => t.key === tag.key)
    }

    return (
        <div className="role-tags-wrap">
            <div className="role-tags-title" onClick={() => setFold(!fold)}>
                {!fold ? <CaretUpFilled className="icon" /> : <CaretDownFilled className="icon" />}
                {tags?.name}
                <span>{tags?.requirement}</span>
            </div>
            {!fold ? (
                <div className="role-tags-box flexR">
                    {tags?.options.map((tag: any, idx: number) => <TagItem key={idx} renderType={renderType} langType={'cn'} tag={tag} isChecked={isChecked(tag)} handleCheckTag={handleCheckTag}></TagItem>)}
                </div>
            ) : null}
        </div>
    )
}


interface CheckedTagsProps {
    tags?: TraitsOption[]
    image?: string
    handleCheckTag: (checked: boolean, item: any) => void
    onChange: (tags: TraitsOption[], image?: string) => void
}


export const CheckedTags: React.FC<CheckedTagsProps> = ({ tags, image, handleCheckTag, onChange }) => {

    const [lang, setLang] = useState<TagLangType>("cn");
    const handleRemoveTag = (tag: any) => {
        handleCheckTag(false, tag)
    }

    const [isPreview, setPreview] = useState<boolean>(false)
    const [statePath, setPath] = useState<string | undefined>(image)
    const [statePreviewPath, setPreviewPath] = useState<string | undefined>()
    const comfyuiRepo = useComfyUIRepository(state => state)
    const actorRepo = useActorRepository(state => state)

    useEffect(() => {
        if (image) {
            actorRepo.absulotePath(image).then((imagePath) => { setPreviewPath(imagePath) })
        } else {
            setPreviewPath(undefined)
        }
    }, [image])

    const handleGeneratePreviewRender = async (tags: TraitsOption[]) => {
        //生图
        let actor_path = await actorRepo.handleGenerateImage(tags, comfyuiRepo)
        setPath(actor_path)

        //渲染
        let abs_path = await actorRepo.absulotePath(actor_path)
        setPreviewPath(abs_path)
        setPreview(true)
    }
    
    //生成图片
    const handleGeneratePreview = async () => {
        if (!tags || tags.length === 0) {
            message.error("至少选择一个标签")
            return
        }
        Modal.info({
            content: <div style={{ color: '#fff' }}>图片生成中...</div>,
            footer: null,
            mask: true,
            maskClosable: false,
        })
        await handleGeneratePreviewRender(tags).catch(err => message.error(err.message)).finally(Modal.destroyAll)
    }




    //保存数据
    const handleConfirm = async () => {
        if (!tags) {
            message.error("至少选择一个标签")
            return;
        }
        onChange(tags, statePath)
    }


    return (
        <div className="right flexC">
            <div className="has-tags">
                {
                    isPreview &&
                    <div className="content flexR">
                        {statePreviewPath && <img src={tauriconvertFileSrc(statePreviewPath)} width={'100%'}></img>}
                    </div>
                }
                {
                    !isPreview &&
                    <div className="content flexR">
                        {tags && tags.map((tag: any, idx: number) => <TagItem key={idx} renderType={'text'} langType={lang} tag={tag} isChecked={true} handleRemoveTag={handleRemoveTag}></TagItem>)}
                    </div>
                }

            </div>
            <div style={{ width: '100%' }}>
                <div className="bottom flexRB">
                    <div className="choose-wrap flexR">
                        <div className={`choose-item ${lang === 'cn' ? "cur" : ''}`} onClick={() => setLang('cn')}>中</div>
                        <div className={`choose-item ${lang === 'en' ? "cur" : ''}`} onClick={() => setLang('en')}>En</div>
                    </div>
                    <div className="clean" onClick={() => setPreview(!isPreview)}>预览</div>
                </div>
                <div className="flexR" style={{ justifyContent: 'space-between' }}>
                    <Button type="primary" block className="btn-primary-auto btn-primary-88" onClick={handleGeneratePreview} >生成</Button>
                    <Button type="primary" block className="btn-primary-auto btn-primary-88" onClick={handleConfirm}>保存</Button>
                </div>
            </div>
        </div>
    )
}