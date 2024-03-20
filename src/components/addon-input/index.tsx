import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, InputNumber } from "antd";
import './index.less'


const AddonNumberInput: React.FC<{ label: string, max?: number, min?: number, step?: number, value: number, onChange: (value: number) => void }> = ({ label, max = 3, min = 0.1, step = 0.1, value, onChange }) => {
    const handleAdd = () => {
        if (value === max) {
            return;
        }
        onChange(Number.parseFloat((value + step).toFixed(1)))
    }

    const handleMinus = () => {
        if (value === min) {
            return;
        }
        onChange(Number.parseFloat((value - step).toFixed(1)))
    }

    return (
        <div className="addon-input-wrap">
            <div className="label">{label}</div>
            <InputNumber size="large"
                controls={false}
                defaultValue={value}
                value={value}
                max={max}
                min={min}
                readOnly
                addonBefore={<Button type="text" onClick={(handleAdd)}><PlusOutlined /></Button>}
                addonAfter={<Button type="text"onClick={handleMinus}><MinusOutlined /></Button>}
            />
        </div>
    )
}

export default AddonNumberInput