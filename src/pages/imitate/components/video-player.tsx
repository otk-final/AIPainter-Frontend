import { Modal } from "antd"
import ReactPlayer from "react-player";

interface VideoPlayerModuleProps {
    videoFileURL: string,
    isOpen: boolean,
    onClose: ()=>void
}

const VideoPlayerModule:React.FC<VideoPlayerModuleProps> = ({videoFileURL, isOpen, onClose})=> {
   

    return (
        <Modal title="视频播放" 
            open={isOpen} 
            onCancel={onClose} 
            footer={null}
            width={1000}
            className="home-login-modal energy-recharge">
                <ReactPlayer url={videoFileURL}  
                    controls
                    width="100%"
                    height="100%"
                />

        </Modal>
    )
}

export default VideoPlayerModule