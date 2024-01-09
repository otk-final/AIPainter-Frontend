import { useLogin } from "@/uses";
import { Button,  Modal, } from "antd"
import "./index.less"
import { writeText, readText } from '@tauri-apps/api/clipboard';


interface UserInfoModuleProps {
    isOpen: boolean,
    onClose: ()=>void,
    openRecharge: (type: "member"| "energy")=>void
}

const UserInfoModule:React.FC<UserInfoModuleProps> = ({isOpen, onClose, openRecharge})=> {
    const { loginState} = useLogin();

    const handleCopy = async ()=>{
        await writeText(loginState?.inviteCode || "");
    }
   
    return (
        <Modal title="我的" 
            open={isOpen} 
            onCancel={onClose} 
            footer={null}
            width={900}
            className="home-login-modal home-user-info">
                <div className="user-info-title">个人信息</div>
                <div className="section-item flexR">
                    <div className="section-item-left left-text flexR">用户名称：{loginState?.nickName} <div className="edit">修改</div></div>
                    <div className="section-item-right left-text  flexR" onClick={handleCopy}>邀请码：{loginState.inviteCode} <div className="edit cppy">复制邀请码</div></div>
                </div>
                <div className="section-item flexR">
                    <div className="section-item-left left-text flexR">账号类型：付费账号 </div>
                    <div className="section-item-right left-text flexR">到期时间：{loginState?.endTime}<Button className="btn-primary-auto info-btn" onClick={()=>openRecharge('member')}type="primary">充值会员</Button></div>
                </div>
                <div className="left-text section-item">手机号码：{loginState?.phone?.slice(0,3)}****{loginState?.phone?.slice(7)}</div>
                <div className="user-info-title flexR">
                    我的能量
                    <Button className="btn-primary-auto info-btn"  onClick={()=>openRecharge('energy')} type="primary">充值能量</Button>
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