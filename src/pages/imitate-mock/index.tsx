import React, { useState } from 'react'
import './index.less'
import { Button, Image } from 'antd';
import { dialog, fs, path, shell, tauri } from '@tauri-apps/api';
import { BaseDirectory } from '@tauri-apps/api/fs';
import ReactPlayer from 'react-player';
import { usePersistProjects } from '@/stores/project';






const ImitatePage: React.FC = () => {


    const handleFrames = async () => {

        //choose vocie file
        let selected = await dialog.open({
            title: "选择视频"
        })
        if (!selected) {
            return;
        }
        console.info(selected)
        //create dir
        let selectedName = await path.basename(selected as string)
        let framesDirName = 'frames-' + selectedName
        let ok = fs.createDir(framesDirName, {
            dir: BaseDirectory.Home,
            recursive: true
        })
        console.info(ok)

        let framesPath = await path.join(await path.homeDir(), framesDirName, "/image-%3d.png")
        console.info(framesPath)
        //-vf "select=eq(pict_type\,I)"  -vsync vfr -qscale:v 2 -f image2 ./%08d.jp
        // let cmd =  new shell.Command("bin/ffmpeg",[
        //     "-i", selected as string,
        //     "-vf",`"select=eq(pict_type,I)"`,
        //     "-vsync","vfr",
        //     "-qscale:v","2",
        //     "-f","image2",
        //     framesPath
        // ])
        // shell.Command.sidecar("bin/ffmpeg")
        // let cmd = shell.Command.sidecar("bin/ffmpeg", [
        //         "-i", selected as string,
        //         "-vf","select=eq(pict_type\\,I)",
        //         "-vsync","vfr",
        //         "-qscale:v","2",
        //         "-f","image2",
        //         framesPath
        // ])

        // let output = await cmd.execute()
        // console.info('stdcode', output.code)
        // console.info('stdout', output.stdout)
        // console.info('stderr', output.stderr)
    }

    const [imageFile, setImageFile] = useState<string>("")

    const [voiceFile, setVoiceFile] = useState<VoiceFile>()

    const handleImage = async () => {

        //choose vocie file
        let selected = await dialog.open({
            title: "选择视频"
        })
        if (!selected) {
            return;
        }

        let selectedUrl = tauri.convertFileSrc(selected as string)
        setImageFile(selectedUrl)
    }

    const handleVoice = async () => {

        //choose vocie file
        let selected = await dialog.open({
            title: "选择视频"
        })
        if (!selected) {
            return;
        }

        let selectedUrl = tauri.convertFileSrc(selected as string)
        setVoiceFile({ url: selectedUrl })

        console.info(selected)

        let cmd = shell.Command.sidecar("bin/ffprobe", [
            "-i", selected as string,
            "-v", "quiet",
            "-show_streams",
            "-output_format", "json",
        ])

        let output = await cmd.execute()
        console.info('stdcode', output.code)
        console.info('stdout', JSON.parse(output.stdout))
        console.info('stderr', output.stderr)
    }


    const {name} = usePersistProjects()

    return (
        <div >
            <Button onClick={handleImage}>选择图片</Button>
            <Button onClick={handleVoice}>选择视频</Button>
            {imageFile && <Image src={imageFile} />}
            <br />
            {voiceFile && <ReactPlayer controls={true} url={voiceFile.url} />}
        </div>
    );
};

interface VoiceFile {
    url?: string
    attr?: any
}



export default ImitatePage


