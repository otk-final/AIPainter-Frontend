import { ImitateFrame, useImitateFrameTauriRepository } from "@/repository/tauri_repository"
import { ImitateTabType } from ".."
import { Button } from "antd"
import { useEffect, useState } from "react"

interface AudioExportProps {
    handleChangeTab: (key: ImitateTabType) => void,
}




const Child: React.FC<{ idx: number, data: ImitateFrame }> = ({ idx, data }) => {


    const [stateData, setData] = useState<ImitateFrame>({ ...data })
    console.info("渲染：", idx)

    useEffect(() => {
        const unsub = useImitateFrameTauriRepository.subscribe(
            (state) => state.items[idx],
            (state, prev) => {
                console.info('state change', state)
                setData(state)
            })
        return unsub
    }, [])

    const { doImage, delItem, reactiveItems } = useImitateFrameTauriRepository(state => state)
    const handleUpdate = () => {
        doImage(idx)
    }

    const handleDel = () => {
        delItem(idx)
        reactiveItems(true)
    }
    return (<div>{stateData.path}<Button onClick={handleUpdate}>修改</Button><Button onClick={handleDel}>删除</Button></div>)
}

export const AudioExportTab: React.FC<AudioExportProps> = ({ handleChangeTab }) => {

    const demoRepo = useImitateFrameTauriRepository(state => state)

    const [stateNode, setNode] = useState<string>("")
    useEffect(() => {
        demoRepo.load("xx-d23e")
        const unsub = useImitateFrameTauriRepository.subscribe(
            (state) => state.node,
            (state, prev) => {
                console.info('state change', state)
                setNode(state)
            })
        return unsub
    }, [])

    const handleAdd = () => {
        demoRepo.doImage(0)
    }

    return (<div><Button onClick={handleAdd}>保存</Button>
        {demoRepo.items.map((item, idx) => {
            return <Child key={idx} idx={idx} data={item}></Child>
        })}
        <div>{stateNode}</div>
    </div>)
}
