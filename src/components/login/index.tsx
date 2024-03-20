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
const COUNTDOWN_NUM = 60
const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
    const { login } = useLogin();


    //验证码
    const [countdown, setCountdown] = useState<number>(COUNTDOWN_NUM);
    const [isRetry, setRetry] = useState<boolean>(false);


    const [phone, setPhone] = useState<string>("");
    const [verify, setVerify] = useState<string>("");


    const [isQrCode, setIsQrCode] = useState(false)
    const [agreement, setAgreement] = useState(false);

    const startCountdown = () => {
        const intervalId = setInterval(() => {
            setCountdown((prevCount) => prevCount - 1);
        }, 1000);
        return intervalId;
    };

    useEffect(() => {
        if (!isRetry) {
            return
        }
        const intervalId = startCountdown();
        return () => {
            console.info("移除：", intervalId)
            clearInterval(intervalId);
        };
    }, [isRetry]);

    useEffect(() => {
        if (countdown === 0) setRetry(false)
    }, [countdown])

    const handleGetVerifyCode = async () => {

        if (isRetry) return;
        if (!/^[0-9]{11}$/.test(phone)) {
            message.error('请填写正确手机号');
            return;
        }

        // 发生验证码
        let resp = await DefaultClient.post('/pb/user/login/sendCode', { key: "+86", value: phone }).then(resp => resp.data)
        console.info(resp)

        //开始倒计时
        setCountdown(COUNTDOWN_NUM - 1)
        setRetry(!isRetry)
    }

    const handleSumbit = async () => {
        if (!phone) {
            return message.error('请填写正确手机号');
        }
        if (!verify) {
            return message.error('请填写验证码');
        }
        await login(phone, verify).then(onClose).catch(() => { })
    }


    const renderAddon = () => {
        return (
            <div className="btn-getCode" onClick={handleGetVerifyCode}>{isRetry ? `${countdown}秒后获取` : "荻取验证码"}</div>
        )
    }

    const renderQrCode = () => {
        return (
            <div className="flexC" style={{marginTop: '20px'}}>
                <img src={assets.avatar1} className="qrcode-img" />
                <div className="assist-text">请使用手机微信扫码登录</div>
                <Button type="default" className="btn-default-auto" block onClick={() => setIsQrCode(false)} style={{ width: '148px' }} >返回</Button>
            </div>
        )
    }

    const renderMessage = () => {
        return (
            <Fragment>
                <InputNumber style={{marginTop: '20px'}} value={phone} className="inputnumber-auto" size="large" controls={false} maxLength={11} placeholder="请输入手机号"
                    onChange={(v) => setPhone(`${v}`)} />
                <InputNumber className="inputnumber-auto" size="large" controls={false} maxLength={6} placeholder="请输入手机验证码"
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
            title="登陆"
            className="home-login-modal"
            width={400}>
            {
                isQrCode ? renderQrCode() : renderMessage()
            }
        </Modal>
    )
}

export default LoginModal