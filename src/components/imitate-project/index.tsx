import { SyncOutlined } from "@ant-design/icons";
import { Button, Input, message, Modal } from "antd"
import { useState } from "react";
import { history } from 'umi'
import "./index.less"
import { usePersistWorkspaces } from "@/stores/project";

interface ImitateProjectModuleProps {
    isOpen: boolean,
    onClose: () => void
}

const ImitateProjectModule: React.FC<ImitateProjectModuleProps> = ({ isOpen, onClose }) => {
    const [name, setName] = useState("")
    const { create } = usePersistWorkspaces(state => state)
    const handleCreate = () => {
        if (!name) {
            return message.error("请输入项目名");
        }
        // 缺少校验
        create("imitate", name).finally(() => { history.push("/imitate") })
    }

    return (
        <Modal title="创建项目"
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={700}
            className="home-login-modal create-project">
            <div className="title">项目名（必填）</div>
            <Input placeholder="请输入项目别名" size="large" onChange={(v) => setName(v.target.value)} />
            <Button type="primary" block className="btn-primary-auto" style={{ marginTop: '20px' }} onClick={handleCreate}>创建项目</Button>
        </Modal>
    )
}

export default ImitateProjectModule