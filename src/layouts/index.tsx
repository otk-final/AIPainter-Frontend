import React, {useEffect, useState, Fragment} from 'react'
import { Link, IRouteComponentProps, useLocation, Outlet } from 'umi';
import './index.less';

export default function Layout(props: IRouteComponentProps) {
  let { pathname } = useLocation();
  //大部分页面main-inner有padding，但是有些页面没有，例如首页
  const [hasPadding, setHasPadding] = useState(true);
  useEffect(() => {
    if (pathname == '/') {
      setHasPadding(false);
    }
  }, []);


  return (
    <Fragment>
        <div className="navs flexR">
          <div>sss</div>
          <div className="right flexR">
            <div className="endtime-wrap flexR">
            {`账号到期时间:  `}<span className="endtime">2024-01-26</span>
            </div>
            <div className="member" onClick={()=> console.log("续费超级会员")}>续费超级会员</div>
            <div className="help">?</div>
            <div className="user-img"></div>
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
