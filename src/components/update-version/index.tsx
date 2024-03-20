import { Button, Modal } from "antd"
import "./index.less"
import assets from "@/assets";
import { useState } from "react";
import * as updater from '@tauri-apps/plugin-updater';

interface UpDateVersionProps {
    isOpen: boolean,
    hold: updater.Update,
    onClose: () => void,
}

const UpDateVersion: React.FC<UpDateVersionProps> = ({ isOpen, hold, onClose }) => {
    const [updateProgress, setUpdateProgress] = useState<{ total?: number, complated?: number }>()

    const onUpdateEvent = (progress: updater.DownloadEvent) => {
        console.info('progress', progress)
        if (progress.event === "Started") {
            setUpdateProgress({ total: progress.data.contentLength })
        } else if (progress.event === "Progress") {
            setUpdateProgress({ ...updateProgress, complated: progress.data.chunkLength })
        } else if (progress.event === "Finished") {
            //TODO 
            setLoading(false)
        }
    }

    const [loading, setLoading] = useState<boolean>(false)
    const onUpdate = async () => {
        setLoading(true)
        await hold.downloadAndInstall(onUpdateEvent)
    }

    hold.version
    return (
        <Modal title="版本更新"
            open={isOpen}
            onCancel={onClose}
            footer={null}
            maskClosable={false}
            width={400}
            className="update-wrap">
            <div>

                <div className="header flexR">
                    <img src={assets.logoVersion} className="logo-img" />
                    <div>
                        <div className="title">鹦鹉智绘</div>
                        <div className="sub-text">当前版本 {hold.currentVersion}</div>
                    </div>
                </div>
                <div className="line" />
                <div className="text">更新版本：{hold.version}</div>
                <div className="sub-text">本次更新主要包含以下内容：</div>
                <div className="sub-text">1.新增支持xx的功能</div>
                <div className="sub-text">2.优化xx功能</div>
                <div className="sub-text">3.修复其他已知BUG</div>
                <Button type="primary" className="btn-primary-auto" onClick={onUpdate} loading={loading}>立即更新</Button>
            </div>

        </Modal>
    )

}

export default UpDateVersion