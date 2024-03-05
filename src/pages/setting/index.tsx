import { Button, Tabs, TabsProps, message } from 'antd';
import React, { createRef, useEffect, useState } from 'react'
import './index.less'
import PaintSetting, { PaintSettingRef } from './components/paint-setting';
import BasicSetting, { BasicSettingRef } from './components/basic-setting';
import { Header } from '@/components';
import { useComfyUIRepository } from '@/repository/comfyui';
import { useBaisicSettingRepository } from '@/repository/setting';
import GPTSetting, { GPTSettingRef } from './components/gpt-setting';
import TTSSetting, { TTSSettingRef } from './components/tts-setting';
import { useGPTRepository } from '@/repository/gpt';
import { useTTSRepository } from '@/repository/tts';
import TranslateSetting, { TranslateSettingRef } from './components/translate-setting';
import { useTranslateRepository } from '@/repository/translate';

type setTabType = "paint" | "translate" | "basic" | "gpt" | "tts"

export const setTabItems: TabsProps['items'] = [
  {
    key: 'basic',
    label: '基础设置',
  },
  {
    key: 'paint',
    label: '绘图设置',
  },
  {
    key: 'gpt',
    label: 'GPT设置',
  },
  {
    key: 'tts',
    label: '音频设置',
  },
  {
    key: 'translate',
    label: '翻译设置',
  }
];

const SettingPage = () => {

  const [cur, setCur] = useState<setTabType>("basic");
  const onChange = (key: string) => {
    setCur(key as setTabType);
  };



  const comfyuiRepo = useComfyUIRepository(state => state)
  const basicRepo = useBaisicSettingRepository(state => state)
  const gptRepo = useGPTRepository(state => state)
  const ttsRepo = useTTSRepository(state => state)
  const translateRepo = useTranslateRepository(state => state)

  useEffect(() => {
    comfyuiRepo.load("env")
    basicRepo.load("env")
    gptRepo.load("env")
    ttsRepo.load("env")
    translateRepo.load("env")
  }, [])


  const paintRef = createRef<PaintSettingRef>()
  const basicRef = createRef<BasicSettingRef>()
  const gptRef = createRef<GPTSettingRef>()
  const ttsRef = createRef<TTSSettingRef>()
  const translateRef = createRef<TranslateSettingRef>()

  const handleSave = async () => {
    if (cur === "paint") {
      await comfyuiRepo.reload(paintRef.current!.getConfiguration()).then(() => { message.success("保存成功") }).finally(() => history.back())
    } else if (cur === "basic") {
      await basicRepo.reload(basicRef.current!.getConfiguration()).then(() => { message.success("保存成功") }).finally(() => history.back())
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
      {cur === "basic" ? <BasicSetting ref={basicRef} name="" /> : null}
      {cur === 'paint' ? <PaintSetting ref={paintRef} name="" /> : null}
      {cur === 'gpt' ? <GPTSetting ref={gptRef} name="" /> : null}
      {cur === 'tts' ? <TTSSetting ref={ttsRef} name="" /> : null}
      {cur === 'translate' ? <TranslateSetting ref={translateRef} name="" /> : null}
    </div>
  );
};

export default SettingPage
