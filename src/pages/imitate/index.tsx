import { Button, message, Tabs, TabsProps } from 'antd';
import React, { useEffect, useState } from 'react'
import './index.less'
import { LeftOutlined } from '@ant-design/icons';
import { history, useParams } from "umi"
import { usePersistImtateFramesStorage, usePersistImtateStorage } from '@/stores/frame';
import VideoImportTab from './components/video-import';
import ImageGenerateTab from './components/image-generate';
import { usePersistComfyUIStorage } from '@/stores/comfyui';

export type ImitateTabType = "exportFrames" | "generateImages"
const imitateTabs: TabsProps["items"] = [
  {
    key: "exportFrames",
    label: "视频抽帧",
  },
  {
    key: "generateImages",
    label: "图生图",
  },
];

const ImitateProject: React.FC<{ pid: string }> = ({ pid }) => {
  const [currentTab, setCurrentTab] = useState<ImitateTabType>("exportFrames");
  const [tabs, setTabs] = useState(imitateTabs)
  const { frames } = usePersistImtateFramesStorage(state => state);

  const imtateLoadHanlde = usePersistImtateStorage(state => state.load)
  const loadComfy = usePersistComfyUIStorage(state => state.load)
  useEffect(() => {
    //加载数据
    imtateLoadHanlde(pid)
    loadComfy()
  }, [pid])

  //导出
  const handleDraft = () => {
    message.loading({
      content: '导出剪映草稿..',
      duration: 0,
      style: {
        marginTop: "350px"
      }
    })
    setTimeout(message.destroy, 3000)
  }



  const imtateQuitHanlde = usePersistImtateStorage(state => state.quit)
  const framesQuitHanlde = usePersistImtateFramesStorage(state => state.quit)


  const handleQuit = () => {
    imtateQuitHanlde()
    framesQuitHanlde()
    history.back()
  }



  return (
    <div className="imitate-wrap">
      <div className='page-header flexR'>
        <div className="flexR">
          <div className="nav-back" onClick={handleQuit}><LeftOutlined twoToneColor="#fff" /></div>
          <Tabs defaultActiveKey={currentTab} activeKey={currentTab} items={tabs} onChange={(key) => setCurrentTab(key as ImitateTabType)} />
        </div>
        {currentTab === "exportFrames" ? null :
          <Button type="primary" className="btn-primary-auto btn-primary-108" disabled={!frames || frames.length === 0} onClick={handleDraft}> 导出剪映草稿</Button>
        }
      </div>
      <div className='page-header-placeholder'></div>

      {currentTab === "exportFrames" ? < VideoImportTab handleChangeTab={setCurrentTab} /> : null}
      {currentTab === 'generateImages' ? <ImageGenerateTab pid={pid} handleChangeTab={setCurrentTab} /> : null}
    </div>
  );
};

const ImitateProjectPage: React.FC = () => {
  const params = useParams()
  return <ImitateProject pid={params.pid as string} />
}



export default ImitateProjectPage


