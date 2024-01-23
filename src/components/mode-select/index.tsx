import { useComfyUIRepository } from "@/repository/comfyui"
import { QuestionCircleOutlined } from "@ant-design/icons"
import { Select } from "antd"
import { useEffect, useState } from "react"

export interface StyleSelectProps {
    mode?: string
    onChange: (style: string) => void
}

export const ComyUIModeSelect: React.FC<StyleSelectProps> = ({ mode, onChange }) => {

    const comfyuiRepo = useComfyUIRepository(state => state)
    const [styleOptions, setOptions] = useState<any[]>([])

    useEffect(() => {
        //模型
        let styleOptions = comfyuiRepo.items.map(item => {
            return { label: item.name.split(".")[0], value: item.name }
        })
        setOptions(styleOptions)
        if (styleOptions.length > 0) onChange(styleOptions[0].value)
    }, [])

    return (<div className="generate-header flexR">
        <div className="lable">风格选择 <QuestionCircleOutlined /><Select
            className={`select-auto`}
            style={{ width: '300px' }}
            value={mode}
            onChange={onChange}
            options={styleOptions}
        /></div>

    </div>)
}