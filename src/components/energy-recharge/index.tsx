import { MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Modal } from "antd"
import { useState } from "react";
import "./index.less"

interface EnergyRechargeModuleProps {
    isOpen: boolean,
    onClose: ()=>void
}

const EnergyRechargeModule:React.FC<EnergyRechargeModuleProps> = ({isOpen, onClose})=> {
    const [energy, setEnergy] = useState(1000);

    const handlePay = ()=>{
    }
   

    return (
        <Modal title="能量充值" 
            open={isOpen} 
            onCancel={onClose} 
            footer={null}
            width={840}
            className="home-login-modal energy-recharge">
                <div className="title">充值金额</div>
                <div className="flexR energy-wrap">
                    <div className="flexR">
                        <Button type="text" className="energy-item-style addon"><PlusOutlined /></Button>
                        <div className="flexR energy-item-style energy-count">
                            <img src="" alt="" className="energy-img" />
                            <div>{energy}</div>
                            <div>能量</div>
                        </div>
                        <Button type="text" className="energy-item-style addon"><MinusOutlined /></Button>
                    </div>
                    <div className="energy-item-style price-wrap">28.80元</div>
                </div>
                <div className="section">
                    <div className="section-header">限时特惠</div>
                    <div className="section-content flexR">
                        <div className="flexR">
                            <img src="" alt="" className="energy-img" />
                            <div className="text">{energy}能量</div>
                        </div>
                        <div className="sale-wrap flexR">
                            <div className="text">售价</div>
                            <div className="price">¥28.80 </div>
                            <div className="del-price">¥40.00</div>
                            <div className="hot">限时特惠</div>
                        </div>
                    </div>
                </div>
                <div className="assist-text">说明：单笔最小充值 100000 能量，能量用于关键词推理和描述词翻译。</div>
                <div className="assist-text">1万能量 =3万个翻译字节</div>
                <Button type="primary" block className="bottom-item btn-primary-auto" onClick={handlePay}>去支付</Button>

        </Modal>
    )
}

export default EnergyRechargeModule