import { Button, Tabs, TabsProps, message } from 'antd';
import React, { createRef, useEffect, useState } from 'react'
import './index.less'
import { Header } from '@/components';
import { useComfyUIRepository } from '@/repository/comfyui';
import ComfyUISettingTab, { ComfyUISettingRef } from './components/comfyui-setting';

type setTabType = "paint" | "translate" | "gpt" | "tts"

export const setTabItems: TabsProps['items'] = [
  {
    key: 'paint',
    label: '绘图接口',
  },
  {
    key: 'gpt',
    label: 'GPT接口',
  },
  {
    key: 'tts',
    label: '音频接口',
  },
  {
    key: 'translate',
    label: '翻译接口',
  }
];

const SettingPage = () => {

  const [cur, setCur] = useState<setTabType>("paint");
  const onChange = (key: string) => {
    setCur(key as setTabType);
  };



  const comfyuiRepo = useComfyUIRepository(state => state)

  useEffect(() => {
    comfyuiRepo.load("env")
  }, [])


  const paintRef = createRef<ComfyUISettingRef>()

  const handleSave = async () => {
    if (cur === "paint") {
      await comfyuiRepo.reload(paintRef.current!.getConfiguration()).then(() => { message.success("保存成功") }).finally(() => history.back())
    }
  }


  return (
    <div className="setting-wrap">
      <Header
        renderLeft={<Tabs defaultActiveKey={cur} items={setTabItems} onChange={onChange} />}
        renderRight={<Button type="primary" className="btn-primary-auto btn-primary-88" onClick={handleSave}>保存设置</Button>}
      />
      {cur === 'paint' ? <ComfyUISettingTab ref={paintRef} name={cur} /> : null}
    </div>
  );
};

export default SettingPage
