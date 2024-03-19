import { useLogin } from "@/uses";
import { Button, InputNumber, message, Modal } from "antd"
import { Fragment, useEffect, useState } from "react";
import "./index.less"
import { DefaultClient } from "@/api";
import assets from "@/assets";
import { history } from "umi"

interface LoginModalProps {
    isOpen: boolean,
    onClose: () => void
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    const { login } = useLogin();


    //验证码
    const [countdown, setCountdown] = useState(0);


    const [phone, setPhone] = useState<string>("");
    const [verify, setVerify] = useState<string>("");


    const [isQrCode, setIsQrCode] = useState(false)
    const [agreement, setAgreement] = useState(false);

    useEffect(() => {
        let timer = undefined
        // 当倒计时为0时 清除定时器
        if (countdown === 60) {
            timer = setInterval(() => setCountdown(t => --t), 1000)
        }
        return () => clearInterval(timer)
    }, [countdown])


    const handleGetVerifyCode = async () => {

        if (countdown) return;
        if (!/^[0-9]{11}$/.test(phone)) {
            message.error('请填写正确手机号');
            return;
        }

        //发生验证码
        let resp = await DefaultClient.post('/pb/user/login/sendCode', { key: "+86", value: phone }).then(resp => resp.data)
        console.info(resp)

        //开始倒计时
        setCountdown(60)
    }

    const handleSumbit = async () => {
        if (!phone) {
            return message.error('请填写正确手机号');
        }
        if (!verify) {
            return message.error('请填写验证码');
        }
        await login(phone, verify).then(onClose)
    }


    const renderAddon = () => {
        return (
            <div className="btn-getCode" onClick={handleGetVerifyCode}>{!countdown ? "荻取验证码" : `${countdown}秒后获取`}</div>
        )
    }

    const renderQrCode = () => {
        return (
            <div className="flexC">
                <img src={assets.avatar1} className="qrcode-img" />
                <div className="assist-text">请使用手机微信扫码登录</div>
                <Button type="default" className="btn-default-auto" block onClick={() => setIsQrCode(false)} style={{ width: '148px' }} >返回</Button>
            </div>
        )
    }

    const renderMessage = () => {
        return (
            <Fragment>
                <InputNumber value={phone} className="inputnumber-auto" size="large" controls={false} maxLength={11} placeholder="请输入手机号"
                    onChange={(v) => setPhone(`${v}`)} />
                <InputNumber className="inputnumber-auto" size="large" controls={false} maxLength={4} placeholder="请输入手机验证码"
                    onChange={(v) => setVerify(`${v}`)} addonAfter={renderAddon()} />
                <Button type="primary" className="btn-primary-auto" block onClick={handleSumbit} style={{ marginTop: '40px' }}> 登录 </Button>
                <Button type="default" className="btn-default-auto flexR" block onClick={() => setIsQrCode(true)} style={{ marginTop: '16px', justifyContent: 'center' }} >
                    <img src={assets.wechat} className="wechat" /> 微信登录 </Button>
                <div className="agreement flexR" onClick={() => setAgreement(!agreement)} ><div className={`check ${agreement ? 'cur' : ''}`}></div> 已阅读并同意<span onClick={() => history.push("/agreement")}>鹦鹉智绘用户协议</span>和<span onClick={() => history.push("/privatepage")}>鹦鹉智绘隐私政策</span> </div>
            </Fragment>
        )
    }

    return (
        <Modal
            open={isOpen}
            onCancel={onClose}
            footer={null}
            keyboard={false}
            closeIcon={false}
            className="home-login-modal"
            width={400}>
            <div className="header flexRB">
                <div>登陆</div>
                <div>
                    <img src={assets.foldIcon} className="header-icon" />
                    <img src={assets.closeIcon} className="header-icon" onClick={onClose} />
                </div>
            </div>
            {
                isQrCode ? renderQrCode() : renderMessage()
            }
        </Modal>
    )
}

export default LoginModal