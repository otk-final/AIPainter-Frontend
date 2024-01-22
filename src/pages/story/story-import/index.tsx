import { Button, Divider, Input, Modal, Select, Tabs, TabsProps } from "antd"
import { useEffect, useState } from "react";
import "./index.less"
import { dialog, path } from "@tauri-apps/api";
import { ImportType, Script, usePersistChaptersStorage, usePersistScriptStorage } from "@/stores/story";
import TextArea from "antd/es/input/TextArea";
import { v4 as uuid } from "uuid"
import { Actor, BoardType, useActorRepository, useChapterRepository, useScriptRepository } from "@/repository/story";
import { useGPTAssistantsApi } from "@/repository/gpt";

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
    const gptApi = useGPTAssistantsApi(state => state)



    const handleChooseFile = async () => {
        //选择文件
        let selected = await dialog.open({
            title: "导入脚本文件",
            defaultPath: await path.desktopDir(),
            filters: [{ name: "文本文件", extensions: ["txt"] }, { name: "PDF文件", extensions: ["pdf"] }]
        })
        if (!selected) {
            return
        }
        setPath(selected as string)
    }


    //分镜
    const handleBoading = async () => {
        setLoading(true)

        //分镜
        let chapters = []
        if (boardType === "ai") {
            chapters = await scriptRepo.boardWithAi(gptApi, importType, scriptPath, scriptInput)
        } else {
            chapters = await scriptRepo.boardWithLine(importType, scriptPath, scriptInput)
        }
        await scriptRepo.assignThis()

        await chapterRepo.initialization(chapters)
        //过滤出所有角色信息
        const actorNames = Array.from(new Set(chapters.flatMap(item => item.actors)));
        const actors = actorNames.map((an) => {
            return {
                id: uuid(),
                name: an,
                alias: an,
                style: "",
                traits: []
            } as Actor
        })
        await actorRepo.initialization(actors)

        setLoading(false)
        onClose()
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
                <Button type="primary" block className="btn-primary-auto" loading={loading} onClick={handleBoading}>开始分镜</Button>
            </div>
        </Modal>
    )
}

export default FileImportModal