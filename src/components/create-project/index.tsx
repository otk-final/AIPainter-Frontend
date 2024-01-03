import { useLogin } from "@/uses";
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
                <Input placeholder="请输入小说别名" />
                <div className="title flexR">Stable-Diffusion-WebUI环境<span>已启动</span></div>
                <div>
                    <Input placeholder="请输入小说别名" />
                    <div className="btn"></div>
                </div>
                <div className="sub-text flexR">请保证SDWebUI启动，并开启AP服务<span>丑启方法</span></div>
                <Button type="primary" block>创建项目</Button>
        </Modal>
    )
}

export default CreateProjectModule