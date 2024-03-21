import assets from "@/assets";
import { getPriceInt } from "@/utils";
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
        price: 3000,
        time: 1,
        label: '天卡'
    },
    {
        price: 18000,
        time: 7,
        label: '周卡'
    },
    {
        price: 54000,
        time: 30,
        label: '月卡'
    }
]


const RechargeModal: React.FC<MemberRechargeModuleProps> = ({ isOpen, user, vip, onClose }) => {
    const [cur, setCur] = useState(memberDatas[0]);
    const handlePay = () => {
        // updateLoginState({ ...loginState, endTime: "2025-01-26" })
    }

    return (
        <Modal
            open={isOpen}
            title="我的"
            onCancel={onClose}
            footer={null}
            width={712}
            className="member-recharge">
            <div className="name-wrap flexR">
                <div className="flexR">
                    <img src={assets.avatar1} className="user-img" />
                    <div>{user.name}</div>
                </div>
                <div>VIP 到期时间：{vip?.expireTime}</div>
            </div>

            <div className="user-content-wrap flexC">
                <div className="tr th flexR">
                    <div className="td"></div>
                    <div className="td">鹦鹉智绘</div>
                    <div className="td">我们的优势</div>
                    <div className="td">其他软件</div>
                </div>
                <div className="tr odd flexR">
                    <div className="td">AI翻拍<br/>{`(一键追爆款，剪同款)`}</div>
                    <div className="td"><img src={assets.select} className="select"/></div>
                    <div className="td">免购买</div>
                    <div className="td">某软件500元/套，还得自己部署SD环境</div>
                </div>
                <div className="tr flexR">
                    <div className="td">Stable Diffusion</div>
                    <div className="td"><img src={assets.select} className="select"/></div>
                    <div className="td">最新的SDXL模型，直出1080分辨率图片，放大后直接4K分辨率 <br/>类4090算力，免去webui环境配置、下载模型的麻烦</div>
                    <div className="td">Nvidia GPU 4090 约57元/天</div>
                </div>
                <div className="tr odd flexR">
                    <div className="td">GPT-3.5 Turbo</div>
                    <div className="td"><img src={assets.select} className="select"/></div>
                    <div className="td">免购买、免科学上网</div>
                    <div className="td">某GPT官方价格为3.5元/1000 tokens</div>
                </div>
                <div className="tr flexR">
                    <div className="td">翻译</div>
                    <div className="td"><img src={assets.select} className="select"/></div>
                    <div className="td">免购买、免配置</div>
                    <div className="td">49元/百万字</div>
                </div>
                <div className="tr odd flexR">
                    <div className="td">AI配音</div>
                    <div className="td"><img src={assets.select} className="select"/></div>
                    <div className="td end">免购买、剪映同款AI引擎</div>
                    <div className="td">某软件会员39元/月</div>
                </div>
            </div>
            <div className="flexR">
                {memberDatas.map((i, idx) => {
                    let price = getPriceInt(i.price / i.time)
                    let numArr = price.split('.');
                    let num1 = numArr.length> 1 ? `${numArr[0]}.${numArr[1].slice(0,1)}` : price
                    return (
                        <div className={`recharge-item flexC ${cur.price === i.price ? "cur" : ""}`} onClick={() => setCur(i)} key={idx}>
                            <div className="unit">{i.label}</div>
                            <div className="price-wrap flexR"><span className="unit">¥</span><span className="price">{num1}</span><span className="unit">{`/天`}</span></div>
                            <div className="per">{getPriceInt(i.price)}元 | {i.time}天</div>
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