import { Button, message } from 'antd';
import React, { useEffect, useState } from 'react'
import ReactPlayer from 'react-player';
import { dialog, tauri } from '@tauri-apps/api';
import { ImitateTabType } from '../index';
import { usePersistImtateStorage } from '@/stores/frame';
import VideoPlayerModal from './video-player';
import { getTime } from '@/utils';

interface VideoImportProps {
    handleChangeTab: (key: ImitateTabType) => void,
}

const VideoImportTab: React.FC<VideoImportProps> = ({ handleChangeTab }) => {
    const [videoPlayURL, setVideoPlayURL] = useState<string>()
    const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
    const { videoPath, videoPayload, importVideo, startCollectFrames } = usePersistImtateStorage(state => state)


    useEffect(() => {
        if (videoPath) setVideoPlayURL(tauri.convertFileSrc(videoPath!))
        //获取时长
    }, [videoPath])

    const handleImported = async () => {
        let selected = await dialog.open({
            title: '选择视频文件'
        })
        if (!selected) {
            return
        }
        return importVideo(selected as string)
    }

    const handleCollectFrames = async () => {
        message.loading({
            content: '正在抽帧..',
            duration: 0,
        })
        startCollectFrames().then(() => { 
            handleChangeTab("generateImages");
            message.destroy()
        }).catch(()=> {
            message.destroy();
        })
    }

    const renderVoice = () => {
        return (
            <div className='video-wrap' onClick={() => setIsVideoPlayerOpen(true)}>
                <ReactPlayer url={videoPlayURL}
                    width="200px"
                    height="200px"
                    style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '6px' }}
                />
                {videoPayload && <div className='time'>{getTime(videoPayload.streams[0].duration_ts)}</div>}
                <div className='video-name'>{videoPath?.split('/').pop()}</div>
            </div>
        )
    }


    return (
        <div style={{ paddingLeft: "30px", paddingRight: '30px', height: "calc(100% - 78px)", overflow: 'scroll' }}>
            <div className='flexR'>
                <div>请导入视频：</div>
                <Button type="default" className="btn-default-auto btn-default-100" onClick={handleImported} disabled={!!videoPlayURL}>导入</Button>
                <Button type="primary" className="btn-primary-auto btn-primary-108" style={{ width: '100px' }} disabled={!videoPath} onClick={handleCollectFrames}>开始抽帧</Button>
            </div>

            {videoPath ? renderVoice() : null}
            {isVideoPlayerOpen && <VideoPlayerModal videoPlayURL={videoPlayURL!} isOpen={isVideoPlayerOpen} onClose={() => setIsVideoPlayerOpen(false)} />}
        </div>
    );
};

export default VideoImportTab
