import { Button, Input, message } from 'antd';
import './index.less'
import { history } from "umi"
import { DeleteOutlined, FormOutlined, LeftOutlined, PlusOutlined } from '@ant-design/icons';
import { useState } from 'react';
import TagModal from './components/tags-modal';




interface RoleItemProps {
  data: any,
  index: number
}

const RoleItem: React.FC<RoleItemProps> = ({ data, index }) => {
  const [isTagsOpen, setIsTagsOpen] = useState(false);

  return (
    <div className='role-item'>
      <div className='top flexR'>
        <div className='text'>角色{index}</div>
        <DeleteOutlined />
      </div>
      <div className='content flexR'>
        <div className='content-i  flexC'>
          <div className='RB flexR'>
            <div className='content-title'>角色姓名</div>
            <div className='num'>/50</div>
          </div>
          <Input size="large" className='input' />
          <div className='RB flexR'>
            <div className='content-title'>角色别名</div>
            <div className='num'>/50</div>
          </div>
          <Input size="large" className='input' />
        </div>
        <div className='content-i flexC'>
          <div className='RB flexR'>
            <div className='content-title'>角色描述</div>
            <FormOutlined />
          </div>
          <div className='flexC role-tags-wrap' onClick={() => setIsTagsOpen(true)}>
            <PlusOutlined className="add-icon" />
            <div>请选择角色行的描述标签</div>
          </div>
        </div>
      </div>
      <div className='content-title' style={{ marginTop: '20px', marginBottom: '10px' }}>角色风格</div>
      <Button type='default' block className='btn-default-auto' > 添加LoRA（风格）</Button>
      <TagModal isOpen={isTagsOpen} onClose={() => { setIsTagsOpen(false) }} />
    </div>
  )
}

const RoleSetPage = () => {
  const [roles, setRoles] = useState([{
    familyName: "",
    nikeName: "",
    style: '',
    describe: ''
  }]);

  const handleConfirm = () => {
    
  }

  const handleAdd = () => {
    roles.push({})
  }



  return (
    <div className="roleset-wrap">
      <div className='page-header flexR'>
        <div className="flexR">
          <div className="nav-back" onClick={() => history.back()}><LeftOutlined twoToneColor="#fff" /></div>
        </div>
        <div className='flexR'>
          <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleAdd}>新增角色</Button>
          <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleSave}>保存</Button>
        </div>
      </div>
      <div className='page-header-placeholder'></div>
      <div className='sub-text'>建议角色设置不要超过2个,如剧本中无固定角色可跳过该步骤。SD在同画面的出现多个角色时，识别能力较差。同画面多人指定角色形象的功能在开发中。</div>
      <div className='roles-wrap flexR'>
        {roles.map((i, index) => {
          return <RoleItem data={i} index={index} key={index} />
        })}
      </div>
    </div>
  );
}

export default RoleSetPage