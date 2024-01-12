import assets from "@/assets";
import { CloseOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Tabs, TabsProps } from "antd"
import { useEffect, useMemo, useState } from "react";
import { RoleTags, RoleCustomTags, TagDisplayType } from "./role-tags-item";

interface TagsModuleProps {
    isOpen: boolean,
    onClose: () => void
}

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

const RoleTagsModule: React.FC<TagsModuleProps> = ({ isOpen, onClose }) => {
    const [cur, setCur] = useState("common");
    const [language, setLanguage] = useState("chinese");
    const [checkedTags, setCheckedTags] = useState<any[]>([]);
    const [displayType, setDisplayType] = useState<TagDisplayType>('text')

    const handleSumbit = () => {

    }


    useEffect(() => {
        tabs.map(tab => {
            tab.children = renderOptionalTags(tab.key, displayType)
        })
    }, [displayType])



    const handleCheckTag = (check: boolean, tag: any) => {
        debugger
        if (check) {
            checkedTags.push(tag)
            setCheckedTags([...checkedTags])
        } else {
            const newCheckedTags = checkedTags.filter((item: any) => item.key !== tag.key)
            setCheckedTags(newCheckedTags)
        }
    }

    const renderContent = () => {
        return (
            <div className="right flexC">
                <div className="has-tags">
                    <div className="content flexR">
                        {checkedTags.map((i: any, index) => {
                            return (
                                <div className="has-tag-wrap flexR" key={i?.key || index}>
                                    <CloseOutlined className="icon" onClick={() => handleCheckTag(false, i)} />
                                    {i.label}</div>
                            )
                        })}
                    </div>
                </div>
                <div style={{ width: '100%' }}>
                    <div className="bottom flexRB">
                        <div className="choose-wrap flexR">
                            <div className={`choose-item ${language === 'cn' ? "cur" : ''}`} onClick={() => setLanguage('cn')}>中</div>
                            <div className={`choose-item ${language === 'en' ? "cur" : ''}`} onClick={() => setLanguage('en')}>En</div>
                        </div>
                        <div className="clean" onClick={() => setCheckedTags([])}>清空</div>
                    </div>
                    <Button type="primary" block className="bottom-item btn-primary-auto" onClick={handleSumbit}>保存</Button>
                </div>
            </div>
        )
    }



    const renderOptionalTags = (tabKey: string, displayType: TagDisplayType) => {
        const groups = mockdata.filter(item => item.group === tabKey)

        //自定义
        if (tabKey === "custom") {
            return <div className="flexR" style={{ alignItems: "stretch" }}>
                <div className="left">
                    <RoleCustomTags displayType={displayType} handleCheckTag={handleCheckTag} hasTags={checkedTags} tags={groups[0]} key={tabKey} />
                </div>
            </div>
        }

        //系统可选
        return (
            <div className="flexR" style={{ alignItems: "stretch" }}>
                <div className="left">
                    {groups.map((tags: any) => {
                        return <RoleTags displayType={displayType} handleCheckTag={handleCheckTag} hasTags={checkedTags} tags={tags} key={tags.key} />
                    })}
                </div>
            </div>
        )
    }

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
                    <div className={`choose-item ${displayType === 'text' ? "cur" : ''}`} onClick={() => setDisplayType('text')}>文字</div>
                    <div className={`choose-item flexR ${displayType === 'image' ? "cur" : ''}`} onClick={() => setDisplayType('image')}>
                        图片
                        <img src={assets.vip} className="vip-img" /> </div>
                </div>
                <div className="flexR" style={{ alignItems: "stretch" }}>
                    <div className="left">
                        <Tabs defaultActiveKey="people" items={tabs} onChange={setCur} activeKey={cur} />
                    </div>
                    {renderContent()}
                </div>

            </div>
        </Modal>
    )
}



export default RoleTagsModule

