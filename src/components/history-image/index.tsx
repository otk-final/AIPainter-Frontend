import { tauri } from "@tauri-apps/api";
import { Button, Image, Modal } from "antd"
import { useEffect, useState } from "react";
import './index.less'
import { TauriRepo } from "@/repository/tauri_repository";


export interface ModalHistoryImageProps {
    isOpen: boolean
    setOpen: (open: boolean) => void
    path?: string
    history: string[]
    repo: TauriRepo
    onChange: (path: string) => void
}

export const ModalHistoryImages: React.FC<ModalHistoryImageProps> = ({ isOpen, setOpen, path, history, repo, onChange }) => {

    const [url, setUrl] = useState<string | undefined>()
    const [urls, setUrls] = useState<string[]>([])

    const renderHistory = async (history: string[]) => {
        let historyUrls = [] as string[]
        history.forEach(async (item) => {
            let url = tauri.convertFileSrc(await repo.absulotePath(item))
            historyUrls.push(url)
        })
        setUrls(historyUrls)
    }
    const renderPath = async (path: string) => {
        setUrl(tauri.convertFileSrc(await repo.absulotePath(path)))
    }

    useEffect(() => {
        if (path) renderPath(path)
        if (history) renderHistory(history)
    }, [history])

    const handleChange = () => {
        let idx = urls!.indexOf(url!)
        onChange(history[idx])
        setOpen(false)
    }

    return (
        <Modal title="选择图片"
            open={isOpen}
            onCancel={() => setOpen(false)}
            footer={null}
            width={700}
            className="home-login-modal history-image-modal">
            <div className="cur-wrap flexC">
                <img src={url} className="img-l" />
            </div>
            <div className="history-images flexR scrollbar">
                {urls.map((item, index) => {
                    return (
                        <img src={item} className={`img-s ${url === item ? "cur" : ""}`} key={index} onClick={() => setUrl(item)} />
                    )
                })}
            </div>
            <div className="flexR" style={{ justifyContent: 'space-between' }}>
                <Button type="default" block className="btn btn-default-auto" onClick={() => setOpen(false)}>取消</Button>
                <Button type="primary" block className="btn btn-primary-auto" onClick={handleChange}>设为本镜配图</Button>
            </div>
        </Modal>
    )
}



export const AssetImage: React.FC<{ path?: string, repo: TauriRepo }> = ({ path, repo }) => {
    const [url, setUrl] = useState<string | undefined>()
    const render = async (path: string) => {
        setUrl(tauri.convertFileSrc(await repo.absulotePath(path)))
    }
    useEffect(() => {
        if (path) render(path)
    }, [path])

    if (url) {
        return <Image src={url} className="generate-image" preview={true} />
    }
    return <div>待生成</div>
}

export interface AssetHistoryImagesProps {
    setOpen: (open: boolean) => void
    path?: string
    history: string[]
    repo: TauriRepo
}

export const AssetHistoryImages: React.FC<AssetHistoryImagesProps> = ({ setOpen, history, repo }) => {

    const [urls, setUrls] = useState<string[]>()

    const render = async (history: string[]) => {
        let historyUrls = [] as string[]
        history.forEach(async (item) => {
            let url = tauri.convertFileSrc(await repo.absulotePath(item))
            historyUrls.push(url)
        })
        setUrls(historyUrls)
    }

    useEffect(() => {
        if (history) render(history)
    }, [history])


    if (urls) {
        return <div className="flexR"
            style={{ flexWrap: "wrap", justifyContent: "flex-start", width: '100%' }}
            onClick={() => setOpen(true)}
        >
            {urls.map((item, idx) => {
                return <Image src={item} className="generate-image size-s" preview={false} key={idx} />
            })}
        </div>
    }
    return <div>待生成</div>
}