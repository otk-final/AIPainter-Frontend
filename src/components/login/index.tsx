import { useLogin } from "@/uses";
import { Button, InputNumber, message, Modal, Radio } from "antd"
import { Fragment, useEffect, useRef, useState } from "react";
import "./index.less"
import { AuthClient, ClientAuthenticationStore, DefaultClient, UserAuthorization } from "@/api";
import assets from "@/assets";
import { history } from "umi"

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
    const [isQrCode, setIsQrCode] = useState(false)
    const [agreement, setAgreement] = useState(false);
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


    const handleGetVerifyCode = async () => {
        if (count) return;
        if (!/^[0-9]{11}$/.test(phone)) {
            message.error('请填写正确手机号');
            return;
        }

        //发生验证码
        let resp = await DefaultClient.post('/pb/user/login/sendCode', { key: "+86", value: phone }).then(resp => resp.data)
        console.info(resp)

        setCount(initSecond)
    }

    let { refresh } = ClientAuthenticationStore.getState()
    const handleSumbit = async () => {
        if (!phone) {
            return message.error('请填写正确手机号');
        }
        if (!verify) {
            return message.error('请填写验证码');
        }

        //认证
        let resp: any = await AuthClient.post('/oauth2/token', {
            grant_type: "sms",
            phone: phone,
            smsCode: verify
        }).catch(() => { })
        if (!resp){
            return
        }
        let author = resp.data as UserAuthorization

        //存储认证信息
        await refresh(author)

        //添加用户信息
        login({
            isLogin: true,
            nickName: author.principal.name,
            inviteCode: author.principal.profile["inviteCode"],
            endTime: author.principal.profile["vipExpiredTime"],
            phone: phone
        });

        onClose();
    }


    const renderAddon = () =>{
        return (
            <div className="btn-getCode" onClick={handleGetVerifyCode}>{!count ? "荻取验证码" : `${count}秒后获取`}</div>
        )
    }

    const renderQrCode = ()=>{
        return (
            <div className="flexC"> 
                 <img src={assets.avatar1} className="qrcode-img" />
                 <div className="assist-text">请使用手机微信扫码登录</div>
                 <Button type="default" className="btn-default-auto" block onClick={()=> setIsQrCode(false)} style={{width: '148px'}} >返回</Button>
            </div>
        )
    }

    const renderMessage = ()=>{
        return (
            <Fragment>
                 <InputNumber value={phone} className="inputnumber-auto" size="large" controls={false} maxLength={11} placeholder="请输入手机号" 
                    onChange={(v) => setPhone(`${v}`)} />
                <InputNumber className="inputnumber-auto" size="large" controls={false} maxLength={4}  placeholder="请输入手机验证码" 
                    onChange={(v) => setVerify(`${v}`)}  addonAfter={renderAddon()} />
                <Button type="primary" className="btn-primary-auto" block onClick={handleSumbit} style={{ marginTop: '40px' }}> 登录 </Button>
                <Button type="default" className="btn-default-auto flexR" block onClick={()=> setIsQrCode(true)} style={{ marginTop: '16px', justifyContent: 'center'}} >
                <img src={assets.wechat} className="wechat"/> 微信登录 </Button>
                <div className="agreement flexR" onClick={()=> setAgreement(!agreement)} ><div className={`check ${agreement ? 'cur' : ''}`}></div> 已阅读并同意<span onClick={()=> history.push("/agreement")}>鹦鹉智绘用户协议</span>和<span onClick={()=> history.push("/privatepage")}>鹦鹉智绘隐私政策</span> </div>
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

export default LoginModule