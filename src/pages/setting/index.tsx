import { Button, Tabs, TabsProps, message } from 'antd';
import React, { createRef, useEffect, useRef, useState } from 'react'
import './index.less'
import PaintSetting, { PaintSettingRef } from './components/paint-setting';
import BasicSetting from './components/basic-setting';
import { usePersistComfyUIStorage } from '@/stores/comfyui';
import { Header } from '@/components';
import { useComfyUIRepository } from '@/repository/comfyui';

type setTabType = "paint" | "translate" | "basic"

export const setTabItems: TabsProps['items'] = [
  {
    key: 'paint',
    label: '绘图设置',
  },
  // {
  //   key: 'translate',
  //   label: '翻译设置',
  // },
  {
    key: 'basic',
    label: '基础设置',
  },
];

const SettingPage = () => {
  const [cur, setCur] = useState<setTabType>("paint");
  const onChange = (key: string) => {
    setCur(key as setTabType);
  };

  const comfyuiRepo = useComfyUIRepository(state => state)

  const paintRef = createRef<PaintSettingRef>()

  const handleSave = async () => {

    if (cur === "paint") {
      await comfyuiRepo.assignPersistent(paintRef.current!.getComfyUI()).then(() => { message.success("保存成功") }).finally(() => history.back())
    } else {
      //TODO 
    }
  }


  return (
    <div className="setting-wrap">
      <Header
        renderLeft={<Tabs defaultActiveKey="paint" items={setTabItems} onChange={onChange} />}
        renderRight={<Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleSave}>保存设置</Button>}
      />
      {cur === 'paint' ? <PaintSetting ref={paintRef} name="" /> : null}
      {cur === "basic" ? <BasicSetting /> : null}
    </div>
  );
};

export default SettingPage
