import React, { forwardRef, useImperativeHandle } from 'react'
import { Button, Input, Select } from "antd"
import { useState } from "react"
import { JYDraftConfiguration, useJYDraftRepository } from '@/repository/draft';
import { dialog, path } from '@tauri-apps/api';
import AddonNumberInput from '@/components/addon-input';


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


export interface ExportSettingProps {
    name: string
}

export interface ExportSettingRef {
    getConfiguration(): JYDraftConfiguration
}


const ExportSettingTab = forwardRef<ExportSettingRef, ExportSettingProps>((props, ref) => {

    //init
    const settingRepo = useJYDraftRepository(state => state)
    const [stateConfiguration, setConfiguration] = useState<JYDraftConfiguration>({ ...settingRepo })

    useImperativeHandle(ref, () => ({
        getConfiguration() { return stateConfiguration }
    }))


    const handleChangePosition = async () => {
        //选择文件
        let selected = await dialog.open({
            title: "选择剪映草稿存放目录",
            directory: true,
            defaultPath: await path.desktopDir(),
        })
        if (!selected) {
            return
        }
        setConfiguration({ ...stateConfiguration, draft_dir: selected as string })
    }

    return (
        <div className="videogeneration-wrap scrollbar">
            <div className='setting-section'>
                <div className='setting-title'>剪映草稿存放目录</div>
                <div className='basic-subText'>剪映草稿存放目录文件夹存储位置 <span>更改项目素材文件夹的存储位置， 将影响己创建的小说项目的图片、视频等素材的使用，请详慎操作</span> </div>
                <div className="flexR">
                    <Input size="large" disabled placeholder="剪映草稿目录" value={stateConfiguration.draft_dir} className='input-s ' style={{ width: '900px' }} />
                    <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleChangePosition}>更改存储位蛋</Button>
                </div>
            </div>



            <div className="section">
                <div className="title">视频设置</div>
                <div className="form-wrap flexR">
                    <div className="form-item flexC">
                        <div className="label">播放动效</div>
                        <Select
                            className={`select-auto`}
                            value={stateConfiguration.video.effect}
                            style={{ width: '400px' }}
                            onChange={(v) => { setConfiguration({ ...stateConfiguration, video: { ...stateConfiguration.video, effect: v } }) }}
                            options={[
                                { value: 'random', label: '随机' },
                                { value: 'up', label: '向上移动' },
                                { value: 'down', label: '向下移动' },
                                { value: 'left', label: '向左移动' },
                                { value: 'right', label: '向右移动' },
                            ]}
                        />
                    </div>
                    <AddonNumberInput label='视频帧数' value={stateConfiguration.video.fps}
                        min={5} max={30} step={1}
                        onChange={(v) => { setConfiguration({ ...stateConfiguration, video: { ...stateConfiguration.video, fps: v } }) }} />
                    <div className="form-item flexC">
                    </div>
                </div>
            </div>

            <div className="section">
                <div className="title">字幕设置</div>
                <div className="form-wrap">
                    <div className="form-item">
                        <div className="label">文字大小</div>
                        <div className="flexR">
                            {fontSizeDatas.map((i, index) => {
                                return <div
                                    className={`fontsize ${stateConfiguration.srt.size === i.key ? "cur" : ""}`}
                                    key={index}
                                    style={{ fontSize: `${16 + (index * 3)}px` }}
                                    onClick={() => setConfiguration({ ...stateConfiguration, srt: { ...stateConfiguration.srt, size: i.key } })}
                                >{i.label}</div>
                            })}
                        </div>
                    </div>
                </div>

                <div className="form-wrap flexR" style={{ marginTop: '30px' }}>
                    <div className="form-item">
                        <div className="label">文字颜色</div>
                        <div className="fontcf-wrap flexR">
                            {fontColorDatas.map((i) => {
                                return <div className={`fontcf ${stateConfiguration.srt.color === i.color ? "cur" : ""}`}
                                    key={i.color} style={{ background: `${i.color}` }}
                                    onClick={() => setConfiguration({ ...stateConfiguration, srt: { ...stateConfiguration.srt, color: i.color, color_rgb: i.rgb } })}
                                ></div>
                            })}
                        </div>
                    </div>
                </div>

                <div className="form-wrap flexR" style={{ marginTop: '30px' }}>
                    <div className="form-item">
                        <div className="label">边框颜色</div>
                        <div className="fontcf-wrap flexR">
                            {fontColorDatas.map((i) => {
                                return <div className={`fontcf ${stateConfiguration.srt.border_color === i.color ? "cur" : ""}`}
                                    key={i.color} style={{ background: `${i.color}` }}
                                    onClick={() => setConfiguration({ ...stateConfiguration, srt: { ...stateConfiguration.srt, border_color: i.color, border_color_rgb: i.rgb } })}
                                ></div>
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
})



export default ExportSettingTab;