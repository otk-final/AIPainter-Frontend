import React, { useEffect, useState, Fragment } from 'react'
import { useLocation, Outlet } from 'umi';
import { useLogin } from '@/uses'
import './index.less';
import { Button, Popover } from 'antd';
import { LoginModule, UserInfoModule, MemberRechargeModule, EnergyRechargeModule } from '@/components'
import updater from '@tauri-apps/plugin-updater';
import assets from '@/assets';
import { LoginOutlined, UserOutlined } from '@ant-design/icons';
import { BaseDirectory, exists, readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { ClientAuthenticationStore } from '@/api';
import { ComfyUIApi } from '@/api/comfyui_api';

export default function Layout(props: any) {

  let { pathname } = useLocation();
  console.info("layout", pathname)

  const { logout, loginState } = useLogin();
  const [isUserInfoOpen, setIsUserInfoOpen] = useState(false);
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isMemberRechargeOpen, setIsMemberRechargeOpen] = useState(false);
  const [isEnergyRechargeOpen, setIsEnergyRechargeOpen] = useState(false);

  useEffect(() => {
    if (!loginState.isLogin) {
      setLoginOpen(true)
    }
    //初始化
    ClientAuthenticationStore.getState().init()
  }, [])

  const openRecharge = (type: "energy" | 'member') => {
    setIsUserInfoOpen(false);
    if (type === 'energy') {
      setIsEnergyRechargeOpen(true);
    } else {
      setIsMemberRechargeOpen(true)
    }
  }

  const renderPopoverContent = () => {
    return (
      <div className="flexC">
        <Button type="text" onClick={() => setIsUserInfoOpen(true)} icon={<UserOutlined />}>个人信息</Button>
        {/* 缺少二次确认 */}
        <Button type="text" onClick={logout} icon={<LoginOutlined />}>退出登陆</Button>
      </div>
    )
  }

  const [updateProgress, setUpdateProgress] = useState<{ total?: number, complated?: number }>()
  const onUpdateEvent = (progress: updater.DownloadEvent) => {
    if (progress.event === "Started") {
      setUpdateProgress({ total: progress.data.contentLength })
    } else if (progress.event === "Progress") {
      setUpdateProgress({ ...updateProgress, complated: progress.data.chunkLength })
    } else if (progress.event === "Finished") {
      //TODO 
    }
  }

  const withUpdateHandler = async () => {


    // let api = new ComfyUIApi()
    // let resp = await api.upload({ subfolder: api.clientId, filename: "abc", type: "input" }, "/Users/hxy/Desktop/图片/2671692240023_.pic.jpg")
    // console.info(resp)



    let content = await readTextFile("sdw.txt", { baseDir: BaseDirectory.Desktop })
    console.info(content)

    // let flag = await exists("/sd", { baseDir: BaseDirectory.Desktop })
    // console.info(flag)
    let flag = await exists("ss.aa", { baseDir: BaseDirectory.Desktop })
    console.info(flag);

    await writeTextFile("sdw.txt", "abcd", { baseDir: BaseDirectory.Desktop, append: true })

    // const update = await updater.check()
    // if (update?.available) {
    //   await update.downloadAndInstall(onUpdateEvent)
    // } else {
    //   console.info('not updated')
    // }
  }

  return (
    <Fragment>
      <div className="navs flexR">
        <div></div>
        <div className="right flexR">
          {loginState.isLogin ?
            <Fragment>
              <div className="endtime-wrap flexR">
                {`账号到期时间:  `}<span className="endtime">{loginState.endTime}</span>
              </div>
              <div className="member" onClick={() => setIsMemberRechargeOpen(true)}>续费超级会员</div>
            </Fragment>
            : null}
          <div className="help" onClick={withUpdateHandler}>?</div>

          {loginState.isLogin ?
            <Popover placement="bottomLeft" content={renderPopoverContent} arrow={false}>
              <img src={assets.userImg} className="user-img" />
            </Popover>
            : <div className='login-btn' onClick={() => setLoginOpen(true)}>登陆/注册</div>}
        </div>
      </div>
      <div className='navs-placeholder'></div>
      <LoginModule isOpen={isLoginOpen} onClose={() => setLoginOpen(false)} />
      <UserInfoModule isOpen={isUserInfoOpen} onClose={() => setIsUserInfoOpen(false)} openRecharge={openRecharge} />
      <MemberRechargeModule isOpen={isMemberRechargeOpen} onClose={() => setIsMemberRechargeOpen(false)} />
      <EnergyRechargeModule isOpen={isEnergyRechargeOpen} onClose={() => setIsEnergyRechargeOpen(false)} />
      <Outlet />
    </Fragment>
  );
}
