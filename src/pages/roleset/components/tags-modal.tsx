import assets from "@/assets";
import { Modal, Tabs, TabsProps } from "antd"
import { useMemo, useState } from "react";
import { CustomTags, OptionalTags, CheckedTags, TagRenderType } from "./tags-item";
import { TraitsConfig, TraitsOption, traitsConfigs } from "./traits";
interface TagModalProps {
    isOpen: boolean,
    initTags: TraitsOption[],
    initPreview?: string
    onClose: () => void
    onConfirm: (image: string, checkedTags: any[]) => void
}

const tabs: TabsProps["items"] = [
    {
        key: "common",
        label: "常用",
    },
    {
        key: "person",
        label: "人物",
    },
    {
        key: "clothes",
        label: "服饰",
    },
    {
        key: "hair",
        label: "头发",
    },
    {
        key: "face",
        label: "五官",
    },
    {
        key: "lens",
        label: "镜头",
    },
    {
        key: "emote",
        label: "表情",
    },
    {
        key: "custom",
        label: "自定义",
    },
];



const TagModal: React.FC<TagModalProps> = ({ isOpen, initTags, initImage, onClose, onConfirm }) => {
    const [cur, setCur] = useState("person");
    const [checkedTags, setCheckedTags] = useState<TraitsOption[]>(initTags);
    const [renderType, setRenderType] = useState<TagRenderType>('text')


    const handleCheckTag = (check: boolean, tag: any) => {
        let tags = [...checkedTags]
        if (check) {

            let identify = tag.key.split("@")
            let identityPrefix = identify[0]

            //互斥
            if (!identityPrefix.startsWith("custom")) {
                tags = tags.filter((item: any) => !item.key.startsWith(identityPrefix))
            }
            tags.push({ ...tag })

            setCheckedTags(tags)
        } else {
            setCheckedTags(tags.filter((item: any) => item.key !== tag.key))
        }
    }




    const renderOptionalTags = (tabKey: string) => {

        const groups = traitsConfigs.filter(item => item.key.startsWith(tabKey))

        //自定义
        if (tabKey === "custom") {
            let checkedCustomTags = checkedTags ? checkedTags.filter(t => t.key.startsWith("custom")) : []

            let customConfig: TraitsConfig = {
                key: "custom",
                name: "自定义",
                requirement: "",
                options: [...checkedCustomTags]
            }

            return <div className="flexR" style={{ alignItems: "stretch" }}>
                <div className="left">
                    <CustomTags renderType={renderType} handleCheckTag={handleCheckTag} hasTags={checkedTags} tags={customConfig} key={tabKey} />
                </div>
            </div>
        }

        //系统可选
        return (
            <div className="left" style={{ height: "500px", overflow: 'scroll', paddingLeft: '30px', paddingRight: '30px' }}>
                {groups.map((tags: any) => {
                    return <OptionalTags renderType={renderType} handleCheckTag={handleCheckTag} hasTags={checkedTags} tags={tags} key={tags.key} />
                })}
            </div>
        )
    }


    useMemo(() => {
        tabs.forEach((tab: any) => {
            tab.children = renderOptionalTags(tab.key)
        })
    }, [renderType, checkedTags])


    return (
        <Modal title="提示词生成器"
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={1160}
            className="home-login-modal role-tags-modal"
        >
            <div className={`role-tags-wrap flexC`}>
                <div className="choose-wrap flexR" style={{ marginBottom: '20px' }}>
                    <div className={`choose-item ${renderType === 'text' ? "cur" : ''}`} onClick={() => setRenderType('text')}>文字</div>
                    <div className={`choose-item flexR ${renderType === 'image' ? "cur" : ''}`} onClick={() => setRenderType('image')}>
                        图片
                        <img src={assets.vip} className="vip-img" /> </div>
                </div>
                <div className="flexR" style={{ alignItems: "stretch" }}>
                    <div className="left">
                        <Tabs items={tabs} onChange={setCur} activeKey={cur} />
                    </div>
                    <CheckedTags tags={checkedTags} preview={initImage} handleCheckTag={handleCheckTag} handleConfirm={(image) => onConfirm(image, checkedTags)} />
                </div>
            </div>
        </Modal>
    )
}



export default TagModal

