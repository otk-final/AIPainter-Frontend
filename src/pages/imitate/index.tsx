import { Button, Select, Tabs, InputNumber, TabsProps } from 'antd';
import React, { createContext, useContext, useEffect, useState } from 'react'
import './index.less'
import { LeftOutlined } from '@ant-design/icons';
import { history } from "umi"
import ExtractFramesTab from './extract-frames/index-tab';
import BatchDrawTab from './batch-draw/index-tab';
import GenerateVideoTab from './generate-video/index-tab'
import { EnergyRechargeModule } from '@/components'

export type ImitateTabType = "exportFrames" | "batchDraw" | "generateVideo"
const imitateTabs: TabsProps["items"] = [
  {
    key: "exportFrames",
    label: "智能抽帧",
  },
  {
    key: "batchDraw",
    label: "批量绘图",
    disabled: true
  },
  {
    key: "generateVideo",
    label: "视频生成",
    disabled: true
  },
];



const ImitatePage: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<ImitateTabType>("exportFrames");
  const [story, setStory] = useState({});
  const [isEnergyRechargeOpen, setIsEnergyRechargeOpen] = useState(false);
  const [hasScript, setHasScript] = useState(false);
  const [tabs, setTabs] = useState(imitateTabs)

  useEffect(() => {
    if (hasScript) {
      let newRes = tabs?.map((i) => {
        return { ...i, disabled: false }
      })
      setTabs(newRes)
    }

  }, [hasScript])


  const handleSetRole = () => {
    history.push('/roleset')
  }
  const handleNext = () => { }

  const customButtons = () => {
    if (currentTab === 'exportFrames') {
      return (
        <div className='flexR'>
          <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={() => setIsEnergyRechargeOpen(true)}>充值能量</Button>
          <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleSetRole} disabled={!hasScript}>设置角色</Button>
          <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleNext} disabled={!hasScript}>下一步</Button>
        </div>
      )
    } else if (currentTab === 'batchDraw') {
      return (
        <div className='flexR'>
          <div className='flexR'>绘图起点 <InputNumber controls={false} style={{ width: "54px", marginLeft: '10px', marginRight: '10px' }} className="inputnumber-auto" placeholder='1' defaultValue={1} /> 镜</div>
          <Button type="primary" className="btn-primary-auto btn-primary-108" >开始绘制</Button>
          <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleNext}>下一步</Button>
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
            onChange={(v) => { }}
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


  let [imitateValue, _] = useState<ImitateValue>({ tab: "exportFrames" })


  return (
    <div className="create-wrap">
      <ImitateContext.Provider value={imitateValue}>
        <div className='page-header flexR'>
          <div className="flexR">
            <div className="nav-back" onClick={() => history.back()}><LeftOutlined twoToneColor="#fff" /></div>
            <Tabs defaultActiveKey="paint" items={tabs} onChange={(key) => setCurrentTab(key as ImitateTabType)} />
          </div>
          {customButtons()}
        </div>
        <div className='page-header-placeholder'></div>


        {imitateValue.tab === "exportFrames" ? <ExtractFramesTab handleChangeTab={setCurrentTab} /> : null}
        {imitateValue.tab === 'batchDraw' ? <BatchDrawTab /> : null}
        {imitateValue.tab === "generateVideo" ? <GenerateVideoTab /> : null}
        <EnergyRechargeModule isOpen={isEnergyRechargeOpen} onClose={() => setIsEnergyRechargeOpen(false)} />
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


