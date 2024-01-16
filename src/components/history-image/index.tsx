import { tauri } from "@tauri-apps/api";
import { Button, Modal } from "antd"
import { useEffect, useState } from "react";
import './index.less'

interface HistoryImageModuleProps {
    isOpen: boolean,
    onClose: ()=>void,
    paths: string[] ,
    defaultPath: string,
    onChangeNewImage: (v: string) => void 
}

const HistoryImageModule:React.FC<HistoryImageModuleProps> = ({isOpen, onClose, paths, defaultPath, onChangeNewImage})=> {
    const [cur, setCur] = useState("");

    useEffect(()=>{
        setCur(defaultPath)
    },[defaultPath])

    const handleClick = (i: string)=>{
        setCur(i);
    }

    return (
        <Modal title="" 
            open={isOpen} 
            onCancel={onClose} 
            footer={null}
            width={700}
            className="home-login-modal history-image-modal">
                <div className="cur-wrap flexC">
                    <img  src={tauri.convertFileSrc(cur)} className="img-l"/>
                </div>
                <div className="history-images flexR scrollbar">
                    {paths.map((i, index)=>{
                        return (
                            <img  src={tauri.convertFileSrc(i)} className={`img-s ${cur === i ? "cur" : ""}`} key={index} onClick={()=> handleClick(i)}/>
                        )
                    })}
                </div>
                <div className="flexR" style={{justifyContent: 'space-between'}}>
                    <Button type="default" block className="btn btn-default-auto" onClick={onClose}>取消</Button>
                    <Button type="primary" block className="btn btn-primary-auto" onClick={()=>{
                        onChangeNewImage(cur);
                        onClose()
                    }}>设为本镜配图</Button>
                </div>
               
        </Modal>
    )
}

export default HistoryImageModule