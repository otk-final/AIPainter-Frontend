import { Button, Tabs,  TabsProps } from 'antd';
import React, { useEffect, useState } from 'react'
import './index.less'
import { LeftOutlined } from '@ant-design/icons';
import { history } from "umi"
import ExtractFrames from './components/extract-frames';
import GenerateImages from './components/generate-images';

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

const ImitatePage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<ImitateTabType>("exportFrames");
  const [hasVideo, setHasVideo] = useState(false);
  const [tabs, setTabs] = useState(imitateTabs)
  let [imitateValue, _] = useState<ImitateValue>({ tab: "exportFrames" })


  useEffect(() => {
    if (hasVideo) {
      let newRes = tabs?.map((i) => {
        return { ...i, disabled: false }
      })
      setTabs(newRes)
    }

  }, [hasVideo])

  return (
    <div className="imitate-wrap">
      <ImitateContext.Provider value={imitateValue}>
        <div className='page-header flexR'>
          <div className="flexR">
            <div className="nav-back" onClick={() => history.back()}><LeftOutlined twoToneColor="#fff" /></div>
            <Tabs defaultActiveKey={currentTab} items={tabs} onChange={(key) => setCurrentTab(key as ImitateTabType)} />
          </div>
          <Button type="primary" className="btn-primary-auto btn-primary-108" > {currentTab === "exportFrames" ? "下一步" :"导出剪映草稿"}</Button>
        </div>
        <div className='page-header-placeholder'></div>

        {currentTab === "exportFrames" ? <ExtractFrames handleChangeTab={setCurrentTab} /> : null}
        {currentTab === 'generateImages' ? <GenerateImages /> : null}
      </ImitateContext.Provider>
    </div>
  );
};




interface ImitateValue {
  script?: {
    path: string
    url: string
  }
  tab: ImitateTabType
}

export const ImitateContext = React.createContext<ImitateValue>({ tab: "exportFrames" })

export default ImitatePage


