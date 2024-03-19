import { useLogin } from "@/uses";
import { Button,  Input,  Modal, } from "antd"
import "./index.less"
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { Fragment, useEffect, useState } from "react";
import { CloseOutlined } from "@ant-design/icons";


interface UserInfoModuleProps {
    isOpen: boolean,
    onClose: ()=>void,
    openRecharge: (type: "member"| "energy")=>void
}

const UserInfoModule:React.FC<UserInfoModuleProps> = ({isOpen, onClose, openRecharge})=> {
    const { loginState, updateLoginState} = useLogin();
    const [edit, setEdit] = useState(false);
    const [inputV, setInputV] = useState("");

    useEffect(()=>{
        setInputV(loginState?.nickName || "")
    },[])

    const handleCopy = async ()=>{
        await writeText(loginState?.inviteCode || "");
    }

    const handleEdit = () =>{
        if(!edit) {
            setEdit(true);
        }else {
            updateLoginState({...loginState, nickName: inputV})
            setEdit(false);
        }
    }

    const renderEnergy = () =>{
        return (
            <Fragment>
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
            </Fragment>
        )
    }
   
    return (
        <Modal
            open={isOpen} 
            onCancel={onClose} 
            footer={null}
            width={320}
            closeIcon={false}
            className="home-user-info">
                <div className="header flexRB">
                    <div className="text">我的</div>
                    <CloseOutlined onClick={onClose}/>
               </div>
                <div className="user-info-title">个人信息</div>
                <div className="text-item flexRB">
                    <div className="flexR">
                        <div> 用户名称： </div>
                        {edit ? <Input size="large" 
                            style={{width: '160px', height: '26px', borderRadius: '2px'}}
                            maxLength={20} 
                            value={inputV} 
                            onChange={(v)=> setInputV(v.target.value)}/> 
                        : loginState?.nickName }
                    </div>
                    <div className="edit" onClick={handleEdit}>{edit ? "保存" : "修改"}</div>
                </div>
                <div className="text-item flexRB" onClick={handleCopy}>邀请码：{loginState.inviteCode} <div className="edit cppy">复制邀请码</div></div>
                <div className="text-item flexRB">账号类型：付费账号 </div>
                <div className="text-item flexRB">到期时间：{loginState?.endTime}<Button className="btn-primary-auto info-btn" onClick={()=>openRecharge('member')}type="primary">充值会员</Button></div>
                <div className="text-item">手机号码：{loginState?.phone?.slice(0,3)}****{loginState?.phone?.slice(7)}</div>
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