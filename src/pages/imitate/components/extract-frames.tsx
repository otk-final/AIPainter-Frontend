import { Button } from 'antd';
import React, { useContext, useState } from 'react'
import ReactPlayer from 'react-player';
import { dialog, fs, os, path, shell, tauri } from '@tauri-apps/api';
import { BaseDirectory } from '@tauri-apps/api/fs';
import { ImitateContext, ImitateTabType } from '../index';

interface ExtractFramesProps {
    handleChangeTab: (key: ImitateTabType) => void,
}

const ExtractFrames: React.FC<ExtractFramesProps> = ({ handleChangeTab }) => {
    const [videoFileURL, setVideoFileURL] = useState<string>("")
    const [videoFilePath, setVideoFilePath] = useState<string>("")
    const imitateValue = useContext(ImitateContext)
    const [handleLoading, setHandleLoading] = useState<boolean>(false)

    const handleExtractFrames = async () => {
        setHandleLoading(true)
        //创建文件夹
        let videoName = await path.basename(videoFilePath)
        let videoFramesDirName = "frames-" + videoName
        debugger
        let ok = await fs.createDir(videoFramesDirName, {
            dir: BaseDirectory.AppLocalData,
            recursive: true
        })
        let videoFramesDir = await path.join(await path.appLocalDataDir(), videoFramesDirName, "/image-%3d.png")
        debugger
        //每秒抽幀
        let cmd = shell.Command.sidecar("bin/ffmpeg", [
            "-i", videoFilePath,
            "-r", "1",
            "-f", "image2",
            videoFramesDir
        ])
        let output = await cmd.execute()
        console.info('stdcode', output.code)
        console.info('stdout', output.stdout)
        console.info('stderr', output.stderr)
        handleChangeTab("batchDraw")
    }
  
    const handleImported = async () => {
        let selected = await dialog.open({
            title: '选择视频文件'
        })
        if (!selected) {
            return
        }
        
        let url = tauri.convertFileSrc(selected as string);
        //setContext
        // imitateValue.script = {
        //     path: selected as string,
        //     url: tauri.convertFileSrc(selected as string)
        // }

        setVideoFilePath(selected as string)
        setVideoFileURL(url)
    }

    const renderVoice = () => {
        return (
            <div className='video-wrap'>
                <ReactPlayer url={videoFileURL}  
                    width="200px"
                    height="200px"
                    style={{backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: '6px'}} 
                />
                <div className='time'>{"03:24"}</div>
            </div>
        )
    }

    return (
        <div style={{paddingLeft: "30px", paddingRight: '30px', height:"calc(100% - 78px)", overflow: 'scroll'}}>
            <div className='flexR'>
                <div>请导入视频：</div>
                <Button type="default" className="btn-default-auto btn-default-100" onClick={handleImported}>导入</Button>
                <Button type="primary" className="btn-primary-auto btn-primary-108" style={{width: '100px'}} onClick={handleExtractFrames}>开始抽帧</Button>
            </div>

            {videoFileURL ? renderVoice() : null}
        </div>
    );
};

export default ExtractFrames
