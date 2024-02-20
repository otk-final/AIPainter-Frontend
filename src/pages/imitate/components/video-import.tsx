import { Button, Modal, Progress, message } from 'antd';
import React, { Fragment, useEffect, useState } from 'react'
import ReactPlayer from 'react-player';
import { dialog, event, tauri } from '@tauri-apps/api';
import { ImitateTabType } from '../index';
import VideoPlayerModal from './video-player';
import { useSimulateRepository } from '@/repository/simulate';
import { KeyFrame, useKeyFrameRepository } from '@/repository/keyframe';
import { useTTSRepository } from '@/repository/tts';
import { UnlistenFn } from '@tauri-apps/api/event';

interface VideoImportProps {
    pid: string
    handleChangeTab: (key: ImitateTabType) => void,
}
type CollectFrameType = "srt" | "fps"

interface CollectFrameProcess {
    except: number,
    completed: number
    current: any
}

const HandleCollectFramesProcess: React.FC<{ pid: string }> = ({ pid }) => {

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
        return <div style={{ color: '#fff' }}>正在抽取关键帧...</div>
    }
    return <div style={{ color: '#fff' }}>正在抽取关键帧...<Progress percent={Math.floor((stateProccess.completed / stateProccess.except) * 100)} status="active" showInfo/></div>
}



const VideoImportTab: React.FC<VideoImportProps> = ({ pid, handleChangeTab }) => {

    const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
    const simulateRepo = useSimulateRepository(state => state)
    const keyFrameRepo = useKeyFrameRepository(state => state)
    const ttsRepo = useTTSRepository(state => state)


    const handleImported = async () => {
        let selected = await dialog.open({
            title: '选择视频文件'
        })
        if (!selected) {
            return
        }
        Modal.info({
            content: <div style={{ color: '#fff' }}>正在导入视频提取音频...</div>,
            footer: null,
            mask: true,
            maskClosable: false,
        })
        await simulateRepo.handleImportVideo(selected as string).catch(err => message.error(err)).finally(Modal.destroyAll)
    }


    const handleCollectFrames = async (type: CollectFrameType) => {
        Modal.info({
            content: <HandleCollectFramesProcess pid={pid} />,
            footer: null,
            mask: true,
            maskClosable: false,
        })
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
        await keyFrameRepo.initialization(keyFrames).then(() => { handleChangeTab("frames") }).catch(err => message.error(err)).finally(Modal.destroyAll)
    }

    const handleCollectAudio = async () => {
        let savePath = await dialog.save({ title: "导出音频文件", filters: [{ extensions: ["mp3"], name: "音频文件" }] })
        if (!savePath) {
            return
        }
        await simulateRepo.handleExportVideo(savePath).catch(err => message.error(err)).finally(Modal.destroyAll)
    }


    return (
        <div className="generate-image-wrap scrollbar">
            <div className='flexR'>
                <div>请导入视频：</div>
                <Button type="default" className="btn-default-auto btn-default-100" onClick={handleImported} >导入</Button>
                <Button type="primary" className="btn-primary-auto btn-primary-108" style={{ width: '130px' }} disabled={!simulateRepo.videoPath} onClick={() => { handleCollectFrames("fps") }}>抽帧关键帧(秒)</Button>
                <Button type="primary" className="btn-primary-auto btn-primary-108" style={{ width: '130px' }} disabled={!simulateRepo.videoPath} onClick={() => { handleCollectFrames("srt") }}>抽帧关键帧(字幕)</Button>
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
        </div>
    );
};

export default VideoImportTab
