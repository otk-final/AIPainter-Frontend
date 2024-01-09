import React, {useEffect, useState, Fragment} from 'react'
import { Link, useLocation, Outlet } from 'umi';
import { useLogin} from '@/uses'
import './index.less';
import { Button, Popover } from 'antd';
import LoginModule from '@/components/login';
import UserInfoModule from '@/components/user-info';
import MemberRechargeModule from '@/components/member-recharge';

export default function Layout(props: any) {
  let { pathname } = useLocation();
  const {login, logout, loginState} = useLogin();
  const [isUserInfoOpen, setIsUserInfoOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMemberRechargeOpen, setIsMemberRechargeOpen] = useState(false);

  
  const handleLogin = ()=> {
    setIsModalOpen(true);
  }

  const renderPopoverContent = ()=>{
    return (
      <div className="flexC">
        <Button type="text" onClick={()=> setIsUserInfoOpen(true)}>个人信息</Button>
        {/* 缺少二次确认 */}
        <Button type="text" onClick={logout}>退出登陆</Button>
      </div>
    )
  }

  return (
    <Fragment>
        <div className="navs flexR">
          <div className='left flexR'>
            <span className="point"/>
            <div className='status-text'>未启动</div>
            <div>Stable-Diffusion-WebUI</div>
          </div>
          <div className="right flexR">
            {loginState.isLogin ? 
            <Fragment>
              <div className="endtime-wrap flexR">
              {`账号到期时间:  `}<span className="endtime">2024-01-26</span>
              </div>
              <div className="member" onClick={()=> setIsMemberRechargeOpen(true)}>续费超级会员</div>
            </Fragment>
             : null}
            <div className="help">?</div>

            {loginState.isLogin ?  
             <Popover placement="bottomLeft"  content={renderPopoverContent} arrow={false}>
              <img src='' className="user-img"/>
              </Popover>
             : <div className='login-btn' onClick={handleLogin}>登陆/注册</div>}
            
          </div>
        </div>
        <div className='navs-placeholder'></div>
        <LoginModule isOpen={isModalOpen} onClose={()=> setIsModalOpen(false)}/>
        <UserInfoModule isOpen={isUserInfoOpen} onClose={()=> setIsUserInfoOpen(false)}/>
        <MemberRechargeModule isOpen={isMemberRechargeOpen} onClose={()=> setIsMemberRechargeOpen(false)}/>
        <Outlet/> 
    </Fragment>
  );
}
