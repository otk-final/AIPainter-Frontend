import { Avatar, Button, Input } from 'antd';
import './index.less'
import { DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import React, { useEffect, useMemo, useState } from 'react';
import tauri, { convertFileSrc } from '@tauri-apps/api/core';
import { useParams } from "umi"
import { Header } from '@/components';
import { Actor, useActorRepository } from '@/repository/actor';
import { useComfyUIRepository } from '@/repository/comfyui';
import { v4 as uuid } from "uuid"
import { AudioOption, DEFAULT_AUDIO_OPTION } from '@/api/bytedance_api';
import { TTSVoiceModal } from '@/components/voice-select';
import { TagModal } from './components/tags-modal';
import { ask } from '@tauri-apps/plugin-dialog';




interface RoleItemProps {
  index: number,
  actor: Actor,
}

export const RoleItem: React.FC<RoleItemProps> = ({ index, actor }) => {

  const [stateActor, setActor] = useState<Actor>({ ...actor })
  const [statePreviewImage, setPreviewImage] = useState<string | undefined>()
  const actorRepo = useActorRepository(state => state)


  const [tagOpen, setTagOpen] = useState<boolean>(false)
  const [audioOpen, setAudioOpen] = useState<boolean>(false)

  useMemo(() => {
    const unsub = useActorRepository.subscribe(
      (state) => state.items[index],
      async (state) => {
        if (state) {
          setActor(state)
          if (state.image) setPreviewImage(await actorRepo.absulotePath(state.image))
        }
      },
      {
        fireImmediately: true
      })
    return unsub
  }, [index])


  //删除
  const handleDel = async () => {
    let ok = await ask("确认删除角色?", { title: "删除角色?", kind: "warning" })
    if (!ok) {
      return
    }
    await actorRepo.delItem(index, true)
  }

  const handleEditVoice = async (option: AudioOption) => {
    await actorRepo.updateItem(index, { ...stateActor, voice: option }, false).finally(() => setAudioOpen(false))
  }
  const handleEditName = async (e: any) => {
    await actorRepo.updateItem(index, { ...stateActor, name: e.target.value }, false)
  }
  const handleEditAlias = async (e: any) => {
    await actorRepo.updateItem(index, { ...stateActor, alias: e.target.value }, false)
  }
  const handleEdit = async (newActor: Actor) => {
    await actorRepo.updateItem(index, { ...newActor }, false).finally(() => setTagOpen(false))
  }

  return (
    <div className='role-item'>
      <div className='top flexR'>
        {statePreviewImage && <Avatar src={convertFileSrc(statePreviewImage)} size={'large'}></Avatar>}
        <div className='text'>角色{index + 1}</div>
        <DeleteOutlined onClick={handleDel} />
      </div>
      <div className='content flexR'>
        <div className='content-i  flexC'>
          <div className='content-title'>角色姓名</div>
          <Input size="large" className='input' value={stateActor.name} onChange={handleEditName} />
          <div className='content-title'>角色别名</div>
          <Input size="large" className='input' value={stateActor.alias} onChange={handleEditAlias} />
          <div className='content-title'>角色配音</div>
          <Button type="primary" className="btn-primary-auto" style={{height: '40px', width: '100%'}}
           onClick={() => { setAudioOpen(true) }}>音频设置</Button>
        </div>

        <div className='content-i flexC'>
          <div className='content-title'>角色描述</div>
          <div className='flexC role-tags-wrap' onClick={() => { setTagOpen(true) }}>
            <PlusOutlined className="add-icon" />
            <div>请选择角色行的描述标签</div>
          </div>
        </div>
      </div>

      {tagOpen && <TagModal isOpen={tagOpen} setOpen={setTagOpen} actor={stateActor} onChange={handleEdit} />}
      {audioOpen && <TTSVoiceModal isOpen={audioOpen} setOpen={setAudioOpen} audio={stateActor.voice!} onChange={handleEditVoice} />}

    </div>
  )
}


const RoleSetPage: React.FC<{ pid: string }> = ({ pid }) => {

  //当前项目配置
  const actorRepo = useActorRepository(state => state)
  const comfyuiRepo = useComfyUIRepository(state => state)


  //加载数据
  useEffect(() => {
    comfyuiRepo.load("env")
    actorRepo.load(pid)
    return () => { actorRepo.sync() }
  }, [pid])


  const addActorHandle = async () => {
    let no = actorRepo.items.length + 1
    await actorRepo.appendItem({ id: uuid(), name: "角色" + no, alias: "别名" + no, style: "", traits: [], voice: { ...DEFAULT_AUDIO_OPTION } }, true)
  }


  const renderHeaderRight = () => {
    return (
      <div className='flexR'>
        <Button type="primary" className="btn-primary-auto btn-primary-88" onClick={addActorHandle}>新增角色</Button>
      </div>
    )
  }

  return (
    <div className="roleset-wrap">

      <Header renderRight={renderHeaderRight()} />
      <div className='sub-text'>建议角色设置不要超过2个,如剧本中无固定角色可跳过该步骤。SD在同画面的出现多个角色时，识别能力较差。同画面多人指定角色形象的功能在开发中。</div>
      <div className='roles-wrap flexR'>
        {actorRepo.items.map((actor, index) => {
          return <RoleItem actor={actor} index={index} key={actor.id} />
        })}
      </div>

    </div>
  );
}


const RoleProjectPage: React.FC = () => {
  const params = useParams()
  return <RoleSetPage pid={params.pid as string} />
}

export default RoleProjectPage
