import { Button, Tabs, TabsProps, message } from 'antd';
import React, { useEffect, useState } from 'react'
import './index.less'
import PaintSetting from './components/paint-setting';
import BasicSetting from './components/basic-setting';
import { usePersistComfyUIStorage } from '@/stores/comfyui';
import { Header } from '@/components';

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

  const { save, load } = usePersistComfyUIStorage(state => state)
  useEffect(() => {
    load()
  }, [])

  const handleSave = async () => {
    save().then(() => { message.success("保存成功") })
  }


  return (
    <div className="setting-wrap">
      <Header 
        renderLeft={<Tabs defaultActiveKey="paint" items={setTabItems} onChange={onChange} />} 
        renderRight={<Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleSave}>保存设置</Button>}
        />
      {cur === 'paint' ? <PaintSetting /> : null}
      {cur === "basic" ? <BasicSetting /> : null}
    </div>
  );
};

export default SettingPage
