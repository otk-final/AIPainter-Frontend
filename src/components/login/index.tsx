import { useLogin } from "@/uses";
import { Button, Input, InputNumber, message, Modal, Radio } from "antd"
import { useState } from "react";
import "./index.less"

interface LoginModuleProps {
    isOpen: boolean,
    onClose: ()=>void
}

const LoginModule:React.FC<LoginModuleProps> = ({isOpen, onClose})=> {
    const {login} = useLogin();
    const [count, setcount] = useState(60);
    const [phone, setPhone] = useState("");
    const [verify, setVerify] = useState("");
    const [checked, setChecked] = useState(false);

    const handleGetVerifyCode = ()=> {
        if(!/^[0-9]{11}$/.test(phone)) {
            message.error('请填写正确手机号');
            return;
        } else {
            console.log("sss");
            // setTimeout()
            
        }
    }

    const handleSumbit = () => {
        if(!phone) {
            return message.error('请填写正确手机号');
        }

        if(!checked) {
           return message.error('请勾选《用户协议》');
        }

        if(!verify) {
            return message.error('请填写验证码');
        }

        if(phone && verify && checked) {
            let res = {
                isLogin: true, 
                nickName: "用户5556",
                inviteCode: "wuioOO",
                endTime: '2024-01-26',
                phone: '12345678890' 
            }
            login(res);
            onClose();
        }
    }

    const renderPrefix = ()=>{
        return (
            <div className="prefix-wrap flexR">+86 <span className="line"/></div>
        )
    }
    return (
        <Modal title="验证码登陆/注册" 
            open={isOpen} 
            onCancel={onClose} 
            footer={null}
            className="home-login-modal"
            width={600}>
            <InputNumber  className="inputnumber-auto" size="large" controls={false} maxLength={11} placeholder="请输入手机号" prefix={renderPrefix()} 
            onChange={(v)=> setPhone(`${v}`)}/>
            <div className="verify-wrap flexR">
                <InputNumber  className="inputnumber-auto" size="large" controls={false} placeholder="请输入手机验证码" maxLength={4} onChange={(v)=> setVerify(`${v}`)}/>
                <div className="btn-getCode" onClick={handleGetVerifyCode}>荻取验证码</div>
            </div>
            <Input size="large" placeholder="请输入邀请码(可为空）"  />

            <Radio className="agreement-wrap flexR" onChange={(v)=> setChecked(v.target.checked)}><div className="label">我已阅读并同意 <span>《用户协议》</span></div></Radio>
            <Button type="primary" className="btn-primary-auto" block onClick={handleSumbit}> 确定 </Button>
        </Modal>
    )
}

export default LoginModule