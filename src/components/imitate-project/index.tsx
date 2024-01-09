import { SyncOutlined } from "@ant-design/icons";
import { Button, Input, message, Modal } from "antd"
import { useState } from "react";
import {history} from 'umi'
import "./index.less"

interface ImitateProjectModuleProps {
    isOpen: boolean,
    onClose: ()=>void
}

const ImitateProjectModule: React.FC<ImitateProjectModuleProps> = ({isOpen, onClose})=> {
    const [name, setName] = useState("")

    const handleCreate = ()=>{
        if(!name) {
            return message.error("请输入项目名");
        }
        // 缺少校验
        history.push("/imitate")
    }
   
    return (
        <Modal title="创建项目" 
            open={isOpen} 
            onCancel={onClose} 
            footer={null}
            width={700}
            className="home-login-modal create-project">
                <div className="title">项目名（必填）</div>
                <Input placeholder="请输入小说别名"  size="large"  onChange={(v)=> setName(v.target.value)}/>
                <div className="title flexR">Stable-Diffusion-WebUI环境<span>已启动</span></div>
                <div className=" flexR">
                    <Input placeholder="http://127.0.0.1:7860/"  size="large" />
                    <div className="btn-refresh"><SyncOutlined /></div>
                </div>
                <div className="sub-text flexR">请保证SDWebUI启动，并开启AP服务<span>开启方法</span></div>
                <Button type="primary" block className="btn-primary-auto" onClick={handleCreate}>创建项目</Button>
        </Modal>
    )
}

export default ImitateProjectModule