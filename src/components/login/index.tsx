import { useLogin } from "@/uses";
import { Button, Input, InputNumber, message, Modal } from "antd"
import { useEffect, useRef, useState } from "react";
import "./index.less"
import { AuthClient } from "@/api";

interface LoginModuleProps {
    isOpen: boolean,
    onClose: () => void
}

const initSecond = 60;
const LoginModule: React.FC<LoginModuleProps> = ({ isOpen, onClose }) => {
    const { login } = useLogin();
    const [count, setCount] = useState(0);
    const [phone, setPhone] = useState("13476259563");
    const [verify, setVerify] = useState("");
    const timeId = useRef()

    useEffect(() => {
        timeId.current && clearInterval(timeId.current);
        return () => {
            clearInterval(timeId.current)
        }
    }, [])

    useEffect(() => {
        // 当倒计时为0时 清除定时器
        if (count === initSecond) {
            timeId.current = setInterval(() => setCount(t => --t), 1000)
        } else if (count <= 0) {
            timeId.current && clearInterval(timeId.current)
        }
    }, [count])


    const handleGetVerifyCode = () => {
        if (count) return;
        if (!/^[0-9]{11}$/.test(phone)) {
            message.error('请填写正确手机号');
            return;
        }
        setCount(initSecond)
    }

    const handleSumbit = async () => {
        if (!phone) {
            return message.error('请填写正确手机号');
        }
        if (!verify) {
            return message.error('请填写验证码');
        }
        let res = {
            isLogin: true,
            nickName: "用户001",
            inviteCode: "wuioOO",
            endTime: '2024-01-26',
            phone: phone
        }
        // login(res);


        //认证
        let resp = await AuthClient.post('/oauth2/token', {
            grant_type: "sms",
            phone: phone,
            smsCode: verify
        }).then(resp => resp.data)

        


        onClose();
    }

    const renderPrefix = () => {
        return (
            <div className="prefix-wrap flexR">+86 <span className="line" /></div>
        )
    }
    return (
        <Modal title="验证码登陆/注册"
            open={isOpen}
            footer={null}
            keyboard={false}
            closeIcon={false}
            className="home-login-modal"
            width={600}>
            <InputNumber value={phone} className="inputnumber-auto" size="large" controls={false} maxLength={11} placeholder="请输入手机号" prefix={renderPrefix()}
                onChange={(v) => setPhone(`${v}`)} />
            <div className="verify-wrap flexR">
                <InputNumber className="inputnumber-auto" size="large" controls={false} placeholder="请输入手机验证码" maxLength={4} onChange={(v) => setVerify(`${v}`)} />
                <div className="btn-getCode" onClick={handleGetVerifyCode}>{!count ? "荻取验证码" : `${count}秒后获取`}</div>
            </div>
            <Input size="large" placeholder="请输入邀请码(可为空）" />

            {/* <Radio className="agreement-wrap flexR" onChange={(v)=> setChecked(v.target.checked)}><div className="label">我已阅读并同意 <span>《用户协议》</span></div></Radio> */}
            <Button type="primary" className="btn-primary-auto" block onClick={handleSumbit} style={{ marginTop: '30px' }}> 确定 </Button>
        </Modal>
    )
}

export default LoginModule