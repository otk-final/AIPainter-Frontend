import { Button,  Modal } from "antd"
import "./index.less"
import assets from "@/assets";

interface UpDateVersionProps {
    isOpen: boolean,
    onClose: () => void,
    onUpdate: ()=> void
}

const UpDateVersion:React.FC<UpDateVersionProps> = ({isOpen, onClose, onUpdate})=>{
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
                    <img src={assets.logoVersion} className="logo-img"/>
                    <div>
                        <div className="title">鹦鹉智绘</div>
                        <div className="sub-text">当前版本 1.0</div>
                    </div>
                </div>
                <div className="line"/>
                <div className="text">更新版本：2.0</div>
                <div className="sub-text">本次更新主要包含以下内容：</div>
                <div className="sub-text">1.新增支持xx的功能</div>
                <div className="sub-text">2.优化xx功能</div>
                <div className="sub-text">3.修复其他已知BUG</div>
                <Button type="primary" className="btn-primary-auto" onClick={onUpdate}>立即更新</Button>
            </div>

        </Modal>
    )

}

export default UpDateVersion