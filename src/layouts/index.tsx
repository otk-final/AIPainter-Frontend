import React, {useEffect, useState, Fragment} from 'react'
import { Link, useLocation, Outlet } from 'umi';
import { useLogin} from '@/uses'
import './index.less';

export default function Layout(props: any) {
  let { pathname } = useLocation();
  const {login, logout, loginState} = useLogin();
  //大部分页面main-inner有padding，但是有些页面没有，例如首页
  const [hasPadding, setHasPadding] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOk = () => {
    setIsModalOpen(false);
    // const res = {isLogin: true}
    // login(res)
  };

  useEffect(() => {
    if (pathname == '/') {
      setHasPadding(false);
    }
  }, []);
  
  const handleLogin = ()=> {
    setIsModalOpen(true);
  }

  const handleLogout = ()=>{
    logout()
  }

  return (
    <Fragment>
        <div className="navs flexR">
          <div>sss</div>
          <div className="right flexR">
            {loginState.isLogin ? 
            <Fragment>
              <div className="endtime-wrap flexR">
              {`账号到期时间:  `}<span className="endtime">2024-01-26</span>
              </div>
              <div className="member" onClick={()=> console.log("续费超级会员")}>续费超级会员</div>
            </Fragment>
             : null}
            <div className="help">?</div>

            {loginState.isLogin ? <img src='' className="user-img" onClick={handleLogout}/> : <div className='login' onClick={handleLogin}>登陆/注册</div>}
            
          </div>
          {/* <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/docs">Docs</Link>
            </li>
            <li>
              <a href="https://github.com/umijs/umi">Github</a>
            </li>
          </ul> */}
        </div>
        <div
            className={`main-inner ${!hasPadding ? 'no-padding' : ''}`}
          >
            {props.children}
          </div>
          <Outlet/> 
    </Fragment>

    
  );
}
