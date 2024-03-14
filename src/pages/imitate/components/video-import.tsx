import { Button, message } from 'antd';
import React, { useState } from 'react'
import ReactPlayer from 'react-player';
import { ImitateTabType } from '../index';
import VideoPlayerModal from './video-player';
import { useSimulateRepository } from '@/repository/simulate';
import { useKeyFrameRepository } from '@/repository/keyframe';
import HandleProcessModal from '@/components/handle-process';
import { Project } from '@/repository/workspace';
import dialog from '@tauri-apps/plugin-dialog';
import tauri from '@tauri-apps/api/core';


interface VideoImportProps {
    pid: string
    project: Project
    handleChangeTab: (key: ImitateTabType) => void,
}



const VideoImportTab: React.FC<VideoImportProps> = ({ pid, handleChangeTab }) => {

    const [isVideoPlayerOpen, setIsVideoPlayerOpen] = useState(false);
    const simulateRepo = useSimulateRepository(state => state)
    const keyFrameRepo = useKeyFrameRepository(state => state)
    const [stateProcess, setProcess] = useState<{ open: boolean, title: string, run_event?: string, exit_event?: string }>({ open: false, title: "" });


    const destroyProcessModal = () => {
        setProcess({ open: false, title: "" })
    }

    //导入
    const handleImported = async () => {
        let selected = await dialog.open({
            title: '选择视频文件',
            multiple:false
        })
        if (!selected) {
            return
        }
        setProcess({ open: true, title: "正在导入视频提取音频..." })
        await simulateRepo.handleImportVideo(selected.path).catch(err => message.error(err.message)).finally(destroyProcessModal);
    }


    const handleCollectFrames = async () => {
        setProcess({ open: true, run_event: "key_frame_collect_process", exit_event: "", title: "正在抽帧关键帧..." })
        //按音频
        let keyFrames = await simulateRepo.handleCollectFrames()
        await keyFrameRepo.initialization(keyFrames).then(() => { handleChangeTab("frames") }).catch(err => message.error(err.message)).finally(destroyProcessModal)
    }

    // const handleCollectAudio = async () => {
    //     let savePath = await dialog.save({ title: "导出音频文件", filters: [{ extensions: ["mp3"], name: "音频文件" }] })
    //     if (!savePath) {
    //         return
    //     }
    //     await simulateRepo.handleExportVideo(savePath).catch(err => message.error(err.message)).finally(Modal.destroyAll)
    // }


    return (
        <div className="generate-image-wrap">
            <div className='flexR'>
                <div>请导入视频：</div>
                <Button type="default" className="btn-default-auto btn-default-100" onClick={handleImported} >导入</Button>
                <Button type="primary" className="btn-primary-auto btn-primary-108" style={{ width: '130px' }} disabled={!simulateRepo.videoPath} onClick={handleCollectFrames}>抽帧关键帧</Button>
                {/* <Button type="primary" className="btn-primary-auto btn-primary-108" style={{ width: '100px' }} disabled={!simulateRepo.videoPath} onClick={handleCollectAudio}>导出音频</Button> */}
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

            {stateProcess.open && <HandleProcessModal
                open={stateProcess.open}
                pid={pid}
                title={stateProcess.title}
                running_event={stateProcess.run_event}
                exit_event={stateProcess.exit_event}
                onClose={destroyProcessModal} />}
        </div>
    );
};

export default VideoImportTab
