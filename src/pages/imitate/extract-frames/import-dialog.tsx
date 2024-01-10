import { Button, Input, Modal, Select, Tabs, TabsProps } from "antd"
import { useState } from "react";
import "./index.less"
import { DownloadOutlined, ImportOutlined, SyncOutlined } from "@ant-design/icons";
import { dialog } from "@tauri-apps/api";


const importTabItems: TabsProps['items'] = [
    {
        key: 'videoImport',
        label: '本地视频导入',
    },
    {
        key: 'urlImport',
        label: '视频地址导入',
    },
];

interface FileImportModuleProps {
    isOpen: boolean,
    onClose: () => void
    onImport: (filepath: string) => void
}


type ImportType = "videoImport" | "urlImport"


const FileImportModule: React.FC<FileImportModuleProps> = ({ isOpen, onClose, onImport }) => {
    const [cur, setCur] = useState<ImportType>("videoImport");
    const [loading, setLoading] = useState(false)
    const [videoFilePath, setVideoFilePath] = useState<string>("")
    const [videoDownloadURL, setvideoDownloadURL] = useState<string>("")


    const onChange = (key: string) => {
        setCur(key as ImportType);
    };

    const handleChooseVideoFile = async () => {
        let selected = await dialog.open({
            title: '选择视频文件'
        })
        if (!selected) {
            return
        }
        setVideoFilePath(selected as string)
    }

    const handleConfirmImportVideoFile = async () => {
        if (videoFilePath === "") {
            return;
        }
        onImport(videoFilePath)
    }


    const handleDownloadVideoFile = async () => {
        setVideoFilePath("")
    }

    const renderVideoImport = () => {
        return (
            <div className="script-import">
                <div className=" flexR">
                    <Input placeholder="选择文件" size="large" value={videoFilePath} readOnly />
                    <div className="btn-import"><ImportOutlined onClick={handleChooseVideoFile} /></div>
                </div>
                <div className="sub-text">上传文件仅支持小于<span>1MB</span> ，且文件后级为<span>.docx</span>或<span>.txt</span>文件。单次上传的分镜数请勿超过 <span>200</span>个。每个分镜的原文句子请勿超过100字。</div>
                <Button type="primary" block className="btn-primary-auto" loading={loading} onClick={handleConfirmImportVideoFile} disabled={!videoFilePath}>导入文件</Button>
            </div>
        )
    }

    const renderUrlImport = () => {
        return (
            <div className="script-import">

                <div className=" flexR">
                    <Input placeholder="请输入可下载视频地址" size="large" value={videoDownloadURL} onChange={(e) => { setvideoDownloadURL(e.target.value) }} />
                    <div className="btn-import"><DownloadOutlined onClick={handleDownloadVideoFile} /></div>
                </div>

                <div className="sub-text">上传文件仅支持小于<span>1MB</span> ，且文件后级为<span>.xlxs</span>文件。单次上传的分镜数请勿超过 <span>200</span>个。每个分镜的原文句子请勿超过100字。</div>
                <Button type="primary" block className="btn-primary-auto" loading={loading} onClick={handleConfirmImportVideoFile}>导入文件</Button>
            </div>
        )
    }

    return (
        <Modal title="素材导入"
            open={isOpen}
            onCancel={onClose}
            footer={null}
            className="home-login-modal"
            width={600}>
            <Tabs defaultActiveKey="videoImport" items={importTabItems} onChange={onChange} />
            {cur === 'videoImport' ? renderVideoImport() : renderUrlImport()}

        </Modal>
    )
}

export default FileImportModule