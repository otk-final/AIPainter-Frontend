import React, { useCallback, useContext, useEffect, useState } from 'react';
import { history } from 'umi'
import { AuthClient, ClientAuthenticationStore, DefaultClient, UserAuthorization, UserPrincipal } from '@/api';
import { useComfyUIRepository } from '@/repository/comfyui';

// info 用户信息
interface LoginAttribute {
    user: UserPrincipal | undefined;
    vip: VipCredential | undefined
    isLogin: () => boolean
    isVip: () => boolean,
    getVipExpridTime: () => string | undefined,
    refreshVip: () => void,
    login: (phone: string, code: string) => Promise<void>;
    logout: () => Promise<void>;
    onUpdate: (props: UserPrincipal) => void
}
// authorization: UserAuthorization

export interface VipCredential {
    vip: boolean,
    expired: boolean,
    expireTime: string
    rechargeTime: string
}

let context: LoginAttribute = {
    user: undefined,
    vip: undefined,
    isLogin: () => {
        return false
    },
    isVip: () => {
        return false
    },
    getVipExpridTime: () => {
        return undefined;
    },
    refreshVip: () => { },
    login: (phone: string, code: string) => {
        return Promise.reject("not suport")
    },
    logout: () => {
        return Promise.reject("not suport")
    },
    onUpdate: (props: UserPrincipal) => {
        return true
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
    const [vipReload, setVipReload] = useState<boolean>(false);
    const [vip, setVipCredential] = useState<VipCredential | undefined>(undefined);

    const initLogin = async () => {
        let author = await init()
        if (author) {
            setUserPrincipal(author.principal);
        }
    }

    const initVip = async () => {
        let apiResult = await DefaultClient.get("/pt/user/vip/credential")
        setVipCredential(apiResult.data)
    }

    //加载登陆信息
    useEffect(() => {
        initLogin()
    }, [])


    //加载vip信息
    useEffect(() => {
        if (user) initVip()
    }, [user, vipReload])


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

    const onUpdate = (props: UserPrincipal) =>{
        setUserPrincipal((res)=>{
            return {...res, ...props}
        });
        return true;
    }

    return React.createElement(
        LoginContext.Provider,
        {
            value: {
                user: up,
                vip: vip,
                isLogin: () => {
                    return up !== undefined
                },
                isVip: () => {
                    //登陆 + 存在 + 未过期
                    return up !== undefined && vip !== undefined && !vip.expired
                },
                getVipExpridTime: () => {
                    if (vip !== undefined) return vip.expireTime
                },
                refreshVip: () => setVipReload(!vipReload),
                login: login,
                logout: logout,
                onUpdate: onUpdate,
            }
        },
        props.children
    )
}