import { Button, Tabs, TabsProps, message } from 'antd';
import { createRef, useEffect, useState } from 'react'
import './index.less'
import { Header } from '@/components';
import { useJYDraftRepository } from '@/repository/draft';
import ExportSettingTab, { ExportSettingRef } from './components/export-setting';

type setTabType = "export" | "download"

export const setTabItems: TabsProps['items'] = [
  {
    key: 'export',
    label: '导出设置',
  },
  {
    key: 'download',
    label: '下载设置',
  }
];

const JYDraftPage = () => {

  const [cur, setCur] = useState<setTabType>("export");
  const onChange = (key: string) => {
    setCur(key as setTabType);
  };

  const draftRepo = useJYDraftRepository(state => state)

  useEffect(() => {
    draftRepo.load("env")
  }, [])

  const settingRef = createRef<ExportSettingRef>()
  const handleSave = async () => {
    await draftRepo.reload(settingRef.current!.getConfiguration()).then(() => { message.success("保存成功") }).finally(() => history.back())
  }

  return (
    <div className="setting-wrap">
      <Header
        renderLeft={<Tabs defaultActiveKey={cur} items={setTabItems} onChange={onChange} />}
        renderRight={<Button type="primary" className="btn-primary-auto btn-primary-88" onClick={handleSave}>保存设置</Button>}
      />
      {cur === "export" ? <ExportSettingTab ref={settingRef} name="" /> : null}
    </div>
  );
}

export default JYDraftPage
