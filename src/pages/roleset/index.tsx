import { Button, Input, message } from 'antd';
import './index.less'
import { history } from "umi"
import { DeleteOutlined, FormOutlined, LeftOutlined, PlusOutlined } from '@ant-design/icons';
import { Ref, createRef, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import TagModal from './components/tags-modal';
import { Actor, usePersistScriptStorage } from '@/stores/story';




interface RoleItemProps {
  actor: Actor,
  index: number,
  onChange: (index: number, actor: Actor) => void
}

export const RoleItem: React.FC<RoleItemProps> = ({ actor, index, onChange }) => {

  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [stateActor, setActor] = useState<Actor>({ ...actor })

  const handleChangeFeatures = (checkedTags: any[]) => {
    let newActor = { ...stateActor, features: checkedTags }
    setActor(newActor)
    setIsTagsOpen(false)

    onChange(index, newActor)
  }
  const handleChangeName = (e: any) => {
    let newActor = { ...stateActor, name: e.target.value }

    // setActor({ ...stateActor, name: e.target.value })
    setActor(newActor)
    onChange(index, newActor)
  }
  const handleChangeAlias = (e: any) => {
    let newActor = { ...stateActor, alias: e.target.value }
    // setActor({ ...stateActor, alias: e.target.value })
    setActor(newActor)
    onChange(index, newActor)
  }

  return (
    <div className='role-item'>
      <div className='top flexR'>
        <div className='text'>角色{index + 1}</div>
        <DeleteOutlined />
      </div>
      <div className='content flexR'>
        <div className='content-i  flexC'>
          <div className='RB flexR'>
            <div className='content-title'>角色姓名</div>
            <div className='num'>/50</div>
          </div>
          <Input size="large" className='input' value={stateActor.name} onChange={handleChangeName} />
          <div className='RB flexR'>
            <div className='content-title'>角色别名</div>
            <div className='num'>/50</div>
          </div>
          <Input size="large" className='input' value={stateActor.alias} onChange={handleChangeAlias} />
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
      {isTagsOpen && <TagModal isOpen={isTagsOpen} initTags={stateActor.features} onClose={() => { setIsTagsOpen(false) }} onConfirm={handleChangeFeatures} />}
    </div>
  )
}


const RoleSetPage = () => {


  //临时
  let storeActors = usePersistScriptStorage(state => state.actors)
  const [tempActors, setTempActors] = useState<Actor[]>(() => {
    if (storeActors.length === 0) {
      return [{ name: '', alias: '', style: '', features: [] }]
    }
    return [...storeActors]
  })


  //新增
  const handleAdd = () => {
    tempActors.push({ name: '', alias: '', style: '', features: [] })
    setTempActors([...tempActors])
  }

  //保存
  const handleItemChange = async (index: number, actor: Actor) => {
    tempActors[index] = actor
  }

  const handleConfirm = async () => {
    debugger
  }

  return (
    <div className="roleset-wrap">
      <div className='page-header flexR'>
        <div className="flexR">
          <div className="nav-back" onClick={() => history.back()}><LeftOutlined twoToneColor="#fff" /></div>
        </div>
        <div className='flexR'>
          <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleAdd}>新增角色</Button>
          <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={handleConfirm}>保存</Button>
        </div>
      </div>
      <div className='page-header-placeholder'></div>
      <div className='sub-text'>建议角色设置不要超过2个,如剧本中无固定角色可跳过该步骤。SD在同画面的出现多个角色时，识别能力较差。同画面多人指定角色形象的功能在开发中。</div>
      <div className='roles-wrap flexR'>
        {tempActors.map((actor, index) => {
          return <RoleItem actor={actor} index={index} key={index} onChange={handleItemChange} />
        })}
      </div>
    </div>
  );
}

export default RoleSetPage