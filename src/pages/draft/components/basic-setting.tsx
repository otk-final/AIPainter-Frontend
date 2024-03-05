import { forwardRef, useImperativeHandle } from 'react'
import { useState } from "react"
import { JYDraftConfiguration, useBaisicSettingRepository } from '@/repository/draft';
import { dialog, path } from '@tauri-apps/api';
import { Button, Input } from 'antd';


export interface JYDraftSettingProps {
    name: string
}

export interface JYDraftSettingRef {
    getConfiguration(): JYDraftConfiguration
}

const BasicSettingTab = forwardRef<JYDraftSettingRef, JYDraftSettingProps>((props, ref) => {

    //init
    const settingRepo = useBaisicSettingRepository(state => state)
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
        </div>
    )
})

export default BasicSettingTab;