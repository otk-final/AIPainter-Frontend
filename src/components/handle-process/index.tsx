import { event } from "@tauri-apps/api";
import { UnlistenFn } from "@tauri-apps/api/event";
import { Button, Modal, Progress } from "antd";
import { useEffect, useState } from "react";
import './index.less'

interface HandleProcessEvent {
    title: string,
    except: number,
    completed: number
    current: any
}

interface HandleProcessModalProps {
    pid: string;
    open: boolean
    title: string;
    running_event?: string
    exit_event?: string
    onClose: () => void
}


const HandleProcessModal: React.FC<HandleProcessModalProps> = ({ pid, open, title, running_event, exit_event, onClose }) => {

    //状态
    const [stateProccess, setProccess] = useState<HandleProcessEvent | undefined>()
    const [isCancelReady, setCancelReady] = useState<boolean>(false)


    let unRunListen: UnlistenFn;
    let unCancelListen: UnlistenFn

    const registerRun = async (name: string) => {
        //注册运行事件
        unRunListen = await event.listen(name, (event) => {
            setProccess(event.payload as HandleProcessEvent)
        })
    }

    const registerCancel = async (name: string) => {
        //注册退出事件
        unCancelListen = await event.listen(name, (event) => {
            console.info(event);
            onClose()
        })
    }

    //注册事件
    useEffect(() => {

        if (running_event) registerRun(running_event);
        if (exit_event) registerCancel(exit_event);

        return () => {
            if (unRunListen) unRunListen()
            if (unCancelListen) unCancelListen()
        }
    }, [pid, running_event, exit_event])




    const renderCancelContent = () => {
        return <div>
            <div className='title'>确认要终止任务吗？</div>
            <div className='flexR' style={{marginTop: '10px'}}>
                <Button type="default" className="btn-default-auto btn-default-88" onClick={onClose} >确认</Button>
                <Button type="primary" className="btn-primary-auto btn-primary-88" onClick={() => setCancelReady(false)}>取消</Button>
            </div>
        </div>
    }

    const renderRuningContent = () => {
        return <div>
            {
                stateProccess && <div>
                    <div className='title'>{stateProccess.title}</div>
                    <Progress percent={Math.floor((stateProccess.completed / stateProccess.except) * 100)} status="active" showInfo />
                </div> 
            }
            {
                !stateProccess && <div className='title'>{title}</div>
            }
        </div>
    }

    return <Modal title={title}
        open={open}
        onCancel={() => setCancelReady(true)}
        footer={null}
        keyboard={false}
        width={320}
        className="process-wrap">
        {isCancelReady ? renderCancelContent() : renderRuningContent()}
    </Modal>
}

export default HandleProcessModal