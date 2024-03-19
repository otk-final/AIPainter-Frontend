import { CloseOutlined } from "@ant-design/icons";
import { Button, Input, message, Modal, Select, Tabs, TabsProps } from "antd";
import React, { createRef, forwardRef, useEffect, useImperativeHandle,useState } from 'react'
import { JYDraftConfiguration, useJYDraftRepository } from '@/repository/draft';
import AddonNumberInput from '@/components/addon-input';
import { path } from '@tauri-apps/api';
import { open } from '@tauri-apps/plugin-dialog';
import './index.less'


const fontSizeDatas = [
    {
        key: 5,
        label: "小"
    },
    {
        key: 10,
        label: "中"
    },
    {
        key: 15,
        label: "大"
    },
    {
        key: 20,
        label: "特大"
    },
]

const fontColorDatas = [
    {
        color: "#ffffff",
        rgb: [1.0, 1.0, 1.0],
    },
    {
        color: "#000000",
        rgb: [0, 0, 0],
    },
    {
        color: "#ffde00",
        rgb: [1, 0.870588, 0],
    },
    {
        color: "#f38578",
        rgb: [0.952941, 0.521569, 0.470588],
    },
    {
        color: "#eb3a41",
        rgb: [0.921569, 0.227451, 0.254902]
    },
    {
        color: "#bedbf3",
        rgb: [0.745098, 0.858824, 0.952941]
    },
    {
        color: "#5acae1",
        rgb: [0.352941, 0.792157, 0.882353]
    },
    {
        color: "#0034f5",
        rgb: [0, 0.203922, 0.960784]
    },
    {
        color: "#4b4b4f",
        rgb: [0.294118, 0.294118, 0.309804]
    },
    {
        color: "#76e966",
        rgb: [0.462745, 0.913725, 0.4]
    }
]

type setTabType = "jydraft" | "keyframe" | "fontset"

export const setTabItems: TabsProps['items'] = [
    {
      key: 'jydraft',
      label: '剪映草稿',
    },
    {
      key: 'keyframe',
      label: '关键帧',
    },
    {
        key: 'fontset',
        label: '字幕设置',
      }
];

export interface SetModalProps {
    // name: string,
    isOpen: boolean,
    onClose: ()=>void,
}

const SetModal:React.FC<SetModalProps> = ({isOpen, onClose})=>{
    const [cur, setCur] = useState<setTabType>("jydraft");
    const onChange = (key: string) => {
      setCur(key as setTabType);
    };

    //init
    const draftRepo = useJYDraftRepository(state => state)
    const [stateConfiguration, setConfiguration] = useState<JYDraftConfiguration>({ ...draftRepo })



    useEffect(() => {
      draftRepo.load("env")
    }, [])
  
    const handleSave = async () => {
      await draftRepo.reload(stateConfiguration).then(() => { message.success("保存成功") }).finally(onClose)
    }
  

    const handleChangePosition = async () => {
        //选择文件
        let selected = await open({
            title: "选择剪映草稿存放目录",
            directory: true,
            defaultPath: stateConfiguration.draft_dir || await path.desktopDir()
        })
        if (!selected) {
            return
        }
        setConfiguration({ ...stateConfiguration, draft_dir: selected as string })
    }

   const renderJyDraft = ()=>{
    return (
        <div className="draft">
            <div className='title'>目录地址</div>
            <div className='subText'>剪映草稿存放目录文件夹存储位置 <span>更改项目素材文件夹的存储位置， 将影响己创建的小说项目的图片、视频等素材的使用，请详慎操作</span> </div>
            <div className="flexRB" >
                <Input size="large" disabled placeholder="剪映草稿目录" value={stateConfiguration.draft_dir} className='input-s'  />
                <Button type="default" className="btn-default-auto btn-default-88" onClick={handleChangePosition}>更改存储位蛋</Button>
            </div>
        </div>
    )
   } 
   const renderKeyframe = ()=>{
    return (
        <div className="keyframe">
            <div className="title">播放动效</div>
            <Select
                className={`select-auto`}
                value={stateConfiguration.video.effect}
                onChange={(v) => { setConfiguration({ ...stateConfiguration, video: { ...stateConfiguration.video, effect: v } }) }}
                options={[
                    { value: 'random', label: '随机' },
                    { value: 'up', label: '向上移动' },
                    { value: 'down', label: '向下移动' },
                    { value: 'left', label: '向左移动' },
                    { value: 'right', label: '向右移动' },
                ]}
            />
            <AddonNumberInput label='视频帧数' value={stateConfiguration.video.fps}
                min={5} max={30} step={1}
                onChange={(v) => { setConfiguration({ ...stateConfiguration, video: { ...stateConfiguration.video, fps: v } }) }} />
        </div>
    )
   } 
   const renderFontSet = ()=>{
    return (
        <div>
            <div className="title">文字大小</div>
            <div className="fontset-wrap flexR">
                {fontSizeDatas.map((i, index) => {
                    return <div
                        className={`fontsize ${stateConfiguration.srt.size === i.key ? "cur" : ""}`}
                        key={index}
                        style={{ fontSize: `${10 + (index * 2)}px` }}
                        onClick={() => setConfiguration({ ...stateConfiguration, srt: { ...stateConfiguration.srt, size: i.key } })}
                    >{i.label}</div>
                })}
            </div>
            <div className="title">文字颜色</div>
            <div className="fontset-wrap flexR">
                {fontColorDatas.map((i) => {
                    return <div className={`fontcf ${stateConfiguration.srt.color === i.color ? "cur" : ""}`}
                        key={i.color} style={{ background: `${i.color}` }}
                        onClick={() => setConfiguration({ ...stateConfiguration, srt: { ...stateConfiguration.srt, color: i.color, color_rgb: i.rgb } })}
                    ></div>
                })}
            </div>
            <div className="title">边框颜色</div>
            <div className="fontset-wrap flexR">
                {fontColorDatas.map((i) => {
                    return <div className={`fontcf ${stateConfiguration.srt.border_color === i.color ? "cur" : ""}`}
                        key={i.color} style={{ background: `${i.color}` }}
                        onClick={() => setConfiguration({ ...stateConfiguration, srt: { ...stateConfiguration.srt, border_color: i.color, border_color_rgb: i.rgb } })}
                    ></div>
                })}
            </div>
        </div>
    )
   } 
    return (
        <Modal
            open={isOpen} 
            onCancel={onClose} 
            footer={null}
            width={400}
            closeIcon={false}
            className="set-modal-wrap">
               <div className="header flexRB">
                    <div className="text">设置</div>
                    <CloseOutlined onClick={onClose}/>
               </div>
               <Tabs className="tabs" defaultActiveKey={cur} items={setTabItems} onChange={onChange} />
               {cur === 'jydraft' ? renderJyDraft() : null}
               {cur === 'keyframe' ? renderKeyframe() : null}
               {cur === 'fontset' ? renderFontSet() : null}
               <div className="line"/>
               <div className="foot flexR">
                    <Button type="default" className="btn-default-auto btn-default-88" onClick={onClose}>取消</Button>
                    <Button type="primary" className="btn-primary-auto btn-primary-88" onClick={handleSave}>保存设置</Button>
               </div>
        </Modal>
    )
}

export default SetModal;