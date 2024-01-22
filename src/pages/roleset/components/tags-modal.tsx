import assets from "@/assets";
import { Tabs, TabsProps } from "antd"
import { useEffect, useMemo, useState } from "react";
import { CustomTags, OptionalTags, CheckedTags, TagRenderType } from "./tags-item";
import { TraitsConfig, TraitsOption, traitsConfigs } from "./traits";
import { Actor, useActorRepository } from "@/repository/story";

interface TagModalContentProps {
    index: number
    actor: Actor
    handleClose: () => void
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



const TagModalContent: React.FC<TagModalContentProps> = ({ index, actor, handleClose }) => {

    const [cur, setCur] = useState("person");
    const [checkedTags, setCheckedTags] = useState<TraitsOption[]>([]);
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
            <div className="left scrollbar" style={{ height: "500px", overflowY: 'scroll' }}>
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



    useEffect(() => {
        const unsub = useActorRepository.subscribe(
            (state) => state.items[index],
            (state, prev) => {
                console.info("actor state", state)
                if (state) setCheckedTags(state.traits)
            }, { fireImmediately: true })
        return unsub
    }, [index])


    return (
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
                <CheckedTags index={index} tags={checkedTags} image={actor.image} handleCheckTag={handleCheckTag} handleClose={handleClose} />
            </div>
        </div>
    )
}



export default TagModalContent

