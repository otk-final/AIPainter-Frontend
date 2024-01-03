import { useLogin } from "@/uses";
import { Button, Input, message, Modal, Radio } from "antd"
import { Fragment, useEffect, useState } from "react";
import "./index.less"

interface UserInfoModuleProps {
    isOpen: boolean,
    onClose: ()=>void
}

const UserInfoModule:React.FC<UserInfoModuleProps> = ({isOpen, onClose})=> {
    const {login} = useLogin();
   
    return (
        <Modal title="我的" 
            open={isOpen} 
            onCancel={onClose} 
            footer={null}
            width={1005}
            className="home-login-modal home-user-info">
                <div className="user-info-title">个人信息</div>
                <div className="section-item flexR">
                    <div className="section-item-left left-text flexR">用户名称：用户5556 <div className="edit">修改</div></div>
                    <div className="section-item-right left-text  flexR">邀请码：wuioOO <div className="edit cppy">复制邀请码</div></div>
                </div>
                <div className="section-item flexR">
                    <div className="section-item-left left-text flexR">账号类型：付费账号 </div>
                    <div className="section-item-right left-text flexR">到期时间：2024-01-26<Button type="primary">充值会员</Button></div>
                </div>
                <div className="left-text section-item">手机号码：136****5556</div>
                <div className="user-info-title flexR">
                    我的能量
                    <Button className="charge-btn" type="primary">充值能量</Button>
                </div>
                <div className="user-info-bottom flexR">
                    <div  className="flexC">
                        <div className="num">7312</div>
                        <div className="text">总可用能量</div>
                    </div>
                    <div  className="flexC">
                        <div className="num">0</div>
                        <div className="text">付费能量</div>
                    </div>
                    <div  className="flexC">
                        <div className="num">7312</div>
                        <div className="text">免费能量 <span>©</span></div>
                    </div>
                </div>
                <div className="user-info-qrCode-wrap flexR">
                    <div className="flexC">
                        <img className="qrcode-img" src="" alt="" />
                        <div className="qrcode-text">关注官方公众号</div>
                    </div>
                    <div className="flexC">
                        <img className="qrcode-img" src="" alt="" />
                        <div className="qrcode-text">专业服务社群</div>
                    </div>
                </div>
        </Modal>
    )
}

export default UserInfoModule