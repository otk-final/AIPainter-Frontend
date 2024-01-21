import { Button, message, Tabs, TabsProps } from 'antd';
import React, { useEffect, useState } from 'react'
import './index.less'
import { history, useParams } from "umi"
import VideoImportTab from './components/video-import';
import ImageGenerateTab from './components/image-generate';
import { Header } from '@/components';
import { AudioExportTab } from './components/audio-export';
import { useKeyFrameRepository, useSimulateRepository } from '@/repository/simulate';

export type ImitateTabType = "import" | "frames" | "audio"
const imitateTabs: TabsProps["items"] = [
  {
    key: "import",
    label: "视频抽帧",
  },
  {
    key: "frames",
    label: "图生图",
  },
  {
    key: "audio",
    label: "音频同轨",
  },
];

const ImitateProject: React.FC<{ pid: string }> = ({ pid }) => {
  const [currentTab, setCurrentTab] = useState<ImitateTabType>("import");
  const [tabs,] = useState(imitateTabs)
  
  const simulateLoader = useSimulateRepository(state => state.load)
  const keyFreamLoader = useKeyFrameRepository(state => state.load)

  //加载配置项
  useEffect(() => {
    //加载数据
    simulateLoader(pid)
    keyFreamLoader(pid)
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


  const handleQuit = () => {
    history.back()
  }

  const renderHeaderLeft = () => {
    return <Tabs defaultActiveKey={currentTab} activeKey={currentTab} items={tabs} onChange={(key) => setCurrentTab(key as ImitateTabType)} />
  }

  const renderHeaderRight = () => {
    return currentTab === "audio" ? null :
      <Button type="primary" className="btn-primary-auto btn-primary-108" disabled={!frames || frames.length === 0} onClick={handleDraft}> 导出剪映草稿</Button>
  }


  return (
    <div className="imitate-wrap">
      <Header onQuit={(handleQuit)} renderLeft={renderHeaderLeft()} renderRight={renderHeaderRight()} />
      {currentTab === "import" ? < VideoImportTab handleChangeTab={setCurrentTab} /> : null}
      {currentTab === 'frames' ? <ImageGenerateTab pid={pid} handleChangeTab={setCurrentTab} /> : null}
      {currentTab === 'audio' ? <AudioExportTab handleChangeTab={setCurrentTab} /> : null}
    </div>
  );
};

const ImitateProjectPage: React.FC = () => {
  const params = useParams()
  return <ImitateProject pid={params.pid as string} />
}



export default ImitateProjectPage


