import { Button, Input, Select, Slider, Tabs, InputNumber, Switch } from 'antd';
import React, {useEffect, useState, Fragment} from 'react'
import './index.less'
import { createTabs } from './data'

import { LeftOutlined } from '@ant-design/icons';
import {history} from "umi"
import Storyboard from './storyboard';

type CreateTabType = "storyboard" | "batchdraw" | "videogeneration"

const CreatePage:React.FC = () => {
  const [cur, setCur] = useState<CreateTabType>("storyboard");
  const [story, setStory] = useState({})

  const onChange = (key: string) => {
      setCur(key as CreateTabType);
  };

  const handleCharge = ()=>{}
  const handleSetRole = ()=>{}
  const handleNext = ()=>{}

    return (
      <div className="create-wrap">
        <div className='page-header flexR'>
          <div className="flexR">
            <div className="nav-back" onClick={()=> history.back()}><LeftOutlined twoToneColor="#fff"/></div>
            <Tabs defaultActiveKey="paint" items={createTabs} onChange={onChange} />
          </div>
          <div className='flexR'>
            <Button type="primary" className="btn-primary-auto btn-primary-150" onClick={handleCharge}>充值能量</Button>
            <Button type="primary" className="btn-primary-auto btn-primary-150" onClick={handleSetRole}>设置角色</Button>
            <Button type="primary" className="btn-primary-auto btn-primary-150" onClick={handleNext}>下一步</Button>
          </div>
          
        </div>
        {cur === "storyboard" ? <Storyboard/>: null}
      </div>
    );
  };
  
export default CreatePage
  