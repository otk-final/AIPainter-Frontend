import React, {useEffect, useState, Fragment} from 'react'
import { Link,  useLocation } from 'umi';
import './index.less'

const SettingPage = () => {
    useEffect(()=>{
        console.log("shouye")
    },[]) 
    

    return (
      <div className="setting-wrap">
        <p>This is umi docs.</p>
      </div>
    );
  };
  
export default SettingPage
  