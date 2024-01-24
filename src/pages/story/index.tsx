import { Button, Select, Tabs, InputNumber, message } from 'antd';
import React, { useEffect, useState } from 'react'
import './index.less'
import { createTabs } from './data'
import { history, useParams } from "umi"
import Storyboard from './components/storyboard';
import Drawbatch from './components/drawbatch';
import Videogeneration from './components/videogeneration'
import { Header } from '@/components';
import { useActorRepository, useChapterRepository, useScriptRepository } from '@/repository/story';

type ActionTabType = "storyboard" | "drawbatch" | "videogeneration"



const StoryProject: React.FC<{ pid: string }> = ({ pid }) => {

  const [cur, setCur] = useState<ActionTabType>("storyboard");
  const [tabs, setTabs] = useState(createTabs)

  //状态
  const scriptRepo = useScriptRepository(state => state)
  const actorsRepo = useActorRepository(state => state)
  const chaptersRepo = useChapterRepository(state => state)
  


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



  const customButtons = () => {

    return (
      <div className='flexR'>
        <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={() => setCur("drawbatch")} disabled={!chaptersRepo.items || chaptersRepo.items?.length === 0}>导出剪映草稿</Button>
      </div>
    )
  }


  return (
    <div className="create-wrap">
      <Header
        renderLeft={<Tabs defaultActiveKey="paint" activeKey={cur} items={tabs} onChange={(key) => setCur(key as ActionTabType)} />}
        renderRight={customButtons()}
      />
      {cur === "storyboard" ? <Storyboard pid={pid} /> : null}
      {cur === 'drawbatch' ? <Drawbatch /> : null}
      {cur === "videogeneration" ? <Videogeneration /> : null}
    </div>
  );
};


const StoryProjectPage: React.FC = () => {
  const params = useParams()
  return <StoryProject pid={params.pid as string} />
}

export default StoryProjectPage
