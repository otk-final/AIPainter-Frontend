import { dialog, path } from '@tauri-apps/api';
import { Button, Input } from 'antd';
import React from 'react'


const BasicSetting:React.FC = ()=>{

    const handleChangePosition = async () => {
         //选择文件
         let selected = await dialog.open({
            title: "选择剪映草稿存放目录",
            defaultPath: await path.desktopDir(),
            // filters: [{ name: "文本文件", extensions: ["txt"] }, { name: "excel", extensions: ["xlsx"] }]
        })
        if (!selected) {
            return
        }
    }

    return (
        <div style={{height:" calc(100% - 78px)", overflow: 'scroll', paddingLeft: '30px', paddingRight: '30px'}}>
            <div className='setting-section'>
                <div className='setting-title'>剪映草稿存放目录</div>
                <div className='basic-subText'>剪映草稿存放目录文件夹存储位置 <span>更改项目素材文件夹的存储位置， 将影响己创建的小说项目的图片、视频等素材的使用，请详慎操作</span> </div>
                <div className="flexR">
                    <Input size="large" disabled placeholder="http://127.0.0.1:7860/"  className='input-s '/>
                    <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleChangePosition}>更改存储位蛋</Button>
                </div>
            </div>
        </div>
    )
}

export default BasicSetting;