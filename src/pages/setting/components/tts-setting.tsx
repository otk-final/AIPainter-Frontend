import React, { forwardRef, useImperativeHandle } from 'react'
import { Input } from "antd"
import { useState } from "react"
import { TTSConfiguration, useTTSRepository } from '@/repository/tts';


export interface TTSSettingProps {
    name: string
}

export interface TTSSettingRef {
    getConfiguration(): TTSConfiguration
}


const TTSSetting = forwardRef<TTSSettingRef, TTSSettingProps>((props, ref) => {

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
                        <Input size="large" placeholder="appId" value={stateConfiguration.appId} onChange={(e) => setConfiguration({ ...stateConfiguration, appId: e.target.value })} className='input-s ' style={{ width: '900px' }} />
                    </div>
                    <div className="form-item flexC">
                        <div className="label">AppKey</div>
                        <Input size="large" placeholder="appKey" value={stateConfiguration.authorization} onChange={(e) => setConfiguration({ ...stateConfiguration, authorization: e.target.value })} className='input-s ' style={{ width: '900px' }} />
                    </div>
                </div>
            </div>
        </div>
    )
})

export default TTSSetting;