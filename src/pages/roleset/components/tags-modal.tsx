import assets from "@/assets";
import { Modal, Tabs, TabsProps } from "antd"
import { useEffect, useMemo, useState } from "react";
import { TagDisplayType, CustomTags, OptionalTags, CheckedTags } from "./tags-item";

interface TagModalProps {
    isOpen: boolean,
    onClose: () => void
}


const mockdata = [
    {
        key: 'clothes-common',
        text: '常用全套',
        subText: '（单选项，如无特别要求，可不选）',
        options: []
    },
    {
        key: 'clothes-coat',
        text: '上身',
        subText: '（单选项，如无特别要求，可不选）',
        options: []
    },
    {
        key: 'clothes-pants',
        text: '下身',
        subText: '（单选项，如无特别要求，可不选）',
        options: []
    },
    {
        key: 'clothes-shoes',
        text: '鞋子',
        subText: '（单选项，如无特别要求，可不选）',
        options: []
    },
    {
        key: 'clothes-hats',
        text: '帽子',
        subText: '（单选项，如无特别要求，可不选）',
        options: []
    },
    {
        key: 'face-eye',
        text: '眼睛',
        subText: '（单选项，如无特别要求，可不选）',
        options: []
    },
    {
        key: 'face-ear',
        text: '耳朵',
        subText: '（单选项，如无特别要求，可不选）',
        options: []
    },
    {
        key: 'face-nose',
        text: '鼻子',
        subText: '（单选项，如无特别要求，可不选）',
        options: []
    },
    {
        key: 'face-mouth',
        text: '嘴巴',
        subText: '（单选项，如无特别要求，可不选）',
        options: []
    },
    {
        key: 'face-skin',
        text: '肤色',
        subText: '（单选项，如无特别要求，可不选）',
        options: [
            {
                key: 'face-skin@1',
                cn: '苍白肤色',
                en: "white"
            }
        ]
    },
    {
        group: 'people',
        key: 'role',
        text: '角色',
        subText: '（单选项，角色固定时，建议选择，默认权重1.1）',
        options: [
            {
                key: 'people-role@1',
                cn: '女青年',
                en: 'women'
            },
            {
                key: 'people-role@2',
                cn: '男青年',
                en: 'man'
            }
        ]
    },
    {
        group: 'people',
        key: 'body',
        text: '体型',
        subText: '（单选项，如无特别要求，可不选）',
        options: [
            {
                key: 'people-body@1',
                label: '偏瘦'
            },
            {
                key: 'people-body@2',
                label: '健壮'
            }
        ]
    },
    {
        key: 'hair-color',
        text: '发色',
        subText: '（单选项，如无特别要求，可不选）',
        options: [
            {
                key: 'hair-color@1',
                cn: '黑色',
                en: 'black'
            },
            {
                key: 'hair-color@2',
                cn: '棕色',
                en: 'bron'
            }
        ]
    },
    {
        key: 'hair-style',
        text: '常用发型',
        subText: '（单选项，如无特别要求，可不选）',
        options: [
            {
                key: 'hair-style@1',
                cn: '短发',
                en: 'short'
            },
            {
                key: 'hair-style@2',
                cn: '长发',
                en: 'long'
            }
        ]
    },
    {
        group: 'custom',
        key: 'custom',
        text: '用户自定义标签',
        subText: '用户自定义标签',
        options: [

        ]
    }
]



const tabs: TabsProps["items"] = [
    {
        key: "common",
        label: "常用",
    },
    {
        key: "people",
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
        key: "sight",
        label: "视角",
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



const TagModal: React.FC<TagModalProps> = ({ isOpen, onClose }) => {
    const [cur, setCur] = useState("hair");
    const [checkedTags, setCheckedTags] = useState<any[]>([]);
    const [renderType, setRenderType] = useState<TagDisplayType>('text')


    const handleCheckTag = (check: boolean, tag: any) => {
        let tags = [...checkedTags]
        if (check) {

            let identify = tag.key.split("@")
            let identityPrefix = identify[0]
            
            //互斥
            if (!identityPrefix.startsWith("custom")){
                tags = tags.filter((item: any) => !item.key.startsWith(identityPrefix))
            }
            tags.push({ ...tag })

            setCheckedTags(tags)
        } else {
            setCheckedTags(tags.filter((item: any) => item.key !== tag.key))
        }
    }






    const renderOptionalTags = (tabKey: string) => {

        console.info('renderOptional', tabKey)
        const groups = mockdata.filter(item => item.key.startsWith(tabKey))

        //自定义
        if (tabKey === "custom") {
            return <div className="flexR" style={{ alignItems: "stretch" }}>
                <div className="left">
                    <CustomTags renderType={renderType} handleCheckTag={handleCheckTag} hasTags={checkedTags} tags={groups[0]} key={tabKey} />
                </div>
            </div>
        }

        //系统可选
        return (
            <div className="flexR" style={{ alignItems: "stretch" }}>
                <div className="left">
                    {groups.map((tags: any) => {
                        return <OptionalTags renderType={renderType} handleCheckTag={handleCheckTag} hasTags={checkedTags} tags={tags} key={tags.key} />
                    })}
                </div>
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
                    <CheckedTags renderType={'text'} tags={checkedTags} hasTags={[]} handleCheckTag={handleCheckTag} />
                </div>
            </div>
        </Modal>
    )
}



export default TagModal

