import { Button, Input, message, Modal } from "antd"
import { useState } from "react";
import { history } from 'umi'
import "./index.less"
import { usePersistWorkspaces } from "@/stores/project";
import { ProjectType } from "@/pages/index";

interface ProjectProps {
    isOpen: boolean,
    onClose: () => void,
    type: ProjectType
}

export const ProjectModal: React.FC<ProjectProps> = ({ isOpen, onClose, type }) => {
    const [name, setName] = useState("")
    const { create } = usePersistWorkspaces(state => state)

    const handleCreate = () => {
        if (!name) {
            return message.error("请输入小说别名");
        }
        if(type === 'story') {
            create("story", name).then((id) => { history.push("/story/" + id) })
        }else {
            create("imitate", name).then((id) => { history.push("/imitate/" + id) })
        }
    }

    return (
        <Modal title="创建项目"
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={700}
            className="home-login-modal create-project">
            <div className="title">小说别名（必填）</div>
            <Input placeholder="请输入小说别名" size="large" onChange={(v) => setName(v.target.value)} />
            <Button type="primary" block className="btn-primary-auto" style={{ marginTop: '20px' }} onClick={handleCreate}>创建项目</Button>
        </Modal>
    )
}