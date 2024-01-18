import { Button, Input } from 'antd';
import React, { } from 'react'
import TextArea from 'antd/es/input/TextArea';
import { DeleteFilled, PlusOutlined, } from '@ant-design/icons';
import { usePersistComfyUIStorage } from '@/stores/comfyui';
import { dialog } from '@tauri-apps/api';



const PaintSetting: React.FC = () => {
    const { host, positivePrompt, negativePrompt, modeApis, reverseApi, setHost, setHandle, uploadModeApi, addModeApi, removeModeApi, uploadReverseApi } = usePersistComfyUIStorage(state => state)
    const handleUpdateMode = async (idx: number) => {
        let selected = await dialog.open({
            title: "选择Comfy Workflow Api 文件",
            multiple: false,
            filters: [{ name: "api文件", extensions: ["json"] }]
        })
        if (!selected) {
            return
        }
        await uploadModeApi(idx, selected as string)
    }

    const handleUploadReverse = async () => {
        let selected = await dialog.open({
            title: "选择Comfy Workflow Api 文件",
            multiple: false,
            filters: [{ name: "api文件", extensions: ["json"] }]
        })
        if (!selected) {
            return
        }
        await uploadReverseApi(selected as string)
    }


    return (
        <div style={{ height: "calc(100% - 78px)", overflow: 'scroll', paddingLeft: '30px', paddingRight: '30px' }}>
            <div className='setting-section'>
                <div className='setting-title'>ComfyUI 环境配置</div>

                <div className='flexR half-width'>
                    <div className='flexR'>
                        <div className='setting-label'>Http地址</div>
                    </div>
                </div>

                <div className='setting-form-label flexR half-width'>
                    <div className='setting-form flexR half-width'>
                        <Input size="large" placeholder="http://127.0.0.1:8188" className='input-s' value={host?.url} onChange={(e) => { setHost({ ...host!, url: e.target.value }) }} />
                    </div>
                </div>

                <div className='flexR half-width'>
                    <div className='flexR'>
                        <div className='setting-label'>Websocket地址</div>
                    </div>
                </div>

                <div className='setting-form-label flexR half-width'>
                    <div className='setting-form flexR half-width'>
                        <Input size="large" placeholder="ws://127.0.0.1:8188" className='input-s' value={host?.websocket} onChange={(e) => { setHost({ ...host!, websocket: e.target.value }) }} />
                    </div>
                </div>

            </div >

            <div className='setting-section'>
                <div className='setting-title'>ComfyUI Api配置</div>
                <div className='content flexR'>
                    <div className='setting-title'>模型
                        <Button type="primary" size={'small'} className="btn-primary-auto btn-primary-108" icon={<PlusOutlined />} onClick={addModeApi}>添加模型</Button>
                    </div>
                </div>

                {modeApis.map((item, idx) => {
                    return (<div className='setting-form flexR' key={idx}>
                        <Input size="large" placeholder="点击更换 workflow json 文件" className='input-s' value={item.path} readOnly onClick={() => handleUpdateMode(idx)} />
                        <Button type="primary" className="btn-primary-auto btn-primary-108" icon={<DeleteFilled />} disabled={modeApis.length === 1} onClick={() => removeModeApi(idx)}>删除模型</Button>
                    </div>)
                })}


                <div className='setting-title'></div>
                <div className='content flexR'>
                    <div className='setting-title'>反推关键词</div>
                </div>
                <div className='setting-form flexR'>
                    <Input size="large" placeholder="点击更换 workflow json 文件" className='input-s' value={reverseApi?.path} readOnly onClick={handleUploadReverse} />
                </div>
            </div>

            <div className='setting-section no-padding-h'>
                <div className='setting-title'>提示词设置（通用模版）</div>
                <div className='section-bottom flexR'>
                    <div className='item'>
                        <div className='setting-label'>{'正向提示词'}</div>
                        <TextArea rows={10} placeholder={'正向提示词'}
                            maxLength={1000}
                            className="text-area-auto"
                            value={positivePrompt}
                            onChange={(v) => { setHandle({ positivePrompt: v.target.value }) }} />
                    </div>
                    <div className='item'>
                        <div className='setting-label'>{'反向提示词'}</div>
                        <TextArea rows={10} placeholder={'反向提示词'}
                            maxLength={1000}
                            className="text-area-auto"
                            value={negativePrompt}
                            onChange={(v) => { setHandle({ negativePrompt: v.target.value }) }} />
                    </div>
                </div>
            </div>
        </div >

    )


}

export default PaintSetting