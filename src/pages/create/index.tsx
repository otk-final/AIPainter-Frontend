import { Button,  Select, Tabs, InputNumber } from 'antd';
import React, {useEffect, useState} from 'react'
import './index.less'
import { createTabs } from './data'
import { LeftOutlined } from '@ant-design/icons';
import {history} from "umi"
import Storyboard from './components/storyboard';
import Drawbatch from './components/drawbatch';
import Videogeneration from './components/videogeneration'
import {EnergyRechargeModule} from '@/components'

type CreateTabType = "storyboard" | "drawbatch" | "videogeneration"

const CreatePage:React.FC = () => {
  const [cur, setCur] = useState<CreateTabType>("storyboard");
  const [story, setStory] = useState({});
  const [isEnergyRechargeOpen, setIsEnergyRechargeOpen] = useState(false);
  const [hasScript, setHasScript] = useState(false);
  const [tabs, setTabs] = useState(createTabs)

  useEffect(()=>{
    if(hasScript) {
      let newRes = tabs?.map((i)=>{
        return {...i, disabled: false}
      })
      setTabs(newRes)
    }

  }, [hasScript])



  const onChange = (key: string) => {
      setCur(key as CreateTabType);
  };

  const handleSetRole = ()=>{
    history.push('/roleset')
  }
  const handleNext = ()=>{}

  const customButtons = ()=>{
    if(cur === 'storyboard') {
      return (
        <div className='flexR'>
          <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={()=>setIsEnergyRechargeOpen(true)}>充值能量</Button>
          <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleSetRole} disabled={!hasScript}>设置角色</Button>
          <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleNext} disabled={!hasScript}>下一步</Button>
        </div>
      )
    }else if(cur === 'drawbatch') {
      return (
        <div className='flexR'>
          <div className='flexR'>绘图起点 <InputNumber controls={false} style={{ width: "54px", marginLeft: '10px', marginRight: '10px'}} className="inputnumber-auto" placeholder='1' defaultValue={1}/> 镜</div> 
          <Button type="primary" className="btn-primary-auto btn-primary-108" >开始绘制</Button>
          <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleNext}>下一步</Button>
        </div>
      )
    }else {
      return (
        <div className='flexR'>
          <Button type="default" className="btn-default-auto btn-default-150" >打开图片文件夹</Button>
          <Select
              className={`select-auto`}
              style={{width: '200px', marginLeft: "20px"}}
              defaultValue="1"
              onChange={(v)=>{}}
              options={[
                { value: '1', label: '视频生成' },
                { value: '2', label: '视频生成sss' },
                { value: '3', label: 'sssss' },
              ]}
            />
          <Button type="primary" className="btn-primary-auto btn-primary-108" >合成视频</Button>
        </div>
      )
    }
  }


    return (
      <div className="create-wrap">
        <div className='page-header flexR'>
          <div className="flexR">
            <div className="nav-back" onClick={()=> history.back()}><LeftOutlined twoToneColor="#fff"/></div>
            <Tabs defaultActiveKey="paint" items={tabs} onChange={onChange} />
          </div>
          {customButtons()}
        </div>
        <div className='page-header-placeholder'></div>
        {cur === "storyboard" ? <Storyboard onCBScript={()=>{}} onCBHasScript={(v)=> setHasScript(v)}/>: null}
        {cur === 'drawbatch' ? <Drawbatch/> : null}
        {cur === "videogeneration" ? <Videogeneration/> : null}
        <EnergyRechargeModule isOpen={isEnergyRechargeOpen} onClose={()=> setIsEnergyRechargeOpen(false)}/>
      </div>
    );
  };
  
export default CreatePage
  