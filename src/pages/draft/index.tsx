import { Button, Tabs, TabsProps, message } from 'antd';
import React, { createRef, useEffect, useState } from 'react'
import './index.less'
import { Header } from '@/components';
import { useComfyUIRepository } from '@/repository/comfyui';
import { useBaisicSettingRepository, useJYDraftRepository } from '@/repository/draft';
import { useGPTRepository } from '@/repository/gpt';
import { useTTSRepository } from '@/repository/tts';
import { useTranslateRepository } from '@/repository/translate';

type setTabType = "paint" | "translate" | "basic" | "gpt" | "tts"

export const setTabItems: TabsProps['items'] = [
  {
    key: 'basic',
    label: '目录设置',
  },
  {
    key: 'parameter',
    label: '参数设置',
  }
];

const JYDraftPage = () => {

  const [cur, setCur] = useState<setTabType>("basic");
  const onChange = (key: string) => {
    setCur(key as setTabType);
  };

  const draftRepo = useJYDraftRepository(state => state)

  useEffect(() => {
    draftRepo.load("env")
  }, [])

  const paintRef = createRef<PaintSettingRef>()

  const handleSave = async () => {
    if (cur === "paint") {
      await comfyuiRepo.reload(paintRef.current!.getConfiguration()).then(() => { message.success("保存成功") }).finally(() => history.back())
    } else if (cur === "basic") {
      await basicRepo.reload(basicRef.current!.getConfiguration()).then(() => { message.success("保存成功") }).finally(() => history.back())
    }


    return (
      <div className="setting-wrap">
        <Header
          renderLeft={<Tabs defaultActiveKey={cur} items={setTabItems} onChange={onChange} />}
          renderRight={<Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleSave}>保存设置</Button>}
        />
        {cur === "basic" ? <BasicSetting ref={basicRef} name="" /> : null}
      </div>
    );
  };

  export default JYDraftPage
