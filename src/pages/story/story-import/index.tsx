import { Button, Divider, Input, Modal, Select, Tabs, TabsProps } from "antd"
import { useState } from "react";
import "./index.less"
import { dialog, path } from "@tauri-apps/api";
import { Chapter, ImportType, Script, usePersistChaptersStorage, usePersistScriptStorage } from "@/stores/story";
import { usePersistUserAssistantsApi } from "@/stores/api";
import TextArea from "antd/es/input/TextArea";


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

    const [cur, setCur] = useState<ImportType>("file");
    const [loading, setLoading] = useState(false)
    const [boardType, setBoardType] = useState<string>("ai")

    const { pid, script, startBoarding } = usePersistScriptStorage(state => state)
    const { initializeChapters } = usePersistChaptersStorage(state => state)
    const uasApi = usePersistUserAssistantsApi(state => state)


    const [stateScript, setScript] = useState<Script>({ ...script! })

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
        setScript({ ...stateScript, path: selected as string })
    }

    //分镜
    const handleBoading = async () => {
        setLoading(true)
        startBoarding(uasApi, boardType, { ...stateScript, type: cur }).finally(() => { setLoading(false); onClose() })
    }

    const renderFileImport = () => {
        return (
            <div className="script-import">
                <Input placeholder="点击选择文件" size="large" value={stateScript.path} onClick={handleChooseFile} readOnly />
                <div className="sub-text">上传文件仅支持小于<span>1MB</span> ，且文件后级为<span>.docx</span>或<span>.txt</span>文件。单次上传的分镜数请勿超过 <span>200</span>个。每个分镜的原文句子请勿超过100字。</div>
            </div>
        )
    }

    const renderInputImport = () => {
        return (
            <div className="script-import">
                <TextArea rows={6} value={stateScript.input} bordered className="text-area-auto" onChange={(e) => setScript({ ...stateScript, input: e.target.value })}></TextArea>
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
                        { value: 'ai', label: '通过"智能解析"分镜（适用于新手）' },
                        { value: 'line', label: '通过“换行”区分' },
                    ]}
                />
                <Divider />
                <Tabs defaultActiveKey="file" items={importTabItems} onChange={(key) => setCur(key as ImportType)} />
                {cur === 'file' ? renderFileImport() : renderInputImport()}
                <Button type="primary" block className="btn-primary-auto" loading={loading} onClick={handleBoading}>开始分镜</Button>
            </div>
        </Modal>
    )
}

export default FileImportModal