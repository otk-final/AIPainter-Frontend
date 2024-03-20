import { Button, Input, message, Modal, } from "antd"
import "./index.less"
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { useState } from "react";
import { UserPrincipal } from "@/api";
import { useLogin, VipCredential } from "@/uses/useLogin";
import assets from "@/assets";


interface UserInfoModalProps {
    isOpen: boolean,
    user: UserPrincipal,
    vip: VipCredential | undefined,
    onClose: () => void,
    openRecharge: (type: "member" | "energy") => void
}

const UserInfoModal: React.FC<UserInfoModalProps> = ({ isOpen, user, vip, onClose, openRecharge }) => {
    const [stateUserPrincipal, setUserPrincipal] = useState<UserPrincipal>(user)
    const [edit, setEdit] = useState(false);
    const [editInput, setEditInput] = useState<string>('');
    const { logout } = useLogin();

    const handleCopy = async () => {
        await writeText(stateUserPrincipal.profile.inviteCode).then(()=>{message.success("已复制")})
    }

    const handleEdit = () => {
        if (!edit) {
            setEdit(true);
        } else {
            setUserPrincipal({ ...stateUserPrincipal, name: editInput })
            setEdit(false);
        }
    }

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={320}
            title="我的"
            className="home-user-info">
            <div className="user-info-title">个人信息</div>
            <div className="text-item flexRB">
                <div className="flexR">
                    <div> 用户名称： </div>
                    {edit ? <Input size="large"
                        style={{ width: '160px', height: '26px', borderRadius: '2px' }}
                        maxLength={20}
                        value={editInput}
                        onChange={(v) => setEditInput(v.target.value)} />
                        : stateUserPrincipal.name}
                </div>
                <div className="edit" onClick={handleEdit}>{edit ? "保存" : "修改"}</div>
            </div>
            <div className="text-item flexRB">邀请码：{stateUserPrincipal.profile.inviteCode} <div className="edit cppy" onClick={handleCopy}>复制邀请码</div></div>
            <div className="text-item flexRB">账号类型：{vip?.vip ? "付费会员" : "普通用户"} </div>
            <div className="text-item flexRB">到期时间：{vip?.expireTime} <Button className="btn-primary-auto info-btn" onClick={() => openRecharge('member')} type="primary">充值会员</Button></div>
            <div className="text-item">手机号码：{stateUserPrincipal.profile.phone.slice(0, 3)}****{stateUserPrincipal.profile.phone.slice(7)}</div>
            <div className="logout flexR" onClick={logout}>
                退出登录
                <img src={assets.logout} className="out" />
            </div>
            <div className="user-info-qrCode-wrap flexC">
                    <img className="qrcode-img" src={assets.serviceCode} />
                    <div className="qrcode-text">关注客服微信</div>
            </div>
        </Modal>
    )
}

export default UserInfoModal