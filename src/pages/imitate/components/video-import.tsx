import { Button, Modal, Progress, message } from 'antd';
import React, { useEffect, useState } from 'react'
import ReactPlayer from 'react-player';
import { dialog, event, tauri } from '@tauri-apps/api';
import { ImitateTabType } from '../index';
import VideoPlayerModal from './video-player';
import { useSimulateRepository } from '@/repository/simulate';
import { KeyFrame, useKeyFrameRepository } from '@/repository/keyframe';
import { useTTSRepository } from '@/repository/tts';
import { UnlistenFn } from '@tauri-apps/api/event';
import { CloseOutlined } from '@ant-design/icons';

interface VideoImportProps {
    pid: string
    handleChangeTab: (key: ImitateTabType) => void,
}
type CollectFrameType = "srt" | "fps"

interface CollectFrameProcess {
    title:string,
    except: number,
    completed: number
    current: any
}

const HandleCollectFramesProcess: React.FC<{ pid: string, title: string }> = ({ pid, title }) => {

    //状态
    const [stateProccess, setProccess] = useState<CollectFrameProcess | undefined>()

    let unlisten: UnlistenFn

    const register = async () => {
        //注册事件
        unlisten = await event.listen("key_frame_collect_process", (event) => {
            // console.info('event', event)
            setProccess(event.payload as CollectFrameProcess)
        })
    }

    //注册事件
    useEffect(() => {
        register()
        return () => { if (unlisten) unlisten() }
    }, [pid])

    if (!stateProccess) {
        return <div className='title'>{title}</div>
    }
    return <div className='title'>{stateProccess.title}<Progress percent={Math.floor((stateProccess.completed / stateProccess.except) * 100)} status="active" showInfo/></div>
}



const VideoImportTab: React.FC<VideoImportProps> = ({ pid, handleChangeTab }) => {

    const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
    const [secondConfirm, setSecondConfirm] = useState(false)
    const simulateRepo = useSimulateRepository(state => state)
    const keyFrameRepo = useKeyFrameRepository(state => state)
    const ttsRepo = useTTSRepository(state => state)
    const [isModalText, setIsModalText] = useState("");


    const handleImported = async () => {
        let selected = await dialog.open({
            title: '选择视频文件'
        })
        if (!selected) {
            return
        }
        setIsModalText("正在导入视频提取音频...")
        await simulateRepo.handleImportVideo(selected as string).catch(err => message.error(err))
        .finally(()=>{
            setIsModalText("")
            }
        )
    }


    const handleCollectFrames = async (type: CollectFrameType) => {
        setIsModalText("正在抽取关键帧...")

        //抽帧，导入，切换tab
        let keyFrames = [] as KeyFrame[]
        if (type === "fps") {
            //按秒
            keyFrames = await simulateRepo.handleCollectFramesWithFps()
        } else if (type === "srt") {
            //按音频
            let api = await ttsRepo.newClient()
            keyFrames = await simulateRepo.handleCollectFrames(api)
        }
        await keyFrameRepo.initialization(keyFrames).then(() => { handleChangeTab("frames") }).catch(err => message.error(err))
        .finally(()=>{
            setIsModalText("")
        })
    }

    const handleCollectAudio = async () => {
        let savePath = await dialog.save({ title: "导出音频文件", filters: [{ extensions: ["mp3"], name: "音频文件" }] })
        if (!savePath) {
            return
        }
        await simulateRepo.handleExportVideo(savePath).catch(err => message.error(err)).finally(Modal.destroyAll)
    }

    
    const renderModal = ()=>{
        return (
            <div className='auto-modal'>
                {!secondConfirm ? <div className='content'>
                    <CloseOutlined className='close' onClick={()=>setSecondConfirm(true)}/>
                    <HandleCollectFramesProcess pid={pid} title={isModalText} />
                </div> : null}
                {
                    secondConfirm ? (
                        <div className='content'>
                            <CloseOutlined className='close' onClick={()=>setSecondConfirm(false)}/>
                            <div className='title'>确认要终止任务吗？</div>
                            <div className='btn-wrap flexR'>
                                <Button type="default" className="btn-default-auto btn-default-100" style={{ width: '130px' }} onClick={()=> {setIsModalText(""); setSecondConfirm(false)}} >确认</Button>
                                <Button type="primary" className="btn-primary-auto btn-primary-108" style={{ width: '130px' }} onClick={() => setSecondConfirm(false)}>取消</Button>
                            </div>
                        </div>
                    ): null
                }
            </div>
        )
    }


    return (
        <div className="generate-image-wrap">
            <div className='flexR'>
                <div>请导入视频：</div>
                <Button type="default" className="btn-default-auto btn-default-100" onClick={handleImported} >导入</Button>
                <Button type="primary" className="btn-primary-auto btn-primary-108" style={{ width: '130px' }} disabled={!simulateRepo.videoPath} onClick={() => { handleCollectFrames("srt") }}>抽帧关键帧</Button>
                <Button type="primary" className="btn-primary-auto btn-primary-108" style={{ width: '100px' }} disabled={!simulateRepo.videoPath} onClick={handleCollectAudio}>导出音频</Button>
            </div>

            {simulateRepo.videoPath &&
                <div className='video-wrap' onClick={() => setIsVideoPlayerOpen(true)}>
                    <ReactPlayer url={tauri.convertFileSrc(simulateRepo.videoPath!)}
                        width="200px"
                        height="200px"
                        style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '6px' }}
                    />
                    {/* {payload && <div className='time'>{getTime(payload.streams[0].duration_ts)}</div>}
                <div className='video-name'>{videoPath?.split('/').pop()}</div> */}
                </div>}
            {isVideoPlayerOpen && <VideoPlayerModal videoPath={simulateRepo.videoPath!} isOpen={isVideoPlayerOpen} onClose={() => setIsVideoPlayerOpen(false)} />}
            {isModalText ?  renderModal() : null}
        </div>
    );
};

export default VideoImportTab
