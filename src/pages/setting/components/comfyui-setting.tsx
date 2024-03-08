import { Button, Input } from 'antd';
import React, { forwardRef, useImperativeHandle, useState } from 'react'
import TextArea from 'antd/es/input/TextArea';
import { DeleteFilled, PlusOutlined, } from '@ant-design/icons';
import { dialog, path } from '@tauri-apps/api';
import { ComfyUIConfiguration, useComfyUIRepository } from '@/repository/comfyui';




export interface ComfyUISettingProps {
    name: string
}

export interface ComfyUISettingRef {
    getConfiguration(): ComfyUIConfiguration
}

const ComfyUISettingTab = forwardRef<ComfyUISettingRef, ComfyUISettingProps>((props, ref) => {


    //init
    const comfyUIRepo = useComfyUIRepository(state => state)
    const [stateComfyui, setComfyui] = useState<ComfyUIConfiguration>({ ...comfyUIRepo })

    useImperativeHandle(ref, () => ({
        getConfiguration() { return stateComfyui }
    }))

    const handleUploadMode = async (idx: number) => {
        let selected = await dialog.open({
            title: "选择ComfyUI Workflow Api 文件",
            multiple: false,
            filters: [{ name: "api文件", extensions: ["json"] }]
        })
        if (!selected) {
            return
        }

        let selectedPath = selected as string
        stateComfyui.items[idx].name = await path.basename(selectedPath)
        stateComfyui.items[idx].path = selectedPath

        setComfyui({ ...stateComfyui, items: stateComfyui.items })
    }

    const handleRemoveMode = async (idx: number) => {
        stateComfyui.items.splice(idx, 1)
        setComfyui({ ...stateComfyui, items: stateComfyui.items })
    }

    const handleAppendMode = async () => {
        stateComfyui.items.push({ id: 0, name: "", path: "" })
        setComfyui({ ...stateComfyui, items: stateComfyui.items })
    }

    const handleUploadReverse = async () => {
        let selected = await dialog.open({
            title: "选择ComfyUI Workflow Api 文件",
            multiple: false,
            filters: [{ name: "api文件", extensions: ["json"] }]
        })
        if (!selected) {
            return
        }
        let selectedPath = selected as string
        setComfyui({ ...stateComfyui, reverseWF: { id: 0, name: await path.basename(selectedPath), path: selectedPath } })
    }

    return (
        <div style={{ height: "calc(100% - 78px)", overflow: 'scroll', paddingLeft: '30px', paddingRight: '30px' }}>
            <div className='setting-section'>
                <div className='setting-title'>ComfyUI 环境配置</div>

                <div className='flexR'>
                    <Input size="large" placeholder="http://127.0.0.1:8188" className='input-s'
                        value={stateComfyui?.host.url}
                        onChange={(e) => setComfyui({ ...stateComfyui, host: { ...stateComfyui.host, url: e.target.value } })}
                    />
                </div>

                {/* <div className='flexR half-width'>
                    <div className='flexR'>
                        <div className='setting-label'>Websocket地址</div>
                    </div>
                </div>

                <div className='setting-form-label flexR half-width'>
                    <div className='setting-form flexR half-width'>
                        <Input size="large" placeholder="ws://127.0.0.1:8188" className='input-s'
                            value={stateComfyui?.host.websocket}
                            onChange={(e) => setComfyui({ ...stateComfyui, host: { ...stateComfyui.host, websocket: e.target.value } })}
                        />
                    </div>
                </div> */}

            </div >

            <div className='setting-section'>
                <div className='setting-title'>ComfyUI Api配置</div>
                <div className='content flexR'>
                    <div className='setting-title'>生图模型
                        <Button type="primary" size={'small'} className="btn-primary-auto btn-primary-108" icon={<PlusOutlined />} onClick={handleAppendMode}>添加模型</Button>
                    </div>
                </div>

                {stateComfyui?.items.map((item, idx) => {
                    return (<div className='setting-form flexR' key={idx}>
                        <Input size="large" placeholder="点击更换 workflow json 文件" className='input-s' value={item.path} readOnly onClick={() => handleUploadMode(idx)} />
                        <Button type="primary" className="btn-primary-auto btn-primary-108" icon={<DeleteFilled />} disabled={stateComfyui.items.length === 1} onClick={() => handleRemoveMode(idx)}>删除模型</Button>
                    </div>)
                })}


                <div className='setting-title'></div>
                <div className='content flexR'>
                    <div className='setting-title'>反推关键词</div>
                </div>
                <div className='setting-form flexR'>
                    <Input size="large" placeholder="点击更换 workflow json 文件" className='input-s' value={stateComfyui?.reverseWF?.path} readOnly onClick={handleUploadReverse} />
                </div>
            </div>

            <div className='setting-section no-padding-h'>
                <div className='setting-title'>默认提示词设置</div>
                <div className='section-bottom flexR'>
                    <div className='item'>
                        <div className='setting-label'>{'正向提示词'}</div>
                        <TextArea rows={10} placeholder={'正向提示词'}
                            maxLength={1000}
                            className="text-area-auto"
                            value={stateComfyui?.positivePrompt}
                            onChange={(e) => setComfyui({ ...stateComfyui!, positivePrompt: e.target.value })} />
                    </div>
                    <div className='item'>
                        <div className='setting-label'>{'反向提示词'}</div>
                        <TextArea rows={10} placeholder={'反向提示词'}
                            maxLength={1000}
                            className="text-area-auto"
                            value={stateComfyui?.negativePrompt}
                            onChange={(e) => setComfyui({ ...stateComfyui!, negativePrompt: e.target.value })} />
                    </div>
                </div>
            </div>

            <div className='setting-section no-padding-h'>
                <div className='setting-title'>默认敏感词</div>
                <div className='section-bottom flexR'>
                    <div className='item'>
                        <TextArea rows={10} placeholder={'敏感词以#分隔'}
                            maxLength={1000}
                            className="text-area-auto"
                            value={stateComfyui?.sensitivePrompt}
                            onChange={(e) => setComfyui({ ...stateComfyui!, sensitivePrompt: e.target.value })} />
                    </div>
                </div>
            </div>

        </div >
    )
})
export default ComfyUISettingTab