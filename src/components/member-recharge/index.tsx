import assets from "@/assets";
import { Button, Modal,  } from "antd"
import { useState } from "react";
import "./index.less"

interface MemberRechargeModuleProps {
    isOpen: boolean,
    onClose: ()=>void
}

const MemberRechargeModule:React.FC<MemberRechargeModuleProps> = ({isOpen, onClose})=> {
    const [price, setPrice] = useState(6800);

    const handlePay = ()=>{
       
    }
   const contentDatas = [
    {
        url: assets.recharge1,
        title: '会员功能丨模型分层使用',
        text: '通过“区城指定"功能、可指定LORA模型仅修改角色的局部特定（脸部，画面风格），而不影响其他画面区域'
    },
    {
        url: assets.recharge2,
        title: '会员功能丨图像化提示词选择',
        text: '可通过提示词的“国例”，更方便查询和使用所需的提示词内容'
    },
    {
        url:  assets.recharge3,
        title: '会员功能|绘画模版',
        text: '可基于小说风格（都市、仙快、末日）自定义多个插画模版、 方便你使用'
    },
   ]

    return (
        <Modal title="会员充值" 
            open={isOpen} 
            onCancel={onClose} 
            footer={null}
            width={900}
            className="home-login-modal member-recharge">
                <div className="section">
                    <div className="name-wrap flexR">
                        <div className="flexR">
                            <img src={assets.userImg} className="user-img"/>
                            <div>用户34444</div>
                        </div>
                        <div>VIP 到期时间：2024-01-26</div>
                    </div>
                    <div className="user-content-wrap flexR">
                        {contentDatas.map((i, index)=>{
                            return (
                                <div className="content-wrap flexC" key={index}>
                                    <img src={i.url} className="icon-img"/>
                                    <div className="title">{i.title}</div>
                                    <div className="text">{i.text}</div>
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className="flexR">
                    <div className={`recharge-item flexC ${price === 6800 ? "cur": ""}`} onClick={()=>setPrice(6800)}>
                        <div className="unit">月度</div>
                        <div className="price-wrap flexR"><span className="unit">¥</span><span className="price">68</span></div>
                        <div className="per">2.3元/天</div>
                    </div>
                    <div className={`recharge-item flexC ${price === 19800 ? "cur": ""}`} onClick={()=>setPrice(19800)}>
                        <div className="unit">半年</div>
                        <div className="price-wrap flexR"><span className="unit">¥</span><span className="price">198</span></div>
                        <div className="per">1.1元/天</div>
                    </div>
                </div>
                <div className="bottom-wrap flexR">
                    <div className="bottom-item flexR"><span className="text">同意并交付</span>  <div className="price-wrap flexR"><span className="unit">¥</span>  <span className="price">{price}</span></div></div>
                    <Button type="primary" block className="bottom-item btn-primary-auto" onClick={handlePay}>去支付</Button>
                </div>
                <div className="assist-wrap flexR">已同意并阅读 <span>会员服务协议</span> </div>
        </Modal>
    )
}

export default MemberRechargeModule