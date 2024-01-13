import { Button, Select, Tabs, InputNumber } from 'antd';
import React, { useEffect, useState } from 'react'
import './index.less'
import { createTabs } from './data'
import { LeftOutlined } from '@ant-design/icons';
import { history, useParams } from "umi"
import Storyboard from './components/storyboard';
import Drawbatch from './components/drawbatch';
import Videogeneration from './components/videogeneration'
import { usePersistActorsStorage } from '@/stores/story';

type CreateTabType = "storyboard" | "drawbatch" | "videogeneration"



const CreatePage: React.FC<{ pid: string }> = ({ pid }) => {
  const [cur, setCur] = useState<CreateTabType>("storyboard");
  const [tabs, setTabs] = useState(createTabs)
  const { script, load } = usePersistActorsStorage(state => state)

  //加载配置项
  useEffect(() => {
    load(pid)
  }, [pid])


  //根据脚本判断可操作步骤
  useEffect(() => {
    //can change tabs
    if (script) {
      let newRes = tabs?.map((i) => {
        return { ...i, disabled: false }
      })
      setTabs(newRes)
    }
  }, [script])


  const handleSetRole = () => {
    history.push('/roleset/' + pid)
  }


  const customButtons = () => {
    if (cur === 'storyboard') {
      return (
        <div className='flexR'>
          {/* <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={() => setIsEnergyRechargeOpen(true)}>充值能量</Button> */}
          <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleSetRole} >设置角色</Button>
          <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={() => setCur("drawbatch")} disabled={!script}>下一步</Button>
        </div>
      )
    } else if (cur === 'drawbatch') {
      return (
        <div className='flexR'>
          <div className='flexR'>绘图起点 <InputNumber controls={false} style={{ width: "54px", marginLeft: '10px', marginRight: '10px' }} className="inputnumber-auto" placeholder='1' defaultValue={1} /> 镜</div>
          <Button type="primary" className="btn-primary-auto btn-primary-108" >开始绘制</Button>
          <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={() => setCur("videogeneration")}>下一步</Button>
        </div>
      )
    } else {
      return (
        <div className='flexR'>
          <Button type="default" className="btn-default-auto btn-default-150" >打开图片文件夹</Button>
          <Select
            className={`select-auto`}
            style={{ width: '200px', marginLeft: "20px" }}
            defaultValue="1"
            onChange={(v) => { }}
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
          <div className="nav-back" onClick={() => history.back()}><LeftOutlined twoToneColor="#fff" /></div>
          <Tabs defaultActiveKey="paint" items={tabs} onChange={(key) => setCur(key as CreateTabType)} />
        </div>
        {customButtons()}
      </div>
      <div className='page-header-placeholder'></div>
      {cur === "storyboard" ? <Storyboard pid='' /> : null}
      {cur === 'drawbatch' ? <Drawbatch /> : null}
      {cur === "videogeneration" ? <Videogeneration /> : null}
    </div>
  );
};


const StdProjectPage: React.FC = () => {
  const params = useParams()
  return <CreatePage pid={params.pid as string} />
}

export default StdProjectPage
