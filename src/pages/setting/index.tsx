import { Button, Tabs, TabsProps, message } from 'antd';
import React, { createRef, useEffect, useState } from 'react'
import './index.less'
import PaintSetting, { PaintSettingRef } from './components/paint-setting';
import BasicSetting, { BasicSettingRef } from './components/basic-setting';
import { Header } from '@/components';
import { useComfyUIRepository } from '@/repository/comfyui';
import { useBaisicSettingRepository } from '@/repository/setting';

type setTabType = "paint" | "translate" | "basic" | "draft"

export const setTabItems: TabsProps['items'] = [
  {
    key: 'basic',
    label: '基础设置',
  },
  {
    key: 'paint',
    label: '绘图设置',
  }
];

const SettingPage = () => {

  const [cur, setCur] = useState<setTabType>("basic");
  const onChange = (key: string) => {
    setCur(key as setTabType);
  };



  const comfyuiRepo = useComfyUIRepository(state => state)
  const basicRepo = useBaisicSettingRepository(state => state)
  useEffect(() => {
    comfyuiRepo.load("env")
    basicRepo.load("env")
  }, [])
  

  const paintRef = createRef<PaintSettingRef>()
  const basicRef = createRef<BasicSettingRef>()

  const handleSave = async () => {

    if (cur === "paint") {
      await comfyuiRepo.reload(paintRef.current!.getComfyUI()).then(() => { message.success("保存成功") }).finally(() => history.back())
    } else if (cur === "basic") {
      await basicRepo.reload(basicRef.current!.getSetting()).then(() => { message.success("保存成功") }).finally(() => history.back())
    } else {

    }
  }


  return (
    <div className="setting-wrap">
      <Header
        renderLeft={<Tabs defaultActiveKey={cur} items={setTabItems} onChange={onChange} />}
        renderRight={<Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleSave}>保存设置</Button>}
      />
      {cur === "basic" ? <BasicSetting ref={basicRef} name="" /> : null}
      {cur === 'paint' ? <PaintSetting ref={paintRef} name="" /> : null}
    </div>
  );
};

export default SettingPage
