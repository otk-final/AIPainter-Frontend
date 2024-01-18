import { LeftOutlined } from "@ant-design/icons";
import React, { Fragment } from "react";
import './index.less'

interface HeaderProps {
    renderLeft?: React.ReactNode;
    renderRight?: React.ReactNode;
    onQuit?: ()=> void;
}

const Header:React.FC<HeaderProps> = ({renderLeft, renderRight, onQuit})=>{

    const handleQuit = ()=>{
        if(onQuit) {
          return onQuit?.();
        }
        history.back()
    }
    
    return (
        <Fragment>
            <div className='page-header flexR'>
                <div className="flexR">
                    <div className="nav-back" onClick={handleQuit}><LeftOutlined twoToneColor="#fff" /></div>
                    {renderLeft ? renderLeft: null}
                </div>
                {renderRight ? renderRight : null}
            </div>
            <div className='page-header-placeholder'></div>
        </Fragment>
    )
}

export default Header;