const mockdata = [
    {
        group: "clothes",
        key: 'clothes-common',
        text: '常用全套',
        subText: '（单选项，如无特别要求，可不选）',
        options: []
    },
    {
        group: "clothes",
        key: 'coat',
        text: '上身',
        subText: '（单选项，如无特别要求，可不选）',
        options: []
    },
    {
        group: "clothes",
        key: 'pants',
        text: '下身',
        subText: '（单选项，如无特别要求，可不选）',
        options: []
    },
    {
        group: "clothes",
        key: 'shoes',
        text: '鞋子',
        subText: '（单选项，如无特别要求，可不选）',
        options: []
    },
    {
        group: "clothes",
        key: 'hats',
        text: '帽子',
        subText: '（单选项，如无特别要求，可不选）',
        options: []
    },
    {
        group: "face",
        key: 'eye',
        text: '眼睛',
        subText: '（单选项，如无特别要求，可不选）',
        options: []
    },
    {
        group: "face",
        key: 'ear',
        text: '耳朵',
        subText: '（单选项，如无特别要求，可不选）',
        options: []
    },
    {
        group: "face",
        key: 'nose',
        text: '鼻子',
        subText: '（单选项，如无特别要求，可不选）',
        options: []
    },
    {
        group: "face",
        key: 'mouth',
        text: '嘴巴',
        subText: '（单选项，如无特别要求，可不选）',
        options: []
    },
    {
        group: "face",
        key: 'skin',
        text: '肤色',
        subText: '（单选项，如无特别要求，可不选）',
        options: [
            {
                key: 'complexion-1',
                label: '苍白肤色'
            },
            {
                key: 'complexion-2',
                label: '白嫩肤色'
            },
            {
                key: 'complexion-3',
                label: '古铜肤色'
            },
            {
                key: 'complexion-4',
                label: '南非肤色'
            },
        ]
    },
    {
        group: 'people',
        key: 'role',
        text: '角色',
        subText: '（单选项，角色固定时，建议选择，默认权重1.1）',
        options: [
            {
                key: 'role-1',
                label: '女青年'
            },
            {
                key: 'role-2',
                label: '男青年'
            },
            {
                key: 'role-3',
                label: '少女'
            },
            {
                key: 'role-4',
                label: '少年'
            },
            {
                key: 'role-5',
                label: '幼女'
            },
            {
                key: 'role-6',
                label: '幼童'
            },
            {
                key: 'role-7',
                label: '成熟女性'
            },
            {
                key: 'role-8',
                label: '成熟男性'
            },
            {
                key: 'role-9',
                label: '老奶奶'
            },
            {
                key: 'role-10',
                label: '老爷爷'
            },
            {
                key: 'role-11',
                label: '婴儿'
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
                key: 'body-1',
                label: '偏瘦'
            },
            {
                key: 'body-2',
                label: '健壮'
            },
            {
                key: 'body-3',
                label: '肥胖'
            },
            {
                key: 'body-4',
                label: '孕妇'
            },
        ]
    },
    {
        group: 'hair',
        key: 'color',
        text: '发色',
        subText: '（单选项，如无特别要求，可不选）',
        options: [
            {
                key: 'haircolor-1',
                label: '黑色'
            },
            {
                key: 'haircolor-2',
                label: '棕色'
            },
            {
                key: 'haircolor-3',
                label: '黄色'
            },
            {
                key: 'haircolor-4',
                label: '橙色'
            },
            {
                key: 'haircolor-5',
                label: '红色'
            },
            {
                key: 'haircolor-6',
                label: '粉色'
            },
            {
                key: 'haircolor-7',
                label: '紫色'
            },
            {
                key: 'haircolor-8',
                label: '蓝色'
            },
            {
                key: 'haircolor-9',
                label: '青色'
            },
            {
                key: 'haircolor-10',
                label: '绿色'
            },
            {
                key: 'haircolor-11',
                label: '白色'
            }
        ]
    },
    {
        group: 'hair',
        key: 'style',
        text: '常用发型',
        subText: '（单选项，如无特别要求，可不选）',
        options: [
            {
                key: 'hairstyle-1',
                label: '短发'
            },
            {
                key: 'hairstyle-2',
                label: '长发'
            },
            {
                key: 'hairstyle-3',
                label: '卷发'
            },
            {
                key: 'hairstyle-4',
                label: '秃头'
            },
            {
                key: 'hairstyle-5',
                label: '刺猬头'
            },
            {
                key: 'hairstyle-6',
                label: '朋克头'
            },
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



