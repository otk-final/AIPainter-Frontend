import { Button, Tabs, TabsProps, message } from 'antd';
import React, { createRef, useEffect, useState } from 'react'
import './index.less'
import { Header } from '@/components';
import { useComfyUIRepository } from '@/repository/comfyui';
import { useGPTRepository } from '@/repository/gpt';
import { useTTSRepository } from '@/repository/tts';
import { useTranslateRepository } from '@/repository/translate';
import GPTSettingTab, { GPTSettingRef } from './components/gpt-setting';
import TTSSettingTab, { TTSSettingRef } from './components/tts-setting';
import TranslateSettingTab, { TranslateSettingRef } from './components/translate-setting';
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
  const gptRepo = useGPTRepository(state => state)
  const ttsRepo = useTTSRepository(state => state)
  const translateRepo = useTranslateRepository(state => state)

  useEffect(() => {
    comfyuiRepo.load("env")
    gptRepo.load("env")
    ttsRepo.load("env")
    translateRepo.load("env")
  }, [])


  const paintRef = createRef<ComfyUISettingRef>()
  const gptRef = createRef<GPTSettingRef>()
  const ttsRef = createRef<TTSSettingRef>()
  const translateRef = createRef<TranslateSettingRef>()

  const handleSave = async () => {
    if (cur === "paint") {
      await comfyuiRepo.reload(paintRef.current!.getConfiguration()).then(() => { message.success("保存成功") }).finally(() => history.back())
    } else if (cur === "gpt") {
      await gptRepo.reload(gptRef.current!.getConfiguration()).then(() => { message.success("保存成功") }).finally(() => history.back())
    } else if (cur === "tts") {
      await ttsRepo.reload(ttsRef.current!.getConfiguration()).then(() => { message.success("保存成功") }).finally(() => history.back())
    } else if (cur === "translate") {
      await translateRepo.reload(translateRef.current!.getConfiguration()).then(() => { message.success("保存成功") }).finally(() => history.back())
    }
  }


  return (
    <div className="setting-wrap">
      <Header
        renderLeft={<Tabs defaultActiveKey={cur} items={setTabItems} onChange={onChange} />}
        renderRight={<Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleSave}>保存设置</Button>}
      />
      {cur === 'paint' ? <ComfyUISettingTab ref={paintRef} name={cur} /> : null}
      {cur === 'gpt' ? <GPTSettingTab ref={gptRef} name={cur} /> : null}
      {cur === 'tts' ? <TTSSettingTab ref={ttsRef} name={cur} /> : null}
      {cur === 'translate' ? <TranslateSettingTab ref={translateRef} name={cur} /> : null}
    </div>
  );
};

export default SettingPage
