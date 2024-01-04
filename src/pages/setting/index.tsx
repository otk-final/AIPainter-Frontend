import { Button, Input, Select, Slider, Tabs, InputNumber, Switch } from 'antd';
import React, {useEffect, useState, Fragment} from 'react'
import './index.less'
import { setTabItems, PaintFormValueProps} from './data'
import PaintSetting from './paint-setting';
import BasicSetting from './basic-setting';
import { LeftOutlined } from '@ant-design/icons';

type setTabType = "paint" | "translate" | "basic"

const SettingPage = () => {
  const [cur, setCur] = useState<setTabType>("basic");

  const onChange = (key: string) => {
      setCur(key as setTabType);
  };

  const handleSave = ()=>{

  }

    return (
      <div className="setting-wrap">
        <div className='page-header flexR'>
          <div className="flexR">
            <div className="nav-back"><LeftOutlined twoToneColor="#fff"/></div>
            <Tabs defaultActiveKey="basic" items={setTabItems} onChange={onChange} />
          </div>
          <Button type="primary" className="setting-btn" onClick={handleSave}>保存设置</Button>
        </div>
        {cur === 'paint' ?<PaintSetting onCallBack={(v: PaintFormValueProps)=>{}}/> : null}
        {cur === "basic" ?<BasicSetting onCallBack={(v: PaintFormValueProps)=>{}}/> : null}
      </div>
    );
  };
  
export default SettingPage
  