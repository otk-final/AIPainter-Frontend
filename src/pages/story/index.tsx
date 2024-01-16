import { Button, Select, Tabs, InputNumber, message } from 'antd';
import React, { useEffect, useState } from 'react'
import './index.less'
import { createTabs } from './data'
import { LeftOutlined } from '@ant-design/icons';
import { history, useParams } from "umi"
import Storyboard from './components/storyboard';
import Drawbatch from './components/drawbatch';
import Videogeneration from './components/videogeneration'
import { usePersistActorsStorage, usePersistChaptersStorage, usePersistScriptStorage } from '@/stores/story';

type ActionTabType = "storyboard" | "drawbatch" | "videogeneration"



const StoryProject: React.FC<{ pid: string }> = ({ pid }) => {
  const [cur, setCur] = useState<ActionTabType>("storyboard");
  const [tabs, setTabs] = useState(createTabs)

  //状态
  const scriptLoadHandle = usePersistScriptStorage(state => state.load)
  const actorsLoadHandle = usePersistActorsStorage(state => state.load)
  const chaptersLoadHandle = usePersistChaptersStorage(state => state.load)


  const chapters = usePersistChaptersStorage(state => state.chapters)




  //加载配置项
  useEffect(() => {

    //加载当前工作需要的所有页面数据
    const initializeContext = async () => {
      await scriptLoadHandle(pid)
      await actorsLoadHandle(pid)
      await chaptersLoadHandle(pid)
    }
    initializeContext().catch(err => message.error(err))

  }, [pid])


  //根据脚本判断可操作步骤
  useEffect(() => {
    //can change tabs
    if (chapters && chapters.length > 0) {
      let newRes = tabs?.map((i) => {
        return { ...i, disabled: false }
      })
      setTabs(newRes)
    }
  }, [chapters])



  const customButtons = () => {
    if (cur === 'storyboard') {
      return (
        <div className='flexR'>
          {/* <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={() => setIsEnergyRechargeOpen(true)}>充值能量</Button> */}
          <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={() => { history.push('/roleset/' + pid) }} >设置角色</Button>
          <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={() => setCur("drawbatch")} disabled={!chapters || chapters?.length === 0}>下一步</Button>
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
  const actorsQuitHandle = usePersistActorsStorage(state => state.quit)
  const chaptersQuitHandle = usePersistChaptersStorage(state => state.quit)

  const handleQuit =  ()=>{
    scriptQuitHandle()
    actorsQuitHandle()
    chaptersQuitHandle()
    history.back()
  }

  return (
    <div className="create-wrap">
      <div className='page-header flexR'>
        <div className="flexR">
          <div className="nav-back" onClick={handleQuit}><LeftOutlined twoToneColor="#fff" onClick={saveAllHandle} /></div>
          <Tabs defaultActiveKey="paint" activeKey={cur} items={tabs} onChange={(key) => setCur(key as ActionTabType)} />
        </div>
        {customButtons()}
      </div>
      <div className='page-header-placeholder'></div>
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
