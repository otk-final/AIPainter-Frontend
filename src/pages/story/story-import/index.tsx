import { Button, Divider, Input, Modal, Select, Tabs, TabsProps, message } from "antd"
import { useState } from "react";
import "./index.less"
import { path } from "@tauri-apps/api";
import TextArea from "antd/es/input/TextArea";
import { BoardType, ImportType, useScriptRepository } from "@/repository/story";
import { Actor, useActorRepository } from "@/repository/actor";
import { useChapterRepository } from "@/repository/chapter";
import { v4 } from "uuid";
import { open } from "@tauri-apps/plugin-dialog";

const importTabItems: TabsProps['items'] = [
    {
        key: 'file',
        label: '文件导入',
    },
    {
        key: 'input',
        label: '自定义脚本',
    },
];

interface FileImportProps {
    isOpen: boolean,
    onClose: () => void,
}


const FileImportModal: React.FC<FileImportProps> = ({ isOpen, onClose }) => {

    const [importType, setType] = useState<ImportType>("file");
    const [loading, setLoading] = useState(false)
    const [boardType, setBoardType] = useState<BoardType>("line")
    const [scriptPath, setPath] = useState<string>("")
    const [scriptInput, setInput] = useState<string>("")



    const scriptRepo = useScriptRepository(state => state)
    const chapterRepo = useChapterRepository(state => state)
    const actorRepo = useActorRepository(state => state)



    const handleChooseFile = async () => {
        //选择文件
        let selected = await open({
            title: "导入脚本文件",
            multiple: false,
            defaultPath: await path.desktopDir(),
            filters: [{ name: "文本文件", extensions: ["txt"] }, { name: "PDF文件", extensions: ["pdf"] }]
        })
        if (!selected) {
            return
        }
        setPath(selected.path)
    }


    //分镜
    const handleBoading = async () => {
        setLoading(true)

        //分镜
        let chapters = []
        if (boardType === "ai") {
            chapters = await scriptRepo.boardWithAi(importType, scriptPath, scriptInput)
        } else {
            chapters = await scriptRepo.boardWithLine(importType, scriptPath, scriptInput)
        }
        await scriptRepo.sync()
        await chapterRepo.initialization(chapters)

        //过滤出所有角色信息
        const actorNames = Array.from(new Set(chapters.flatMap(item => item.actors || [])));
        const newActors = actorNames.map((an) => {
            return {
                id: v4(),
                name: an,
                alias: an,
                style: "",
                traits: []
            } as Actor
        })
        //合并已配置角色
        if (newActors && newActors.length > 0) {
            await actorRepo.initialization(newActors)
        }
        setLoading(false)
        onClose()
    }

    const handleCatchBoading = async () => {
        await handleBoading().catch(err => message.error(err.message))
    }



    const renderFileImport = () => {
        return (
            <div className="script-import">
                <Input placeholder="点击选择文件" size="large" value={scriptPath} onClick={handleChooseFile} readOnly />
                <div className="sub-text">上传文件仅支持小于<span>1MB</span> ，且文件后级为<span>.docx</span>或<span>.txt</span>文件。单次上传的分镜数请勿超过 <span>200</span>个。每个分镜的原文句子请勿超过100字。</div>
            </div>
        )
    }

    const renderInputImport = () => {
        return (
            <div className="script-import">
                <TextArea rows={6} value={scriptInput} bordered className="text-area-auto" onChange={(e) => setInput(e.target.value)}></TextArea>
                <div className="sub-text">文字不多余3000字</div>
            </div>
        )
    }

    return (
        <Modal title="脚本文件导入"
            open={isOpen}
            onCancel={onClose}
            footer={null}
            className="home-login-modal"
            maskClosable={false}
            width={600}>

            <div className="script-import">
                <div className="title">分镜标识符</div>
                <Select
                    className={`select-auto select-h56`}
                    value={boardType}
                    onChange={setBoardType}
                    options={[
                        { value: 'ai', label: '通过"智能解析"分镜' },
                        { value: 'line', label: '通过“换行”区分' },
                    ]}
                />
                <Divider />
                <Tabs defaultActiveKey="file" items={importTabItems} onChange={(key) => setType(key as ImportType)} />
                {importType === 'file' ? renderFileImport() : renderInputImport()}
                <Button type="primary" block className="btn-primary-auto" loading={loading} onClick={handleCatchBoading}>开始分镜</Button>
            </div>
        </Modal>
    )
}

export default FileImportModal