import { Button, Input, message, Modal, Select } from "antd"
import { useState } from "react";
import { history } from 'umi'
import "./index.less"
import { v4 as uuid } from "uuid"
import { ProjectType } from "@/pages/index";
import { Project, useProjectRepository } from "@/repository/workspace";
import dayjs from "dayjs";

interface ProjectProps {
    isOpen: boolean,
    onClose: () => void,
    type: ProjectType
}

//宽x高
const canvas_options = [{
    label: "默认", value: "default"
}, {
    label: "1:1", value: "1024x1024"
}, {
    label: "3:4", value: "768x1024"
}, {
    label: "4:3", value: "1024x768"
}, {
    label: "16:9", value: "1280x720",
}, {
    label: "9:16", value: "720x1280",
}]

export const ProjectModal: React.FC<ProjectProps> = ({ isOpen, onClose, type }) => {
    const [name, setName] = useState("")
    const [canvasMode, setCanvasMode] = useState<string>("default")
    const repo = useProjectRepository(state => state)

    const handleCreate = async () => {
        if (!name) {
            return message.error("请输入项目名称");
        }
        //判断名称是否存在
        if (repo.items.some(item => item.name === name)) {
            return message.error("项目名已存在");
        }

        let newProject = {
            id: uuid(),
            name: name,
            type: type,
            createTime: dayjs(new Date()).format("YYYY-MM-DD HH:mm"),
            dimensions: canvasMode !== "default" ? { width: canvasMode.split("x")[0], height: canvasMode.split("x")[1] } : undefined
        } as Project
        
        //创建目录
        if (type === 'story') {
            await repo.appendItem(newProject, true).finally(() => { history.push("/story/" + newProject.id) })
        } else {
            await repo.appendItem(newProject, true).finally(() => { history.push("/imitate/" + newProject.id) })
        }
    }

    return (
        <Modal title="创建项目"
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={400}
            className="create-project">
            <div className="title">项目名称（必填）</div>
            <Input placeholder="请输入项目名" size="large" onChange={(v) => setName(v.target.value)} />
            {
                type === "story" &&
                <div>
                    <div className="title">图片比例</div>
                    <Select
                        className={`select-auto`}
                        value={canvasMode}
                        onChange={(v) => setCanvasMode(v)}
                        options={canvas_options}
                    />
                </div>
            }

            <Button type="primary" block className="btn-primary-auto" style={{ marginTop: '20px' }} onClick={handleCreate}>创建项目</Button>
        </Modal>
    )
}