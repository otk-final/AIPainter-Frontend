import { Button, Select, Tabs, InputNumber, message } from 'antd';
import React, { useEffect, useState } from 'react'
import './index.less'
import { createTabs } from './data'
import { history, useParams } from "umi"
import Storyboard from './components/storyboard';
import Drawbatch from './components/drawbatch';
import Videogeneration from './components/videogeneration'
import { usePersistChaptersStorage, usePersistScriptStorage } from '@/stores/story';
import { Header } from '@/components';
import { useActorRepository, useChapterRepository, useScriptRepository } from '@/repository/story';

type ActionTabType = "storyboard" | "drawbatch" | "videogeneration"



const StoryProject: React.FC<{ pid: string }> = ({ pid }) => {

  const [cur, setCur] = useState<ActionTabType>("storyboard");
  const [statePid, setPid] = useState<string>(pid)
  const [tabs, setTabs] = useState(createTabs)

  //状态
  const scriptRepo = useScriptRepository(state => state)
  const actorsRepo = useActorRepository(state => state)
  const chaptersRepo = useChapterRepository(state => state)


  //加载配置项
  useEffect(() => {

    //加载当前工作需要的所有页面数据
    const initializeContext = async () => {
      await scriptRepo.load(statePid)
      await actorsRepo.load(statePid)
      await chaptersRepo.load(statePid)
    }
    initializeContext().catch(err => message.error(err))

  }, [statePid])


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
    if (cur === 'storyboard') {
      return (
        <div className='flexR'>
          {/* <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={() => setIsEnergyRechargeOpen(true)}>充值能量</Button> */}
          <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={() => { history.push('/roleset/' + statePid) }} >设置角色</Button>
          <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={() => setCur("drawbatch")} disabled={!chaptersRepo.items || chaptersRepo.items?.length === 0}>下一步</Button>
        </div>
      )
    } else if (cur === 'drawbatch') {
      return (
        <div className='flexR'>
          <div className='flexR'>绘图起点 <InputNumber controls={false} style={{ width: "54px", marginLeft: '10px', marginRight: '10px' }} className="inputnumber-auto" placeholder='1' defaultValue={1} /> 镜</div>
          <Button type="primary" className="btn-primary-auto btn-primary-108" >开始绘制</Button>
          <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={() => setCur("videogeneration")}>下一步</Button>
        </div>
      )
    } else {
      return (
        <div className='flexR'>
          <Button type="default" className="btn-default-auto btn-default-150" >打开图片文件夹</Button>
          <Select
            className={`select-auto`}
            style={{ width: '200px', marginLeft: "20px" }}
            defaultValue="1"
            // onChange={(v) => { }}
            options={[
              { value: '1', label: '视频生成' },
              { value: '2', label: '视频生成sss' },
              { value: '3', label: 'sssss' },
            ]}
          />
          <Button type="primary" className="btn-primary-auto btn-primary-108" >合成视频</Button>
        </div>
      )
    }
  }

  const saveAllHandle = () => {

  }

  const scriptQuitHandle = usePersistScriptStorage(state => state.quit)
  const chaptersQuitHandle = usePersistChaptersStorage(state => state.quit)

  const handleQuit = () => {
    scriptQuitHandle()
    chaptersQuitHandle()
    history.back()
  }

  return (
    <div className="create-wrap">
      <Header onQuit={handleQuit}
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
