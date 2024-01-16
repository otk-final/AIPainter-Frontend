import { Button, Input, message } from 'antd';
import './index.less'
import { history } from "umi"
import { DeleteOutlined, LeftOutlined, PlusOutlined } from '@ant-design/icons';
import { useEffect, useRef, useState } from 'react';
import TagModal from './components/tags-modal';
import { Actor, usePersistActorsStorage } from '@/stores/story';
import { dialog } from '@tauri-apps/api';




interface RoleItemProps {
  actor: Actor,
  index: number,
}

export const RoleItem: React.FC<RoleItemProps> = ({ actor, index }) => {

  console.info("init actor", index, actor)
  const [isOpen, setOpen] = useState(false);
  const [stateActor, setActor] = useState<Actor>(actor)
  const { updateActor, removeActor } = usePersistActorsStorage(state => state)

  const isMountRef = useRef(true)
  useEffect(() => {
    console.info("useEffect", index, stateActor)
    if (isMountRef.current) {
      isMountRef.current = false
      return
    }
    updateActor(index, stateActor)
  }, [stateActor])


  const handleDel = async () => {
    let ok = await dialog.ask("确认删除角色?", { title: "删除角色?", type: "warning" })
    if (!ok) {
      return
    }
    await removeActor(index)
  }

  return (
    <div className='role-item'>
      <div className='top flexR'>
        <div className='text'>角色{index + 1}</div>
        <DeleteOutlined onClick={handleDel} />
      </div>
      <div className='content flexR'>
        <div className='content-i  flexC'>
          <div className='RB flexR'>
            <div className='content-title'>角色姓名</div>
            <div className='num'>/50</div>
          </div>
          <Input size="large" className='input' value={stateActor.name} onChange={(e) => { setActor({ ...stateActor, name: e.target.value }) }} />
          <div className='RB flexR'>
            <div className='content-title'>角色别名</div>
            <div className='num'>/50</div>
          </div>
          <Input size="large" className='input' value={stateActor.alias} onChange={(e) => { setActor({ ...stateActor, alias: e.target.value }) }} />
        </div>
        <div className='content-i flexC'>
          <div className='RB flexR'>
            <div className='content-title'>角色描述</div>
          </div>
          <div className='flexC role-tags-wrap' onClick={() => setOpen(true)}>
            <PlusOutlined className="add-icon" />
            <div>请选择角色行的描述标签</div>
          </div>
        </div>
      </div>
      <div className='content-title' style={{ marginTop: '20px', marginBottom: '10px' }}>角色风格</div>
      <Button type='default' block className='btn-default-auto' > 添加LoRA（风格）</Button>
      {isOpen && <TagModal isOpen={isOpen}
        initTags={stateActor.traits}
        onClose={() => { setOpen(false) }}
        onConfirm={(traits) => {
          setActor({ ...stateActor, traits: traits })
          setOpen(false)
        }} />}
    </div>
  )
}


const RoleSetPage = () => {

  //当前项目配置
  let { actors, addActor, saveActors } = usePersistActorsStorage(state => state)
  const saveActorsHandle = () => {
    saveActors(actors).then(() => { message.success("保存成功") }).finally(() => { history.back() })
  }



  return (
    <div className="roleset-wrap">
      <div className='page-header flexR'>
        <div className="flexR">
          <div className="nav-back" onClick={() => history.back()}><LeftOutlined twoToneColor="#fff" /></div>
        </div>
        <div className='flexR'>
          <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={addActor}>新增角色</Button>
          <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={saveActorsHandle}>保存</Button>
        </div>
      </div>
      <div className='page-header-placeholder'></div>
      <div className='sub-text'>建议角色设置不要超过2个,如剧本中无固定角色可跳过该步骤。SD在同画面的出现多个角色时，识别能力较差。同画面多人指定角色形象的功能在开发中。</div>
      <div className='roles-wrap flexR'>
        {actors.map((actor, index) => {
          return <RoleItem actor={actor} index={index} key={actor.id + index} />
        })}
      </div>
    </div>
  );
}

export default RoleSetPage