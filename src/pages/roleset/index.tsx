import { Avatar, Button, Input, Modal, message } from 'antd';
import './index.less'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import React, { useEffect, useMemo, useState } from 'react';
import { dialog, tauri } from '@tauri-apps/api';
import { history, useParams } from "umi"
import { Header } from '@/components';
import { Actor, useActorRepository } from '@/repository/story';
import { useComfyUIRepository } from '@/repository/comfyui';
import TagModalContent from './components/tags-modal';
import { v4 as uuid } from "uuid"



interface RoleItemProps {
  index: number,
  actor: Actor,
  handleEdit: (index: number, actor: Actor) => void
}

export const RoleItem: React.FC<RoleItemProps> = ({ index, actor, handleEdit }) => {

  const [stateActor, setActor] = useState<Actor>({ ...actor })
  const actorRepo = useActorRepository(state => state)

  //删除
  const handleDel = async () => {
    let ok = await dialog.ask("确认删除角色?", { title: "删除角色?", type: "warning" })
    if (!ok) {
      return
    }
    await actorRepo.delItem(index, true)
  }

  //更新
  useMemo(() => {
    actorRepo.assignItem(index, { name: stateActor.name, alias: stateActor.alias })
  }, [stateActor])




  return (
    <div className='role-item'>
      <div className='top flexR'>
        {stateActor.image && <Avatar src={tauri.convertFileSrc(stateActor.image)} size={'large'}></Avatar>}
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
          <div className='flexC role-tags-wrap' onClick={() => handleEdit(index, { ...stateActor })}>
            <PlusOutlined className="add-icon" />
            <div>请选择角色行的描述标签</div>
          </div>
        </div>
      </div>
      <div className='content-title' style={{ marginTop: '20px', marginBottom: '10px' }}>角色配音</div>
      <Button type='default' block className='btn-default-auto' > 添加角色配音</Button>
    </div>
  )
}


const RoleSetPage: React.FC<{ pid: string }> = ({ pid }) => {

  //当前项目配置
  let actorRepo = useActorRepository(state => state)
  let comfyuiRepo = useComfyUIRepository(state => state)


  useEffect(() => {

    actorRepo.load(pid)
    comfyuiRepo.load("env")

    //保存
    return () => { debugger; actorRepo.sync() }
  }, [pid])


  const addActorHandle = async () => {
    let no = actorRepo.items.length + 1
    await actorRepo.appendItem({ id: uuid(), name: "角色" + no, alias: "别名" + no, traits: [], style: "", image: "" }, true)
  }


  const renderHeaderRight = () => {
    return (
      <div className='flexR'>
        <Button type="primary" className="btn-primary-auto btn-primary-108" onClick={addActorHandle}>新增角色</Button>
      </div>
    )
  }

  const [isOpen, setOpen] = useState<boolean>(false)
  const [displayActor, setDisplayActor] = useState<Actor>();
  const [displayIndex, setDisplayIndex] = useState<number>(0);

  const handleEdit = (index: number, actor: Actor) => {
    setDisplayIndex(index)
    setDisplayActor(actor)
    setOpen(true)
  }


  return (
    <div className="roleset-wrap">

      <Header renderRight={renderHeaderRight()} />
      <div className='sub-text'>建议角色设置不要超过2个,如剧本中无固定角色可跳过该步骤。SD在同画面的出现多个角色时，识别能力较差。同画面多人指定角色形象的功能在开发中。</div>
      <div className='roles-wrap flexR'>
        {actorRepo.items.map((actor, index) => {
          return <RoleItem actor={actor} index={index} key={actor.id} handleEdit={handleEdit} />
        })}
      </div>
      <Modal title="提示词生成器"
        open={isOpen}
        onCancel={() => setOpen(false)}
        footer={null}
        width={1160}
        className="home-login-modal role-tags-modal"
      >
        {displayActor && <TagModalContent index={displayIndex} actor={displayActor} handleClose={() => setOpen(false)}></TagModalContent>}
      </Modal>
    </div>
  );
}


const RoleProjectPage: React.FC = () => {
  const params = useParams()
  return <RoleSetPage pid={params.pid as string} />
}

export default RoleProjectPage
