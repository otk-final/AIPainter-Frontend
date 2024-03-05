import React, { forwardRef, useImperativeHandle } from 'react'
import { Input } from "antd"
import { useState } from "react"
import { TranslateConfiguration, useTranslateRepository } from '@/repository/translate';


export interface TranslateSettingProps {
    name: string
}

export interface TranslateSettingRef {
    getConfiguration(): TranslateConfiguration
}


const TranslateSettingTab = forwardRef<TranslateSettingRef, TranslateSettingProps>((props, ref) => {

    //init
    const settingRepo = useTranslateRepository(state => state)
    const [stateConfiguration, setConfiguration] = useState<TranslateConfiguration>({ ...settingRepo })

    useImperativeHandle(ref, () => ({
        getConfiguration() { return stateConfiguration }
    }))


    return (
        <div className="videogeneration-wrap scrollbar">
            <div className='setting-section'>
                <div className='setting-title'>百度翻译生成地址</div>
                <div className='basic-subText'>百度翻译请求地址 <span>关键词翻译，等相关功能使用，请详慎操作</span> </div>
                <div className="flexR">
                    <Input size="large" placeholder="百度翻译请求地址" value={stateConfiguration.host} onChange={(e) => setConfiguration({ ...stateConfiguration, host: e.target.value })} className='input-s ' style={{ width: '900px' }} />
                </div>
            </div>

            <div className="section">
                <div className="title">接口参数设置</div>
                <div className="form-wrap flexR">
                    <div className="form-item flexC">
                        <div className="label">ClientId</div>
                        <Input size="large" placeholder="ClientId" value={stateConfiguration.client_id} onChange={(e) => setConfiguration({ ...stateConfiguration, client_id: e.target.value })} className='input-s '  />
                    </div>
                    <div className="form-item flexC">
                        <div className="label">ClientSecret</div>
                        <Input size="large" placeholder="ClientSecret" value={stateConfiguration.client_secret} onChange={(e) => setConfiguration({ ...stateConfiguration, client_secret: e.target.value })} className='input-s ' />
                    </div>
                </div>
            </div>
        </div>
    )
})

export default TranslateSettingTab;