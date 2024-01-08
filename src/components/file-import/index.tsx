import { useLogin } from "@/uses";
import { Button, Modal, Select, Tabs, TabsProps } from "antd"
import { useState } from "react";
import "./index.less"


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
    onClose: ()=>void,
    onCB: (res: boolean) => void
}


type ImportType = "textImport" | "excelImport"
const FileImportModule:React.FC<FileImportModuleProps> = ({isOpen, onClose, onCB})=> {
    const {login} = useLogin();
    const [cur, setCur] = useState<ImportType>("textImport");
    const [loading, setLoading] = useState(false)

    const handleImport = ()=>{
        onCB(true)
    }

    const onChange = (key: string) => {
        setCur(key as ImportType);
    };

    const renderTextImport = ()=>{
        return (
            <div className="script-import">
                <div className="title">分镜标识符</div>
                <Select
                  className={`select-auto`}
                  defaultValue="3"
                  onChange={(v)=>{}}
                  options={[
                    { value: '1', label: '通过“换行”区分' },
                    { value: '2', label: '“特殊符号”区分（#@#）' },
                    { value: '3', label: '通过"智能解析"分镜（适用于新手）' },
                  ]}
                />
                <div className="sub-text">上传文件仅支持小于<span>1MB</span> ，且文件后级为<span>.docx</span>或<span>.txt</span>文件。单次上传的分镜数请勿超过 <span>200</span>个。每个分镜的原文句子请勿超过100字。</div>
                <Button type="primary" block  className="btn-primary-auto" loading={loading} onClick={handleImport}>导入文件</Button>
            </div>
        )
    }

    const renderExcelImport = ()=>{
        return (
            <div className="script-import">
                <Button type="default" block  className="btn-default-auto" onClick={()=>{}}>下载文件模版（EXCEL）</Button>
                <div className="sub-text">上传文件仅支持小于<span>1MB</span> ，且文件后级为<span>.xlxs</span>文件。单次上传的分镜数请勿超过 <span>200</span>个。每个分镜的原文句子请勿超过100字。</div>
                <Button type="primary" block  className="btn-primary-auto"loading={loading} onClick={handleImport}>导入文件</Button>
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
                <Tabs defaultActiveKey="textImport" items={importTabItems} onChange={onChange} />
                {cur === 'textImport' ? renderTextImport() : renderExcelImport()}
           
        </Modal>
    )
}

export default FileImportModule