import React, { useCallback, useContext, useEffect, useState } from 'react';
import { history } from 'umi'
import { AuthClient, ClientAuthenticationStore, UserAuthorization, UserPrincipal } from '@/api';
import { useComfyUIRepository } from '@/repository/comfyui';

// info 用户信息
interface LoginAttribute {
    user: UserPrincipal | undefined;
    isLogin: () => boolean
    isVip: () => boolean,
    getVipExpridTime: () => string | undefined,
    login: (phone: string, code: string) => Promise<void>;
    logout: () => Promise<void>;
}
// authorization: UserAuthorization

let context: LoginAttribute = {
    user: undefined,
    isLogin: () => {
        return false
    },
    isVip: () => {
        return false
    },
    getVipExpridTime: () => {
        return undefined;
    },
    login: (phone: string, code: string) => {
        return Promise.reject("not suport")
    },
    logout: () => {
        return Promise.reject("not suport")
    }
}
const LoginContext = React.createContext<LoginAttribute>(context);


export const useLogin = () => {
    return useContext(LoginContext);
}

export const LoginProvider = (props: any) => {
    //直接从文件中读取
    let { user, init, refresh, reset } = ClientAuthenticationStore.getState()
    //存储状态
    const [up, setUserPrincipal] = useState<UserPrincipal | undefined>(user);

    const initLogin = async () => {
        let author = await init()
        if (author) {
            setUserPrincipal(author.principal);
        }
    }

    //加载
    useEffect(() => {
        initLogin()
    }, [])

    const comfyuiRepo = useComfyUIRepository(state => state)

    const login = useCallback(async (phone: string, smsCode: string) => {
        //认证
        let resp: any = await AuthClient.post('/oauth2/token', {
            grant_type: "sms",
            phone: phone,
            smsCode: smsCode
        })
        let author = resp.data as UserAuthorization
        setUserPrincipal(author.principal)

        //下载配置信息
        await comfyuiRepo.download()

        //更新
        await refresh(author)
    }, [])

    const logout = useCallback(async () => {
        //删除文件
        await reset()
        //主页
        history.replace('/')
    }, [])


    return React.createElement(
        LoginContext.Provider,
        {
            value: {
                user: up,
                isLogin: () => {
                    return up !== undefined
                },
                isVip: () => {
                    return up !== undefined && up.profile["vip"]
                },
                getVipExpridTime: () => {
                    return up !== undefined && up.profile["vipExpiredTime"]
                },
                login: login,
                logout: logout,
            }
        },
        props.children
    )
}