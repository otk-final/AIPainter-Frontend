import { BaseDirectory, exists, mkdir, readTextFile, remove, writeTextFile } from "@tauri-apps/plugin-fs";
import { hostname, platform, type, version } from "@tauri-apps/plugin-os";
import { message } from "antd";
import axios, { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import { createStore } from "zustand";



export interface ClientAuthorization {
    header: any
    user?: UserPrincipal
    init: () => Promise<UserAuthorization | undefined>
    refresh: (author: UserAuthorization) => Promise<void>
    reset: () => Promise<void>
}

export interface UserAuthorization {
    accessToken: string
    accessExpiresIn: number,
    refreshToken: string,
    refreshExpiresIn: number,
    principal: UserPrincipal
    scopes: string[]
    tokenType: string
}

export interface UserPrincipal {
    type: string
    id: string
    name: string
    profile: {
        vip: string,
        vipExpriedTime: string
        inviteCode: string,
        phone: string
    }
}


export interface ApiResult<T> {
    status: boolean
    code: string
    msg: string
    err: string
    data: T
    currentTime: number
}

const responseInterceptor = (response: AxiosResponse<any, any>) => {
    //协议
    if (response.status !== 200) {
        message.error(response.statusText);
        return Promise.reject(new Error(response.statusText))
    }
    //业务
    let apiResult = response.data as ApiResult<any>
    if (!apiResult.status) {
        message.error(apiResult.err);
        return Promise.reject(new Error(apiResult.err))
    }
    //直接处理业务数据
    return apiResult
}

const initHeader = async () => {
    return {
        //应用信息
        "x-tenant-id": process.env.TENANT_ID,
        "x-app-id": process.env.APP_ID,

        // 设备信息
        "x-dev-platform": await platform(),
        "x-dev-type": await type(),
        "x-dev-hostname": await hostname(),
        "x-dev-version": await version(),
    } as any
}


export const ClientAuthenticationStore = createStore<ClientAuthorization>((set, get) => ({

    header: {
        //应用信息
        "x-tenant-id": process.env.TENANT_ID,
        "x-app-id": process.env.APP_ID,
    },
    init: async () => {
        let header = await initHeader()
        //追加认证信息
        let exist = await exists(process.env.APP_ID + "/author1.json", { baseDir: BaseDirectory.Home })
        if (exist) {
            let jwtText = await readTextFile(process.env.APP_ID + "/author.json", { baseDir: BaseDirectory.Home })
            let userAuthor = JSON.parse(jwtText) as UserAuthorization
            header["x-user-id"] = userAuthor.principal.id
            header["x-user-type"] = userAuthor.principal.type
            header["Authorization"] = userAuthor.tokenType + " " + userAuthor.accessToken
            set({ header: header, user: userAuthor.principal })

            return userAuthor;
        } else {
            set({ header: header })
        }
        return undefined
    },

    refresh: async (newAuthor: UserAuthorization) => {
        //保存登陆信息
        await mkdir(process.env.APP_ID!, { baseDir: BaseDirectory.Home, recursive: true });
        await writeTextFile(process.env.APP_ID + "/author.json", JSON.stringify(newAuthor), { baseDir: BaseDirectory.Home, append: false })

        //更新accessToken 和用户信息
        let { header } = get()

        header = {
            ...header,
            "x-user-id": newAuthor.principal.id,
            "x-user-type": newAuthor.principal.type,
            Authentication: newAuthor.tokenType + " " + newAuthor.accessToken
        }
        set({ header: { ...header }, user: newAuthor.principal })
    },

    reset: async () => {
        //删除文件
        await remove(process.env.APP_ID + "/author.json", { baseDir: BaseDirectory.Home })
        set({ header: await initHeader(), user: undefined })
    }
}))

const requestHeaderInterceptor = (config: InternalAxiosRequestConfig<any>) => {

    //认证状态
    let { getState } = ClientAuthenticationStore
    let { header } = getState()

    //追加请求头
    Object.keys(header).forEach(key => {
        config.headers[key] = header[key]
    })

    return config;
}


/**
 * 统一认证接口
 */
export const AuthClient = axios.create({
    baseURL: process.env.AUTH_HOST,
    headers: {
        //认证统一使用form提交
        "x-tenant-id": process.env.TENANT_ID,
        "x-app-id": process.env.APP_ID,
        'Content-Type': 'application/x-www-form-urlencoded'
    },
    timeout: Number(process.env.AUTH_TIMEOUT || 60000),
    withCredentials: false
})

AuthClient.interceptors.request.use((config) => {
    config.headers.Authorization = "Basic " + process.env.AUTH_CLIENT_BASIC
    return config;
})
AuthClient.interceptors.response.use(responseInterceptor)


/**
 * 统一业务接口
 */
export const DefaultClient = axios.create({
    baseURL: process.env.DEFAULT_HOST,
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
    },
    timeout: Number(process.env.DEFAULT_TIMEOUT || 60000),
    withCredentials: false
})
DefaultClient.interceptors.request.use(requestHeaderInterceptor)
DefaultClient.interceptors.response.use(responseInterceptor)


/**
 * 百度翻译
 */
export const BaiduClient = axios.create({
    baseURL: process.env.BAIDU_HOST,
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Accept': 'application/json'
    },
    timeout: Number(process.env.BAIDU_TIMEOUT || 60000),
    withCredentials: false
})
BaiduClient.interceptors.request.use(requestHeaderInterceptor)

/**
 * 火山引擎
 */
export const BytedanceClient = axios.create({
    baseURL: process.env.BYTEDANCE_HOST,
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Accept': 'application/json'
    },
    timeout: Number(process.env.BYTEDANCE_TIMEOUT || 60000),
    withCredentials: false
})
BytedanceClient.interceptors.request.use(requestHeaderInterceptor)


/**
 * 绘图接口
 */
export const ComfyUIClient = axios.create({
    baseURL: process.env.COMFYUI_HOST,
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Accept': 'application/json'
    },
    timeout: Number(process.env.COMFYUI_TIMEOUT || 60000),
    withCredentials: false
})
ComfyUIClient.interceptors.request.use(requestHeaderInterceptor)


