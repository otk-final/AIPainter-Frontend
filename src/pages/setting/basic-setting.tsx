import { FolderOpenFilled } from '@ant-design/icons';
import { Button, Input, Upload } from 'antd';
import React, {useEffect, useState, Fragment} from 'react'
import './index.less'

interface BasicSettingProps {
    onCallBack: (v: any)=>void
}

const BasicSetting:React.FC<BasicSettingProps> = ({onCallBack})=>{

    const handleChangePosition =(v)=>{
        console.log('s', v)
    }

    const handleRegain = ()=>{

    }

    return (
        <div>
            <div className='setting-section'>
                <div className='setting-title'>素材缓存</div>
                <div className='basic-subText'>顶目素材文件夹存储位雪 <span>更改项目素材文件夹的存储位台， 将影响己创建的小说项目的图片、视频等素材的使用，请详慎操作，建议选择空文件夹</span> </div>
                <div className="flexR">
                    <Input size="large" disabled placeholder="http://127.0.0.1:7860/"  className='input-s '/>
                    <Upload action="" directory>
                        <Button type="primary" className="setting-btn change-position-btn" onChange={handleChangePosition}>更改存储位蛋</Button>
                    </Upload>
                    <Button type="primary" className="setting-btn" onChange={handleRegain}>恢复为默认位罝</Button>
                </div>
            </div>

            <div className='setting-title'>素材缓存</div>
            <div className='flexR'>
                <div className='basic-item flexR'>
                    <FolderOpenFilled  twoToneColor="rgba(255, 255, 255, 0.9)" className='file-icon'/>
                    <div>打开 Stable Diffusion 模型文件夹</div>
                </div>
                <div className='basic-item flexR'>
                    <FolderOpenFilled twoToneColor="rgba(255, 255, 255, 0.9)" className='file-icon'/>
                    <div>打开 LORA 模型文件夹</div>
                </div>
                <div className='basic-item flexR'>
                    <FolderOpenFilled twoToneColor="rgba(255, 255, 255, 0.9)" className='file-icon'/>
                    <div>打开 Embeddings 模型文件夹</div>
                </div>
            </div>
        </div>
    )
}

export default BasicSetting;