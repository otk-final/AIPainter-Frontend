import { Button, Input, message, Modal } from "antd"
import { useState } from "react";
import { history } from 'umi'
import "./index.less"
import { v4 as uuid } from "uuid"
import { ProjectType } from "@/pages/index";
import { Project, useProjectRepository } from "@/repository/workspace";

interface ProjectProps {
    isOpen: boolean,
    onClose: () => void,
    type: ProjectType
}

export const ProjectModal: React.FC<ProjectProps> = ({ isOpen, onClose, type }) => {
    const [name, setName] = useState("")
    const { appendItem } = useProjectRepository(state => state)

    const handleCreate = async () => {
        if (!name) {
            return message.error("请输入小说别名");
        }

        let newProject = { id: uuid(), name, type: type } as Project
        if (type === 'story') {
            await appendItem(newProject, true).finally(() => { history.push("/story/" + newProject.id) })
        } else {
            await appendItem(newProject, true).finally(() => { history.push("/imitate/" + newProject.id) })
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