import { Button, Modal, Tabs, message } from 'antd';
import React, { useEffect, useState } from 'react'
import './index.less'
import { createTabs } from './data'
import { useParams } from "umi"
import { Header } from '@/components';
import { useScriptRepository } from '@/repository/story';
import { useChapterRepository } from '@/repository/chapter';
import { useActorRepository } from '@/repository/actor';
import MixingTab from './components/mixing';
import DrawbatchTab from './components/drawbatch';
import StoryboardTab from './components/storyboard';
import { path } from '@tauri-apps/api';
import dialog, { open, save } from "@tauri-apps/plugin-dialog";
import { useComfyUIRepository } from '@/repository/comfyui';
import { useJYDraftRepository } from '@/repository/draft';
import { Project, useProjectRepository } from '@/repository/workspace';

type ActionTabType = "storyboard" | "drawbatch" | "mixing"

const StoryProject: React.FC<{ pid: string, project: Project }> = ({ pid, project }) => {

  const [cur, setCur] = useState<ActionTabType>("storyboard");
  const [tabs, setTabs] = useState(createTabs)

  const scriptRepo = useScriptRepository(state => state)
  const actorsRepo = useActorRepository(state => state)
  const chaptersRepo = useChapterRepository(state => state)

  const draftRepo = useJYDraftRepository(state => state)
  const comfyuiRepo = useComfyUIRepository(state => state)

  //加载配置项
  useEffect(() => {


    //加载当前工作需要的所有页面数据
    const initializeContext = async () => {

      await scriptRepo.load(pid)
      await actorsRepo.load(pid)
      await chaptersRepo.load(pid)

      //系统文件加载
      await comfyuiRepo.load("env")
      await draftRepo.load('env')
    }

    initializeContext().catch(err => message.error(err.message))

    return () => {
      chaptersRepo.sync()
    }
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
    let selected = await save({ title: "保存文件", filters: [{ name: "视频文件", extensions: ["mp4"] }] })
    if (!selected) {
      return
    }
    Modal.info({
      content: <div style={{ color: '#fff' }}>正在导出视频..</div>,
      footer: null,
      mask: true,
      maskClosable: false,
    })
    await chaptersRepo.handleConcatVideo(selected as string, draftRepo).catch(err => message.error(err.message)).finally(Modal.destroyAll)
  }

  //导出
  const handleJYDraft = async () => {

    let selected = await open({ directory: true, title: "剪映草稿目录", defaultPath: draftRepo.draft_dir || await path.desktopDir(), recursive: true })
    if (!selected) {
      return
    }

    Modal.info({
      content: <div style={{ color: '#fff' }}>正在导出剪映草稿..</div>,
      footer: null,
      mask: true,
      maskClosable: false,
    })

    await chaptersRepo.handleConcatJYDraft(selected as string, draftRepo).catch(err => message.error(err.message)).finally(Modal.destroyAll)
  }


  const customButtons = () => {

    return (
      <div className='flexR'>
        {/* <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleExport} disabled={!chaptersRepo.items || chaptersRepo.items?.length === 0}>导出视频</Button> */}
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
      {cur === "storyboard" ? <StoryboardTab pid={pid} project={project} /> : null}
      {cur === 'drawbatch' ? <DrawbatchTab pid={pid} project={project} /> : null}
      {cur === 'mixing' ? <MixingTab pid={pid} project={project} /> : null}
    </div>
  );
};


const StoryProjectPage: React.FC = () => {
  const params = useParams()
  const pid = params.pid as string
  const projectRepo = useProjectRepository(state => state)
  const [project, setProject] = useState<Project>()

  useEffect(() => {
    setProject(projectRepo.items.filter(item => item.id === pid)[0])
  }, [pid])

  return <StoryProject pid={params.pid as string} project={project!} />
}

export default StoryProjectPage
