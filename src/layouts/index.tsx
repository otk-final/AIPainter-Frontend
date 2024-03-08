import React, { useEffect, useState, Fragment } from 'react'
import { useLocation, Outlet } from 'umi';
import { useLogin } from '@/uses'
import './index.less';
import { Button, Popover } from 'antd';
import { LoginModule, UserInfoModule, MemberRechargeModule, EnergyRechargeModule } from '@/components'
import { UpdateStatusResult, checkUpdate, installUpdate, onUpdaterEvent } from '@tauri-apps/api/updater';
import { relaunch } from '@tauri-apps/api/process';
import assets from '@/assets';
import { useProjectRepository } from '@/repository/workspace';
import { LoginOutlined, UserOutlined } from '@ant-design/icons';
import { UnlistenFn } from '@tauri-apps/api/event';

export default function Layout(props: any) {
  let { pathname } = useLocation();
  console.info("layout", pathname)

  const { logout, loginState } = useLogin();
  const projectRepo = useProjectRepository(state => state)
  const [isUserInfoOpen, setIsUserInfoOpen] = useState(false);
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isMemberRechargeOpen, setIsMemberRechargeOpen] = useState(false);
  const [isEnergyRechargeOpen, setIsEnergyRechargeOpen] = useState(false);

  useEffect(() => {
    if (!loginState.isLogin) {
      setLoginOpen(true)
    }
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

  let unsub: UnlistenFn
  const regUpdateEvent = async () => {
    unsub = await onUpdaterEvent(({ error, status }) => {
      console.info("update", error, status)
    })
  }

  useEffect(() => {
    regUpdateEvent()
    return unsub!
  }, [])


  const withUpdateHandler = async () => {
    const { shouldUpdate, manifest } = await checkUpdate()
    console.info('not updated', shouldUpdate, manifest)

    if (shouldUpdate) {
      // You could show a dialog asking the user if they want to install the update here.
      console.log(
        `Installing update ${manifest?.version}, ${manifest?.date}, ${manifest?.body}`
      )

      // Install the update. This will also restart the app on Windows!
      await installUpdate()

      // On macOS and Linux you will need to restart the app manually.
      // You could use this step to display another confirmation dialog.
      await relaunch()
    } else {
      console.info('not updated')
    }
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
