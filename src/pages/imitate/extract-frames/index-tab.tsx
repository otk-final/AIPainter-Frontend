import { Button, Divider } from 'antd';
import React, { useContext, useEffect, useState } from 'react'
import '../index.less'
import { QuestionCircleOutlined } from '@ant-design/icons';
import assets from '@/assets';
import { extractFramesColumns, extractFramesColumnsData } from './data';
import FileImportModule from './import-dialog';
import ReactPlayer from 'react-player';
import { fs, os, path, shell, tauri } from '@tauri-apps/api';
import { BaseDirectory } from '@tauri-apps/api/fs';
import { ImitateContext, ImitateTabType } from '../index';

interface ExtractFramesProps {
    handleChangeTab: (key: ImitateTabType) => void,
}

const ExtractFramesTab: React.FC<ExtractFramesProps> = ({ handleChangeTab }) => {

    const [isFileOpen, setIsFileOpen] = useState(false);
    const [hasScript, setHasScript] = useState(false);
    const [columnsData, setColumnsData] = useState(extractFramesColumnsData);


    const renderEmpty = () => {
        return (
            <div className='empty flexC'>
                <img src={assets.empty} className='empty-img' />
                <div className='empty-text'>故事分镜列表为空， 请导入脚本文件</div>
                <div className='import-btn' onClick={() => setIsFileOpen(true)}>导入脚本文件</div>
                <div className='sub-text'>请上传故事分镜脚本文件，并完成基于镜头画面的描述词编辑。<span>新手可参考：剧本教学文档</span></div>
            </div>
        )
    }

    const onDelete = (v: any, index: number) => {
        setColumnsData((res) => {
            res.splice(index, 1);
            return res
        })
    }

    const renderVoice = () => {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '30px' }}>
                <ReactPlayer url={videoFileURL} controls width={'100%'}></ReactPlayer>
            </div>
        )
    }

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


    const renderScriptList = () => {
        return (
            <div>
                <div className='script-header flexR'>
                    <div className='flexR'>
                        <Button type='default' className='btn-default-auto btn-default-150 l-p' onClick={() => setIsFileOpen(true)}>重新导入脚本文件</Button>
                        <Button type='primary' className='btn-primary-auto btn-primary-108' onClick={handleExtractFrames}>视频抽帧</Button>
                    </div>

                    <div className='right flexR '>
                        <QuestionCircleOutlined />
                        <div>
                            <div className='text'>剩余能量：7241</div>
                            <div className='text flexR'>已完成分镜: 1/79</div>
                        </div>
                    </div>
                </div>
                {renderVoice()}
            </div>
        )
    }

    const [videoFileURL, setVideoFileURL] = useState<string>("")
    const [videoFilePath, setVideoFilePath] = useState<string>("")
    const handleImported = async (filepath: string) => {

        //setContext
        imitateValue.script = {
            path: filepath,
            url: tauri.convertFileSrc(filepath)
        }

        setVideoFilePath(imitateValue.script.path)
        setVideoFileURL(imitateValue.script.url)

        setIsFileOpen(false)
    }

    return (
        <div className="storyboard-wrap">
            {hasScript ? renderScriptList() : renderEmpty()}
            <FileImportModule isOpen={isFileOpen} onClose={() => setIsFileOpen(false)} onImport={handleImported} />
        </div>
    );
};

export default ExtractFramesTab
