import { SyncOutlined } from "@ant-design/icons";
import { Button, Input, message, Modal } from "antd"
import { useState } from "react";
import { history } from 'umi'
import "./index.less"
import { usePersistWorkspaces } from "@/stores/project";

interface CreateProjectModuleProps {
    isOpen: boolean,
    onClose: () => void
}

const CreateProjectModule: React.FC<CreateProjectModuleProps> = ({ isOpen, onClose }) => {
    const [name, setName] = useState("")


    const { create } = usePersistWorkspaces(state => state)

    const handleCreate = () => {
        if (!name) {
            return message.error("请输入小说别名");
        }
        create("std", name).then((id) => { history.push("/create/" + id) })
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

export default CreateProjectModule