import React, {useEffect, useState, Fragment} from 'react'
import { Link, IRouteComponentProps, useLocation } from 'umi';

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
  