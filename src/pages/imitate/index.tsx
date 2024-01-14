import { Button, Tabs, TabsProps } from 'antd';
import React, { useEffect, useState } from 'react'
import './index.less'
import { LeftOutlined } from '@ant-design/icons';
import { history, useParams } from "umi"
import { usePersistImtateStorage } from '@/stores/frame';
import VideoImportTab from './components/video-import';
import ImageGenerateTab from './components/image-generate';

export type ImitateTabType = "exportFrames" | "generateImages"
const imitateTabs: TabsProps["items"] = [
  {
    key: "exportFrames",
    label: "视频抽帧",
  },
  {
    key: "generateImages",
    label: "图生图",
    // disabled: true
  },
];

const ImitateProject: React.FC<{ pid: string }> = ({ pid }) => {
  const [currentTab, setCurrentTab] = useState<ImitateTabType>("exportFrames");
  const [tabs, setTabs] = useState(imitateTabs)
  const { videoPath, load } = usePersistImtateStorage(state => state)

  useEffect(() => {

    if (videoPath) {
      let newRes = tabs?.map((i) => {
        return { ...i, disabled: false }
      })
      setTabs(newRes)
    }

    //加载数据
    load(pid)
  }, [pid, videoPath])

  return (
    <div className="imitate-wrap">
      <div className='page-header flexR'>
        <div className="flexR">
          <div className="nav-back" onClick={() => history.back()}><LeftOutlined twoToneColor="#fff" /></div>
          <Tabs defaultActiveKey={currentTab} items={tabs} onChange={(key) => setCurrentTab(key as ImitateTabType)} />
        </div>
        <Button type="primary" className="btn-primary-auto btn-primary-108" > {currentTab === "exportFrames" ? "下一步" : "导出剪映草稿"}</Button>
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


