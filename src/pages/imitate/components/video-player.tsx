import { Modal } from "antd"
import ReactPlayer from "react-player";

interface VideoPlayerProps {
    videoPlayURL: string,
    isOpen: boolean,
    onClose: () => void
}

const VideoPlayerModal: React.FC<VideoPlayerProps> = ({ videoPlayURL, isOpen, onClose }) => {
    return (
        <Modal title="视频播放"
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={'50%'}
            className="home-login-modal energy-recharge">
            <ReactPlayer url={videoPlayURL}
                controls
                width="100%"
            />
        </Modal>
    )
}

export default VideoPlayerModal