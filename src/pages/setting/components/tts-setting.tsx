import React, { forwardRef, useImperativeHandle } from 'react'
import { Input } from "antd"
import { useState } from "react"
import { TTSConfiguration, useTTSRepository } from '@/repository/tts';
import TTSVoiceSelect from '@/components/voice-select';
import AddonNumberInput from '@/components/addon-input';


export interface TTSSettingProps {
    name: string
}

export interface TTSSettingRef {
    getConfiguration(): TTSConfiguration
}


const TTSSettingTab = forwardRef<TTSSettingRef, TTSSettingProps>((props, ref) => {

    //init
    const settingRepo = useTTSRepository(state => state)
    const [stateConfiguration, setConfiguration] = useState<TTSConfiguration>({ ...settingRepo })

    useImperativeHandle(ref, () => ({
        getConfiguration() { return stateConfiguration }
    }))


    return (
        <div className="videogeneration-wrap scrollbar">
            <div className='setting-section'>
                <div className='setting-title'>音频生成地址</div>
                <div className='basic-subText'>火山引擎请求地址 <span>字幕解析，音频生成等相关功能使用，请详慎操作</span> </div>
                <div className="flexR">
                    <Input size="large" placeholder="火山请求地址" value={stateConfiguration.host} onChange={(e) => setConfiguration({ ...stateConfiguration, host: e.target.value })} className='input-s ' style={{ width: '900px' }} />
                </div>
            </div>

            <div className="section">
                <div className="title">接口参数设置</div>
                <div className="form-wrap flexR">
                    <div className="form-item flexC">
                        <div className="label">AppId</div>
                        <Input size="large" placeholder="appId" value={stateConfiguration.appId} onChange={(e) => setConfiguration({ ...stateConfiguration, appId: e.target.value })} className='input-s ' />
                    </div>
                    <div className="form-item flexC">
                        <div className="label">AppKey</div>
                        <Input size="large" placeholder="appKey" value={stateConfiguration.authorization} onChange={(e) => setConfiguration({ ...stateConfiguration, authorization: e.target.value })} className='input-s ' />
                    </div>
                </div>
            </div>

            <div className="section">
                <div className="title">配音设置</div>
                <div className="form-wrap flexR">
                    <div className="form-item flexC">
                        <div className="label">{"音色"}</div>
                        <TTSVoiceSelect option={stateConfiguration.audio_option} onChange={(v) => { setConfiguration({ ...stateConfiguration, audio_option: { ...v } }) }} />
                    </div>
                    <AddonNumberInput label='音量调节' value={stateConfiguration.audio_volume} onChange={(v) => { setConfiguration({ ...stateConfiguration, audio_volume: v }) }} />
                    <AddonNumberInput label='语速调节' value={stateConfiguration.audio_speed} onChange={(v) => { setConfiguration({ ...stateConfiguration, audio_speed: v }) }} />
                </div>
            </div>

        </div>
    )
})

export default TTSSettingTab;