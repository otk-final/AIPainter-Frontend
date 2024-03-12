import React, { forwardRef, useImperativeHandle } from 'react'
import { Input, Select } from "antd"
import { useState } from "react"
import { GPTConfiguration, useGPTRepository } from '@/repository/gpt';


export interface GPTSettingProps {
    name: string
}

export interface GPTSettingRef {
    getConfiguration(): GPTConfiguration
}

const mode_options = ['gpt-4-1106-preview'
    , 'gpt-4-vision-preview'
    , 'gpt-4'
    , 'gpt-4-0314'
    , 'gpt-4-0613'
    , 'gpt-4-32k'
    , 'gpt-4-32k-0314'
    , 'gpt-4-32k-0613'
    , 'gpt-3.5-turbo'
    , 'gpt-3.5-turbo-16k'
    , 'gpt-3.5-turbo-0301'
    , 'gpt-3.5-turbo-0613'
    , 'gpt-3.5-turbo-1106'
    , 'gpt-3.5-turbo-16k-0613'].map((e: string) => {
        return { label: e, value: e };
    });


const GPTSettingTab = forwardRef<GPTSettingRef, GPTSettingProps>((props, ref) => {

    //init
    const settingRepo = useGPTRepository(state => state)
    const [stateConfiguration, setConfiguration] = useState<GPTConfiguration>({ ...settingRepo })

    useImperativeHandle(ref, () => ({
        getConfiguration() { return stateConfiguration }
    }))


    return (
        <div className="videogeneration-wrap scrollbar">
            <div className='setting-section'>
                <div className='setting-title'>GPT地址</div>
                <div className='basic-subText'>GPT请求地址 <span></span> </div>
                <Input size="large" placeholder="剪映草稿目录" value={stateConfiguration.host} onChange={(e) => setConfiguration({ ...stateConfiguration, host: e.target.value })} className='input-s ' style={{ width: '900px' }} />
            </div>

            <div className="setting-section">
                <div className="setting-title">ApiKey</div>
                <Input size="large" placeholder="ApiKey" value={stateConfiguration.apiKey} onChange={(e) => setConfiguration({ ...stateConfiguration, apiKey: e.target.value })}  className='input-s ' style={{ width: '900px' }} />
            </div>

            <div className="section">
                <div className="title">默认参数设置</div>
                <div className="form-wrap flexR">
                    <div className="form-item flexC">
                        <div className="label">模型</div>
                        <Select
                            className={`select-auto`}
                            value={stateConfiguration.mode}
                            onChange={(v) => { setConfiguration({ ...stateConfiguration, mode: v }) }}
                            options={mode_options}
                        />
                    </div>
                    <div className="form-item flexC">
                        <div className="label">AssistantId</div>
                        <Input size="large" placeholder="ApiKey" value={stateConfiguration.assistantId} onChange={(e) => setConfiguration({ ...stateConfiguration, assistantId: e.target.value })} className='input-s ' />
                    </div>
                </div>
            </div>
        </div>
    )
})

export default GPTSettingTab;