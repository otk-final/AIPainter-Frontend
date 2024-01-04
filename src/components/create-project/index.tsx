import { useLogin } from "@/uses";
import { SyncOutlined } from "@ant-design/icons";
import { Button, Input, message, Modal, Radio } from "antd"
import { Fragment, useEffect, useState } from "react";
import "./index.less"

interface CreateProjectModuleProps {
    isOpen: boolean,
    onClose: ()=>void
}

const CreateProjectModule:React.FC<CreateProjectModuleProps> = ({isOpen, onClose})=> {
    const {login} = useLogin();
   
    return (
        <Modal title="创建项目" 
            open={isOpen} 
            onCancel={onClose} 
            footer={null}
            width={700}
            className="home-login-modal create-project">
                <div className="title">小说别名（必填）</div>
                <Input placeholder="请输入小说别名"  size="large"  />
                <div className="title flexR">Stable-Diffusion-WebUI环境<span>已启动</span></div>
                <div className=" flexR">
                    <Input placeholder="http://127.0.0.1:7860/"  size="large" />
                    <div className="btn-refresh"><SyncOutlined/></div>
                </div>
                <div className="sub-text flexR">请保证SDWebUI启动，并开启AP服务<span>开启方法</span></div>
                <Button type="primary" block className="create-btn">创建项目</Button>
        </Modal>
    )
}

export default CreateProjectModule