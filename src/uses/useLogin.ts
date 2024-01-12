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
    updateLoginState: (v: LoginInfo) => void,
    login: (info: any) => void;
    logout: () => void;
  }

let context:LoginAttribute = {
    loginState: defalutLoginInfo,
    updateLoginState: () => {},
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

    const updateLoginState = useCallback((v: LoginInfo)=>{
        setLoginState(res=>{
            return {...v}
        })
    },[])

    return React.createElement(
        LoginContext.Provider,
        {
            value: {
                loginState,
                login,
                logout,
                updateLoginState
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