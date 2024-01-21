import { Button, message } from 'antd';
import React, { useEffect, useState } from 'react'
import ReactPlayer from 'react-player';
import { dialog, tauri } from '@tauri-apps/api';
import { ImitateTabType } from '../index';
import VideoPlayerModal from './video-player';
import { useKeyFrameRepository, useSimulateRepository } from '@/repository/simulate';

interface VideoImportProps {
    handleChangeTab: (key: ImitateTabType) => void,
}

const VideoImportTab: React.FC<VideoImportProps> = ({ handleChangeTab }) => {

    const [videoPlayURL, setVideoPlayURL] = useState<string>()
    const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);

    const simulateRepo = useSimulateRepository(state => state)
    const KeyFrameRepo = useKeyFrameRepository(state => state)
    useEffect(() => {
        const unsub = useSimulateRepository.subscribe(
            (state) => state.videoPath,
            (state, pre) => {
                console.info("sub", state, pre)
                if (state) setVideoPlayURL(tauri.convertFileSrc(state!))
            },
            { fireImmediately: true }
        )
        return unsub
    }, [])



    const handleImported = async () => {
        let selected = await dialog.open({
            title: '选择视频文件'
        })
        if (!selected) {
            return
        }
        return simulateRepo.handleImportVideo(selected as string)
    }

    const handleCollectFrames = async () => {
        message.loading({
            content: '正在抽取关键帧..',
            duration: 0,
            style: {
                marginTop: "350px"
            }
        })

        //抽帧，导入，切换tab
        let keyFrames = await simulateRepo.handleCollectFrames()
        await KeyFrameRepo.initializationKeyFrames(keyFrames)
        handleChangeTab("frames");

        message.destroy()
    }

    const handleCollectAudio = async () => {
        message.loading({
            content: '正在导出音频..',
            duration: 0,
            style: {
                marginTop: "350px"
            }
        })

        await simulateRepo.handleCollectAudio()
        handleChangeTab("audio");

        message.destroy()
    }

    const renderVoice = () => {
        return (
            <div className='video-wrap' onClick={() => setIsVideoPlayerOpen(true)}>
                <ReactPlayer url={videoPlayURL}
                    width="200px"
                    height="200px"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '6px' }}
                />
                {/* {payload && <div className='time'>{getTime(payload.streams[0].duration_ts)}</div>}
                <div className='video-name'>{videoPath?.split('/').pop()}</div> */}
            </div>
        )
    }


    return (

        <div className="generate-image-wrap scrollbar">
            <div className='flexR'>
                <div>请导入视频：</div>
                <Button type="default" className="btn-default-auto btn-default-100" onClick={handleImported} >导入</Button>
                <Button type="primary" className="btn-primary-auto btn-primary-108" style={{ width: '100px' }} disabled={!videoPlayURL} onClick={handleCollectFrames}>开始抽帧</Button>
                <Button type="primary" className="btn-primary-auto btn-primary-108" style={{ width: '100px' }} disabled={!videoPlayURL} onClick={handleCollectAudio}>导出音频</Button>
            </div>

            {simulateRepo.videoPath ? renderVoice() : null}
            {isVideoPlayerOpen && <VideoPlayerModal videoPlayURL={videoPlayURL!} isOpen={isVideoPlayerOpen} onClose={() => setIsVideoPlayerOpen(false)} />}
        </div>
    );
};

export default VideoImportTab
