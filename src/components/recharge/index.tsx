import assets from "@/assets";
import { getPriceInt } from "@/utils";
import { CloseOutlined } from "@ant-design/icons";
import { Button, Modal, } from "antd"
import { useState } from "react";
import "./index.less"
import { UserPrincipal } from "@/api";
import { VipCredential } from "@/uses/useLogin";

interface MemberRechargeModuleProps {
    isOpen: boolean,
    user: UserPrincipal,
    vip: VipCredential | undefined,
    onClose: () => void
}
const memberDatas = [
    {
        price: 6800,
        time: 30,
        label: '月度'
    },
    {
        price: 19800,
        time: 180,
        label: '半年'
    }
]


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
        url: assets.recharge3,
        title: '会员功能|绘画模版',
        text: '可基于小说风格（都市、仙快、末日）自定义多个插画模版、 方便你使用'
    },
]

const RechargeModal: React.FC<MemberRechargeModuleProps> = ({ isOpen, user, vip, onClose }) => {
    const [cur, setCur] = useState(memberDatas[0]);
    const handlePay = () => {
        // updateLoginState({ ...loginState, endTime: "2025-01-26" })
    }

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={712}
            closeIcon={false}
            className="member-recharge">
            <div className="header flexRB">
                <div className="text">我的</div>
                <CloseOutlined onClick={onClose} />
            </div>
            <div className="name-wrap flexR">
                <div className="flexR">
                    <img src={assets.avatar1} className="user-img" />
                    <div>{user.name}</div>
                </div>
                <div>VIP 到期时间：{vip?.expireTime}</div>
            </div>
            <div className="user-content-wrap flexR">
                {contentDatas.map((i, index) => {
                    return (
                        <div className="content-wrap flexC" key={index}>
                            <img src={i.url} className="icon-img" />
                            <div className="title">{i.title}</div>
                            <div className="text">{i.text}</div>
                        </div>
                    )
                })}
            </div>
            <div className="flexR">
                {memberDatas.map((i, idx) => {
                    return (
                        <div className={`recharge-item flexC ${cur.price === i.price ? "cur" : ""}`} onClick={() => setCur(i)} key={idx}>
                            <div className="unit">{i.label}</div>
                            <div className="price-wrap flexR"><span className="unit">¥</span><span className="price">{getPriceInt(i.price)}</span></div>
                            <div className="per">{(i.price / i.time / 100).toFixed(1)}元/天</div>
                        </div>
                    )
                })}
            </div>
            <div className="bottom-wrap flexR">
                <div className="bottom-item flexR">
                    <span className="text">同意并交付</span>
                    <div className="price-wrap flexR">
                        <span className="unit">¥</span>
                        <span className="price">{getPriceInt(cur.price)}</span>
                    </div>
                </div>
                <Button type="primary" block className="bottom-item btn-primary-auto" onClick={handlePay}>去支付</Button>
            </div>
            {/* <div className="assist-wrap flexR">已同意并阅读 <span>会员服务协议</span> </div> */}
        </Modal>
    )
}

export default RechargeModal