import React, { useCallback, useContext, useEffect, useState } from 'react';
import { getCache, setCache } from '@/utils';
import {history} from 'umi'
var defalutLoginInfo = { isLogin: false };
export var LOGIN_INFO = 'LOGIN_INFO';

interface LoginInfo {
    isLogin: boolean,
    nickName?: string,
    inviteCode?: string,
    endTime?: string,
    phone?: string
}

// info 用户信息
interface LoginAttribute {
    loginState: LoginInfo;
    login: (info: any) => void;
    logout: () => void;
  }

let context:LoginAttribute = {
    loginState: defalutLoginInfo,
    login: ()=>{},
    logout: ()=>{}
}

var LoginContext = React.createContext(context);

export const useLogin = ()=>{
    return useContext(LoginContext);
}

export const LoginProvider = (props: any) => {
    const [loginState, setLoginState] = useState(defalutLoginInfo);


    useEffect(()=>{
        let state: LoginInfo = getCache(LOGIN_INFO) as LoginInfo  || defalutLoginInfo;
        console.log('login info', state)
        if(state.isLogin) {
            setLoginState(state);
        }
    }, [])

    const login = useCallback((res: LoginInfo)=>{
        setLoginState(res);
        setCache(LOGIN_INFO, res);
    }, [])

    const logout = useCallback(()=>{
        setLoginState(defalutLoginInfo);
        setCache(LOGIN_INFO, defalutLoginInfo);
        history.replace('/')
    },[])

    return React.createElement(
        LoginContext.Provider,
        {
            value: {
                loginState,
                login,
                logout
            }
        },
        props.children
    )
} 


/**
 * 获取登录信息
 */
export const getLoginInfo: () => LoginInfo = () => {
    let state: LoginInfo = getCache(LOGIN_INFO) as LoginInfo  || defalutLoginInfo;
    return state;
};