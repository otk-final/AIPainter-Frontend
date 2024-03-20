import { Button, Input, Modal, } from "antd"
import "./index.less"
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { useState } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { UserPrincipal } from "@/api";


interface UserInfoModalProps {
    isOpen: boolean,
    user: UserPrincipal,
    onClose: () => void,
    openRecharge: (type: "member" | "energy") => void
}

const UserInfoModal: React.FC<UserInfoModalProps> = ({ isOpen, user, onClose, openRecharge }) => {
    const [stateUserPrincipal, setUserPrincipal] = useState<UserPrincipal>(user)
    const [edit, setEdit] = useState(false);
    const [editInput, setEditInput] = useState<string>('');

    const handleCopy = async () => {
        await writeText(stateUserPrincipal.profile.inviteCode);
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
            <div className="text-item flexRB" onClick={handleCopy}>邀请码：{stateUserPrincipal.profile.inviteCode} <div className="edit cppy">复制邀请码</div></div>
            <div className="text-item flexRB">账号类型：付费账号 </div>
            <div className="text-item flexRB">到期时间：{stateUserPrincipal.profile.vipExpriedTime}<Button className="btn-primary-auto info-btn" onClick={() => openRecharge('member')} type="primary">充值会员</Button></div>
            <div className="text-item">手机号码：{stateUserPrincipal.profile.phone.slice(0, 3)}****{stateUserPrincipal.profile.phone.slice(7)}</div>
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

export default UserInfoModal