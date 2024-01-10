import { Button, message } from 'antd';
import './index.less'
import {history} from "umi"
import { LeftOutlined } from '@ant-design/icons';
import { useState } from 'react';
import RoleItem from './role-item';


const RoleSetPage = () => {
  const [roles, setRoles] = useState([{
    familyName: "",
    nikeName: "",
    style: '',
    describe: ''
  }]);

  const handleSave = ()=>{

  }

  const handleAdd = ()=>{
    if(roles.length > 4) {
      message.warning("建议角色设置不要超过2个哦～")
    }else {
      setRoles((res)=> {
        return [...res, {}]
      })
    }
  }



  return (
    <div className="roleset-wrap">
      <div className='page-header flexR'>
          <div className="flexR">
            <div className="nav-back" onClick={()=> history.back()}><LeftOutlined twoToneColor="#fff"/></div>
          </div>
          <div className='flexR'>
            <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleAdd}>新增角色</Button>
            <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleSave}>保存</Button>
          </div>
      </div>
      <div className='page-header-placeholder'></div>
      <div className='sub-text'>建议角色设置不要超过2个,如剧本中无固定角色可跳过该步骤。SD在同画面的出现多个角色时，识别能力较差。同画面多人指定角色形象的功能在开发中。</div>
      <div className='roles-wrap flexR'>
        {roles.map((i, index)=>{
          return <RoleItem data={i} index={index} key={index}/>
        })}
      </div>
    </div>
  );
}

export default RoleSetPage