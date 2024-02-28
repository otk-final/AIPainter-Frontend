import { Button, Modal, Tabs, TabsProps, message } from 'antd';
import React, { useMemo, useState } from 'react'
import './index.less'
import { history, useParams } from "umi"
import VideoImportTab from './components/video-import';
import ImageGenerateTab from './components/image-generate';
import { Header } from '@/components';
import { useSimulateRepository } from '@/repository/simulate';
import { useComfyUIRepository } from '@/repository/comfyui';
import SRTMixingTab from './components/srt-mixing';
import { useKeyFrameRepository } from '@/repository/keyframe';
import { dialog, path } from '@tauri-apps/api';
import { useBaisicSettingRepository } from '@/repository/setting';

export type ImitateTabType = "import" | "frames" | "audio"
const imitateTabs: TabsProps["items"] = [
  {
    key: "import",
    label: "视频导入",
  },
  {
    key: "frames",
    label: "图生图",
  },
  {
    key: "audio",
    label: "字幕配音",
  },
];

const ImitateProject: React.FC<{ pid: string }> = ({ pid }) => {
  const [currentTab, setCurrentTab] = useState<ImitateTabType>("import");
  const [tabs,] = useState(imitateTabs)

  const simulateRepo = useSimulateRepository(state => state)
  const keyFreamRepo = useKeyFrameRepository(state => state)
  const comfyuiRepo = useComfyUIRepository(state => state)
  const settingRepo = useBaisicSettingRepository(state => state)

  //加载配置项
  useMemo(() => {
    //加载数据
    simulateRepo.load(pid)
    keyFreamRepo.load(pid)
    comfyuiRepo.load("env")
    return () => {
      simulateRepo.sync()
      keyFreamRepo.sync()
    }
  }, [pid])

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
    await keyFreamRepo.handleConcatVideo(selected as string).catch(err => message.error(err)).finally(Modal.destroyAll)
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

    await keyFreamRepo.handleConcatJYDraft(selected as string).catch(err => message.error(err)).finally(Modal.destroyAll)
  }


  const handleQuit = () => {
    history.back()
  }

  const renderHeaderLeft = () => {
    return <Tabs defaultActiveKey={currentTab} activeKey={currentTab} items={tabs} onChange={(key) => setCurrentTab(key as ImitateTabType)} />
  }


  const renderHeaderRight = () => {
    return <div>
      <Button type="primary" className="btn-primary-auto btn-primary-108" disabled={!keyFreamRepo.items || keyFreamRepo.items.length === 0} onClick={handleExport}> 导出视频</Button>
      <Button type="primary" className="btn-primary-auto btn-primary-108" disabled={!keyFreamRepo.items || keyFreamRepo.items.length === 0} onClick={handleJYDraft}> 导出剪映草稿</Button>
    </div>
  }


  return (
    <div className="table-wrap">
      <Header onQuit={(handleQuit)} renderLeft={renderHeaderLeft()} renderRight={renderHeaderRight()} />
      {currentTab === "import" ? < VideoImportTab pid={pid} handleChangeTab={setCurrentTab} /> : null}
      {currentTab === 'frames' ? <ImageGenerateTab pid={pid} handleChangeTab={setCurrentTab} /> : null}
      {currentTab === 'audio' ? <SRTMixingTab pid={pid} handleChangeTab={setCurrentTab} /> : null}
    </div>
  );
};

const ImitateProjectPage: React.FC = () => {
  const params = useParams()
  return <ImitateProject pid={params.pid as string} />
}



export default ImitateProjectPage


