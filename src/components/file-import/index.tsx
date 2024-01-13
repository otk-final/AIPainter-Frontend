import { Button, Modal, Select, Tabs, TabsProps } from "antd"
import { useState } from "react";
import "./index.less"
import { dialog, path } from "@tauri-apps/api";
import { usePersistActorsStorage, usePersistScriptStorage } from "@/stores/story";


const importTabItems: TabsProps['items'] = [
    {
        key: 'textImport',
        label: '文本导入',
    },
    {
        key: 'excelImport',
        label: 'Excel导入',
    },
];

interface FileImportModuleProps {
    isOpen: boolean,
    onClose: () => void,
}


type ImportType = "textImport" | "excelImport"
const FileImportModule: React.FC<FileImportModuleProps> = ({ isOpen, onClose }) => {
    const [cur, setCur] = useState<ImportType>("textImport");
    const [loading, setLoading] = useState(false)
    const [boardType, setBoardType] = useState("ai")


    const doImport = usePersistScriptStorage(state => state.import)
    const handleImport = async (type: string) => {
        //选择文件
        let selected = await dialog.open({
            title: "导入脚本文件",
            defaultPath: await path.desktopDir(),
            filters: [{ name: "文本文件", extensions: ["txt"] }, { name: "excel", extensions: ["xlsx"] }]
        })
        if (!selected) {
            return
        }

        setLoading(true)
        return doImport({
            boardType: boardType,
            path: selected as string,
            format: type,
        }).finally(() => {
            setLoading(false)
            onClose()
        })
    }

    const renderTextImport = () => {
        return (
            <div className="script-import">
                <div className="title">分镜标识符</div>
                <Select
                    className={`select-auto select-h56`}
                    value={boardType}
                    onChange={setBoardType}
                    options={[
                        { value: 'line', label: '通过“换行”区分' },
                        { value: 'split', label: '“特殊符号”区分（#@#）' },
                        { value: 'ai', label: '通过"智能解析"分镜（适用于新手）' },
                    ]}
                />
                <div className="sub-text">上传文件仅支持小于<span>1MB</span> ，且文件后级为<span>.docx</span>或<span>.txt</span>文件。单次上传的分镜数请勿超过 <span>200</span>个。每个分镜的原文句子请勿超过100字。</div>
                <Button type="primary" block className="btn-primary-auto" loading={loading} onClick={() => handleImport("text")}>导入文件</Button>
            </div>
        )
    }

    const renderExcelImport = () => {
        return (
            <div className="script-import">
                <Button type="default" block className="btn-default-auto" onClick={() => { }}>下载文件模版（EXCEL）</Button>
                <div className="sub-text">上传文件仅支持小于<span>1MB</span> ，且文件后级为<span>.xlxs</span>文件。单次上传的分镜数请勿超过 <span>200</span>个。每个分镜的原文句子请勿超过100字。</div>
                <Button type="primary" block className="btn-primary-auto" loading={loading} onClick={() => handleImport("excel")} >导入文件</Button>
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
            <Tabs defaultActiveKey="textImport" items={importTabItems} onChange={(key) => setCur(key as ImportType)} />
            {cur === 'textImport' ? renderTextImport() : renderExcelImport()}
        </Modal>
    )
}

export default FileImportModule