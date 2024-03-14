import { Button, Modal, Select, Switch, message } from "antd"
import { Fragment, useEffect, useState } from "react";
import { mixingColumns } from "../data";
import TextArea from "antd/es/input/TextArea";
import { Chapter, useChapterRepository } from "@/repository/chapter";
import { useActorRepository } from "@/repository/actor";
import { EFFECT_DIRECTIONS } from "@/repository/draft";
import { AssetImage } from "@/components/history-image";
import ButtonGroup from "antd/es/button/button-group";
import VideoPlayerModal from "@/pages/imitate/components/video-player";
import { SoundFilled } from "@ant-design/icons";
import { AudioOption } from "@/api/bytedance_api";

interface MixingTableTRProps {
    index: number,
    chapter: Chapter,
    audio: AudioOption
    style: React.CSSProperties,
    key: string
}

const MixingTableTR: React.FC<MixingTableTRProps> = ({ index, chapter, style, key, audio }) => {

    //页面级状态
    const [stateChapter, setChapter] = useState<Chapter>({ ...chapter })
    const chapterRepo = useChapterRepository(state => state)
    const actorRepo = useActorRepository(state => state)

    useEffect(() => {
        const unsub = useChapterRepository.subscribe(
            (state) => state.items[index],
            (state, prev) => setChapter(state),
            { fireImmediately: true })
        return unsub
    }, [index, chapter])

    const handleChangeEffect = async (e: string) => {
        await chapterRepo.updateItem(index, { ...stateChapter, effect: { ...stateChapter.effect, orientation: e } }, false)
    }

    const renderNumber = () => {
        return (
            <Fragment>
                <div className='index'>{index + 1}</div>
                <Select
                    className={`select-auto`}
                    style={{ width: '100px' }}
                    value={stateChapter.effect.orientation}
                    onChange={handleChangeEffect}
                    options={EFFECT_DIRECTIONS}
                />
            </Fragment >
        )
    }

    const handleEditSRT = async (e: any) => {
        await chapterRepo.updateItem(index, { ...stateChapter, srt: e.target.value }, false)
    }
    const renderEditSRT = () => {
        return (
            <TextArea rows={6} placeholder={"请输入剧本字幕"}
                maxLength={1000} className="text-area-auto"
                value={stateChapter.srt}
                onChange={handleEditSRT} />
        )
    }

    const [isOpen, setOpen] = useState<boolean>(false)
    const [playerUrl, setPlayerUrl] = useState<string | undefined>()

    const hanldePlayer = async (path: string) => {
        setOpen(true)
        setPlayerUrl(await chapterRepo.absulotePath(path))
    }


    const handleGenerateAudio = async () => {

        //默认配置
        Modal.info({
            content: <div style={{ color: '#fff' }}>生成音频...</div>,
            footer: null,
            mask: true,
            maskClosable: false,
        })
        //音频接口
        let path = await chapterRepo.handleGenerateAudio(index, audio, actorRepo).catch(err => message.error(err.message)).finally(Modal.destroyAll)

        //播放
        hanldePlayer(path as string)
    }

    // const handleGenerateVideo = async () => {
    //     Modal.info({
    //         content: <div style={{ color: '#fff' }}>合成视频...</div>,
    //         footer: null,
    //         mask: true,
    //         maskClosable: false,
    //     })
    //     let path = await chapterRepo.handleGenerateVideo(index, draftRepo).catch(err => message.error(err.message)).finally(Modal.destroyAll)

    //     hanldePlayer(path as string)
    // }


    const handleChooseActor = async (checked: boolean, actor: string) => {
        await chapterRepo.updateItem(index, { ...stateChapter, srt_actor: checked ? actor : "" }, false)
    }

    const renderActors = () => {
        return (
            <Fragment>
                {stateChapter.actors.map((item, idx) => {
                    return (
                        <div className="role-wrap flexR" key={idx}>
                            <div>角色{idx + 1}: <span className="">{item}</span></div>
                            <Switch className="switch-auto" onChange={(checked) => { handleChooseActor(checked, item) }} checked={item === stateChapter.srt_actor} />
                        </div>
                    )
                })}
            </Fragment>
        )
    }

    const renderOperate = () => {
        return (
            <Fragment>
                <ButtonGroup>
                    <Button type='default' className='btn-default-auto btn-default-98' onClick={handleGenerateAudio} disabled={!stateChapter.srt}>生成音频</Button>
                    <Button type='default' className='btn-default-auto btn-default-98' onClick={() => hanldePlayer(stateChapter.srt_audio_path!)} disabled={!stateChapter.srt_audio_path} icon={<SoundFilled />}>播放</Button>
                </ButtonGroup>
                {/* <ButtonGroup>
                    <Button type='default' className='btn-default-auto btn-default-98' onClick={handleGenerateVideo} disabled={!(stateChapter.srt_audio_path && stateChapter.image.path)}>生成视频</Button>
                    <Button type='default' className='btn-default-auto btn-default-98' onClick={() => hanldePlayer(stateChapter.srt_video_path!)} disabled={!stateChapter.srt_video_path} icon={<CameraFilled />}>播放</Button>
                </ButtonGroup> */}
            </Fragment>
        )
    }

    return (
        <div className='list-tr flexR' style={style} key={key}>
            {stateChapter && mixingColumns.map((i, index) => {
                return (
                    <div className='list-td script-id flexC' key={i.key + index} style={{ flex: `${i.space}` }}>
                        {i.key === 'number' ? renderNumber() : null}
                        {i.key === 'draft' ? stateChapter.draft : null}
                        {i.key === 'actors' ? renderActors() : null}
                        {i.key === 'image' && <AssetImage path={stateChapter.image.path} repo={chapterRepo} />}
                        {i.key === 'srt' ? renderEditSRT() : null}
                        {i.key === 'operate' ? renderOperate() : null}
                    </div>
                )
            })}
            {(isOpen && playerUrl) && <VideoPlayerModal videoPath={playerUrl} isOpen={isOpen} onClose={() => setOpen(false)} />}
        </div>
    )
}

export default MixingTableTR