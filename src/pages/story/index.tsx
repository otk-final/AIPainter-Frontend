import { Button, Modal, Tabs, message } from 'antd';
import React, { useEffect, useState } from 'react'
import './index.less'
import { createTabs } from './data'
import { useParams } from "umi"
import { Header } from '@/components';
import { useActorRepository, useChapterRepository, useScriptRepository } from '@/repository/story';
import MixingTab from './components/mixing';
import DrawbatchTab from './components/drawbatch';
import StoryboardTab from './components/storyboard';
import { dialog, path } from '@tauri-apps/api';
import { useBaisicSettingRepository } from '@/repository/setting';

type ActionTabType = "storyboard" | "drawbatch" | "mixing"

const StoryProject: React.FC<{ pid: string }> = ({ pid }) => {

  const [cur, setCur] = useState<ActionTabType>("storyboard");
  const [tabs, setTabs] = useState(createTabs)

  //状态
  const scriptRepo = useScriptRepository(state => state)
  const actorsRepo = useActorRepository(state => state)
  const chaptersRepo = useChapterRepository(state => state)
  const settingRepo = useBaisicSettingRepository(state => state)

  //加载配置项
  useEffect(() => {

    //加载当前工作需要的所有页面数据
    const initializeContext = async () => {
      await scriptRepo.load(pid)
      await actorsRepo.load(pid)
      await chaptersRepo.load(pid)
    }
    initializeContext().catch(err => message.error(err))
  }, [pid])


  //根据脚本判断可操作步骤
  useEffect(() => {
    //can change tabs
    if (chaptersRepo.items && chaptersRepo.items.length > 0) {
      let newRes = tabs?.map((i) => {
        return { ...i, disabled: false }
      })
      setTabs(newRes)
    }
  }, [chaptersRepo.items])


  const handleExport = async () => {
    let selected = await dialog.save({ title: "保存文件", filters: [{ name: "视频文件", extensions: ["mp4"] }] })
    if (!selected) {
      return
    }
    Modal.info({
      content: <div style={{ color: '#fff' }}>正在导出视频..</div>,
      footer: null,
      mask: true,
      maskClosable: false,
    })
    await chaptersRepo.handleConcatVideo(selected as string, settingRepo).catch(err => message.error(err)).finally(Modal.destroyAll)
  }

  //导出
  const handleJYDraft = async () => {

    let selected = await dialog.open({ directory: true, title: "剪映草稿目录", defaultPath: settingRepo.draft_dir || await path.desktopDir(), recursive: true })
    if (!selected) {
      return
    }

    Modal.info({
      content: <div style={{ color: '#fff' }}>正在导出剪映草稿..</div>,
      footer: null,
      mask: true,
      maskClosable: false,
    })

    await chaptersRepo.handleConcatJYDraft(selected as string, settingRepo).catch(err => message.error(err)).finally(Modal.destroyAll)
  }


  const customButtons = () => {

    return (
      <div className='flexR'>
        <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleExport} disabled={!chaptersRepo.items || chaptersRepo.items?.length === 0}>导出视频</Button>
        <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleJYDraft} disabled={!chaptersRepo.items || chaptersRepo.items?.length === 0}>导出剪映草稿</Button>
      </div>
    )
  }


  return (
    <div className="create-wrap">
      <Header
        renderLeft={<Tabs defaultActiveKey="paint" activeKey={cur} items={tabs} onChange={(key) => setCur(key as ActionTabType)} />}
        renderRight={customButtons()}
      />
      {cur === "storyboard" ? <StoryboardTab pid={pid} /> : null}
      {cur === 'drawbatch' ? <DrawbatchTab pid={pid} /> : null}
      {cur === 'mixing' ? <MixingTab pid={pid} /> : null}
    </div>
  );
};


const StoryProjectPage: React.FC = () => {
  const params = useParams()
  return <StoryProject pid={params.pid as string} />
}

export default StoryProjectPage
