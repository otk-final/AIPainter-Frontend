import assets from "@/assets";
import { CloseOutlined } from "@ant-design/icons";
import { Button, Input, Modal, Tabs, TabsProps } from "antd"
import { useMemo, useState } from "react";
import RoleTagsImgItem from "./role-tags-img-item";
import RoleTagsTextItem from "./role-tags-text-item";

interface TagsModuleProps {
    isOpen: boolean,
    onClose: ()=>void
}

const tabs:TabsProps["items"] = [
    {
        key: "common",
        label: "常用",
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
        key: "fivesenses",
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

const RoleTagsModule:React.FC<TagsModuleProps> = ({isOpen, onClose})=> {
    const [cur, setCur] = useState("common");
    const [language, setLanguage] = useState("chinese");
    const [hasTags, setHasTags] = useState([]);
    const [input, setInput] = useState("");
    const [type, setType] = useState('text')

    const handleSumbit = ()=>{
    }

    const handleChoose = (v)=>{
        if(type !== v) {
            setType(v);
            setHasTags([]);
        }
    }

    const handleClickTag = (i)=>{
        setHasTags(res=>{
            let key = i.key.split('-')[0];
           const index =  res.findIndex((j)=> {
                return j.key.split('-')[0] === key
            })
            let newRes = [...res];
            if(index > -1) {
                newRes.splice(index, 1);
            }
            return [...newRes, i]
        })
    }

    const handleDel = (i)=>{
        setHasTags(res=>{
           const index =  res.findIndex((j)=> {
                return j.key === i.key
            })
            let newRes = [...res];
            newRes.splice(index, 1);
            return [...newRes]
        })
    }

    const onChange = (v)=>{
        setCur(v)
    }

    const handleCustomAdd = ()=>{
        setHasTags(res=> {
            let len = res.filter(j => j.key.split('-')[0] === "custom");
            return [...res, {
                key: len.length ?  `custom-${Number(len[len.length -1].key.split('-')[1])+1}`: 'custom-0',
                label: input
            }]
        })
        setInput("")
    }
    const hasTagsCustom = useMemo(()=>{
        return hasTags.filter(j => j.key.split('-')[0] === "custom")
    }, [hasTags])

    const renderCustom = ()=>{
        return (
            <div style={{width: '100%'}}>
                <div className="title-tags">自定义提示词</div>
                <div className="has-tags custom-tas-tags">
                    <div className="content flexR">
                        {hasTagsCustom.map((i, index)=>{
                            return (
                                <div className="has-tag-wrap flexR" key={i?.key || index}>
                                    <CloseOutlined className="icon" onClick={()=>handleDel(i)}/>
                                    {i.label}</div>
                            )
                        })}
                    </div>
                </div>
                <div className="flexR">
                    <Input size="large" value={input} onChange={(v)=>setInput(v.target.value)} style={{height: "40px"}}/>
                    <Button type="primary" className="bottom-item btn-primary-auto"  style={{height: "40px", marginLeft: '20px'}} onClick={handleCustomAdd}>添加</Button>
                </div>
            </div>
        )
    }

    const renderContent = ()=>{
        return (
            <div className="right flexC">
                <div className="has-tags">
                    <div className="content flexR">
                        {hasTags.map((i, index)=>{
                            return (
                                <div className="has-tag-wrap flexR" key={i?.key || index}>
                                    <CloseOutlined className="icon" onClick={()=>handleDel(i)}/>
                                    {i.label}</div>
                            )
                        })}
                    </div>
                </div>
                <div style={{width: '100%'}}>
                    <div className="bottom flexRB">
                        <div className="choose-wrap flexR">
                            <div className={`choose-item ${language ==='chinese' ? "cur" : ''}`} onClick={()=> setLanguage('chinese')}>中</div>
                            <div className={`choose-item ${language ==='english' ? "cur" : ''}`} onClick={()=> setLanguage('english')}>En</div>
                        </div>
                        <div className="clean" onClick={()=> setHasTags([])}>清空</div>
                    </div>
                    <Button type="primary" block className="bottom-item btn-primary-auto" onClick={handleSumbit}>保存</Button>
                </div>
            </div>
        )
    }

    const renderText = ()=>{
        return (
            <div className="flexR" style={{alignItems: "stretch"}}>
                <div className="left">
                    {mockdata.map(i=><RoleTagsTextItem onCB={handleClickTag} hasTags={hasTags} data={i} key={i.key}/>)}
                </div>
                {renderContent()}
            </div>
        )
    }

    const renderImg = ()=>{
        return (
            <div>
                {mockdata.map(i=>
                <RoleTagsImgItem onCB={handleClickTag} hasTags={hasTags} data={i} key={i.key}/>)}
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
                    <div className="choose-wrap flexR" style={{marginBottom: '20px'}}>
                        <div className={`choose-item ${type ==='text' ? "cur" : ''}`} onClick={()=> handleChoose('text')}>文字</div>
                        <div className={`choose-item flexR ${type ==='img' ? "cur" : ''}`} onClick={()=> handleChoose('img')}>
                            图片
                            <img src={assets.vip} className="vip-img" /> </div>
                    </div>
                    <div className="flexRB">
                        <Tabs defaultActiveKey="common" items={tabs} onChange={onChange} />
                        {cur === 'custom' ? <Button type="primary" className="bottom-item btn-primary-auto "  style={{height: "40px"}} onClick={handleSumbit}>保存</Button>: null }
                    </div>
                    {
                        cur === 'custom' ? renderCustom() : type=== 'text'? renderText(): renderImg()
                    }
                </div>
        </Modal>
    )
}

export default RoleTagsModule

const mockdata = [
    {
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
        key: 'complexion',
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
        key: 'haircolor',
        text: '常用发色',
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
        key: 'hairstyle',
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
]
