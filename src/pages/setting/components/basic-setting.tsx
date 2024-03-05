import React, { forwardRef, useImperativeHandle } from 'react'
import assets from "@/assets";
import { MinusOutlined, PlusOutlined } from "@ant-design/icons"
import { Button, Input, InputNumber, Select } from "antd"
import { useState } from "react"
import TTSVoiceSelect from '@/components/voice-select';
import { BaisicSettingConfiguration, useBaisicSettingRepository } from '@/repository/setting';
import { dialog, path } from '@tauri-apps/api';


const fontSizeDatas = [
    {
        key: 1,
        label: "小"
    },
    {
        key: 2,
        label: "中"
    },
    {
        key: 3,
        label: "大"
    },
    {
        key: 4,
        label: "特大"
    },
]

const fontColorDatas = [
    {
        key: 1,
        color: "fff"
    },
    {
        key: 2,
        color: "000"
    },
    {
        key: 3,
        color: "fd3"
    },
    {
        key: 4,
        color: "f38578"
    },
    {
        key: 5,
        color: "eb3a41"
    },
    {
        key: 6,
        color: "bedbf3"
    },
    {
        key: 7,
        color: "5acae1"
    },
    {
        key: 8,
        color: "0034f5"
    },
    {
        key: 9,
        color: "4b4b4f"
    },
    {
        key: 10,
        color: "76e966"
    }
]

const fontFamilyDatas = [
    {
        key: 1,
        url: assets.fontfamily1
    },
    {
        key: 2,
        url: assets.fontfamily2
    },
    {
        key: 3,
        url: assets.fontfamily3
    },
    {
        key: 4,
        url: assets.fontfamily4
    },
    {
        key: 5,
        url: assets.fontfamily5
    },
    {
        key: 6,
        url: assets.fontfamily6
    },
    {
        key: 7,
        url: assets.fontfamily7
    },
    {
        key: 8,
        url: assets.fontfamily8
    },
    {
        key: 9,
        url: assets.fontfamily9
    },
    {
        key: 10,
        url: assets.fontfamily10
    }
]


const BasicInputNumber: React.FC<{ label: string, max?: number, min?: number, value: number, onChange: (value: number) => void }> = ({ label, max = 100, min = 0, value, onChange }) => {
    const handleAdd = () => {
        if (value === max) {
            return;
        }
        onChange(value + 1)
    }

    const handleMinus = () => {
        if (value === min) {
            return;
        }
        onChange(value - 1)
    }

    return (
        <div className="form-item flexC">
            <div className="label">{label}</div>
            <InputNumber className={"inputnumber-auto has-addon"} size="large"
                controls={false}
                defaultValue={value}
                value={value}
                max={max}
                min={min}
                addonBefore={<Button type="text" className="addon-btn" onClick={(handleAdd)}><PlusOutlined /></Button>}
                addonAfter={<Button type="text" className="addon-btn" onClick={handleMinus}><MinusOutlined /></Button>}
            />
        </div>
    )
}

export interface BasicSettingProps {
    name: string
}

export interface BasicSettingRef {
    getConfiguration(): BaisicSettingConfiguration
}


const BasicSetting = forwardRef<BasicSettingRef, BasicSettingProps>((props, ref) => {

    //init
    const settingRepo = useBaisicSettingRepository(state => state)
    const [stateConfiguration, setConfiguration] = useState<BaisicSettingConfiguration>({ ...settingRepo })

    useImperativeHandle(ref, () => ({
        getConfiguration() { return stateConfiguration }
    }))


    const handleChangePosition = async () => {
        //选择文件
        let selected = await dialog.open({
            title: "选择剪映草稿存放目录",
            directory:true,
            defaultPath: await path.desktopDir(),
        })
        if (!selected) {
            return
        }
        setConfiguration({ ...stateConfiguration ,draft_dir:selected as string})
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
                <div className="title">配音设置</div>
                <div className="form-wrap flexR">
                    <div className="form-item flexC">
                        <div className="label">{"音色"}</div>
                        <TTSVoiceSelect option={stateConfiguration.audio.option} onChange={(v) => { setConfiguration({ ...stateConfiguration, audio: { ...stateConfiguration.audio, option: v } }) }} />
                    </div>
                    <BasicInputNumber label='音量调节' value={stateConfiguration.audio.volume} onChange={(v) => { setConfiguration({ ...stateConfiguration, audio: { ...stateConfiguration.audio, volume: v } }) }}/>
                    <BasicInputNumber label='语速调节' value={stateConfiguration.audio.speed} onChange={(v) => { setConfiguration({ ...stateConfiguration, audio: { ...stateConfiguration.audio, speed: v } }) }} />
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
                            onChange={(v) => { setConfiguration({...stateConfiguration,video:{...stateConfiguration.video, effect:v}})}}
                            options={[
                                { value: 'random', label: '随机' },
                                { value: 'up', label: '向上移动' },
                                { value: 'down', label: '向下移动' },
                                { value: 'left', label: '向左移动' },
                                { value: 'right', label: '向右移动' },
                            ]}
                        />
                    </div>
                    <BasicInputNumber label='视频帧数' value={stateConfiguration.video.frame} onChange={(v) => { setConfiguration({ ...stateConfiguration, video: { ...stateConfiguration.video, frame: v } }) }} />
                    <div className="form-item flexC">
                    </div>
                </div>
            </div>

            <div className="section">
                <div className="title">字幕设置</div>
                <div className="form-wrap">
                    <div className="form-item">
                        <div className="label">字体大小</div>
                        <div className="flexR">
                            {fontSizeDatas.map((i, index) => {
                                return <div
                                    className={`fontsize ${stateConfiguration.srt.size === i.key ? "cur" : ""}`}
                                    key={index}
                                    style={{ fontSize: `${16 + (index * 3)}px` }}
                                    onClick={() => setConfiguration({ ...stateConfiguration, srt: { ...stateConfiguration.srt, size: i.key }}) }
                                >{i.label}</div>
                            })}
                        </div>
                    </div>
                </div>

                <div className="form-wrap flexR" style={{ marginTop: '30px' }}>
                    <div className="form-item">
                        <div className="label">字体颜色</div>
                        <div className="fontcf-wrap flexR">
                            {fontColorDatas.map((i) => {
                                return <div className={`fontcf ${stateConfiguration.srt.color === i.key ? "cur" : ""}`}
                                    key={i.key} style={{ background: `#${i.color}` }}
                                    onClick={() => setConfiguration({ ...stateConfiguration, srt: { ...stateConfiguration.srt, color: i.key } })}
                                ></div>
                            })}
                        </div>
                    </div>
                    <div className="form-item">
                        <div className="label">字体</div>
                        <div className="fontcf-wrap flexR">
                            {fontFamilyDatas.map((i) => {
                                return <img src={i.url}
                                    className={`fontcf ${stateConfiguration.srt.font === i.key ? "cur" : ""}`}
                                    key={i.key}
                                    onClick={() => setConfiguration({ ...stateConfiguration, srt: { ...stateConfiguration.srt, font: i.key } })}
                                />
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
})



export default BasicSetting;