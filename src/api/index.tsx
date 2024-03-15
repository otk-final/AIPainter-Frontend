import { BaseDirectory, exists, readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";
import { hostname, platform, type, version } from "@tauri-apps/plugin-os";
import axios, { Axios, InternalAxiosRequestConfig } from "axios";
import { createStore } from "zustand";



export interface ClientAuthentication {
    header: any
    user?: UserPrincipal
    init: () => Promise<void>
    refresh: (author: UserAuthentication) => Promise<void>
}

export interface UserAuthentication {
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
    profile: any
}


export const ClientAuthenticationStore = createStore<ClientAuthentication>((set, get) => ({

    header: {
        //应用信息
        "x-tenant-id": process.env.TENANT_ID,
        "x-app-id": process.env.APP_ID,
    },

    init: async () => {

        let header = {
            //应用信息
            "x-tenant-id": process.env.TENANT_ID,
            "x-app-id": process.env.APP_ID,

            // 设备信息
            "x-dev-platform": await platform(),
            "x-dev-type": await type(),
            "x-dev-hostname": await hostname(),
            "x-dev-version": await version(),
        } as any

        //读取文件
        let exist = await exists(".pollyai/.author.json", { baseDir: BaseDirectory.Home })
        if (exist) {
            let jwtText = await readTextFile(".pollyai/.author.json", { baseDir: BaseDirectory.Home })
            let userAuthor = JSON.parse(jwtText) as UserAuthentication
            header["x-user-id"] = userAuthor.principal.id
            header["x-user-type"] = userAuthor.principal.type
            header["Authentication"] = userAuthor.accessToken
            set({ header: header, user: userAuthor.principal })
        } else {
            set({ header: header })
        }
    },

    refresh: async (author: UserAuthentication) => {
        //保存登陆信息
        await writeTextFile(".pollyai/.author.json", JSON.stringify(author), { baseDir: BaseDirectory.Home, append: false })

        //更新accessToken
        let { header } = get()
        header = { ...header, Authentication: author.accessToken }

        set({ header: { ...header }, user: author.principal })
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

export const AuthClient = axios.create({
    baseURL: process.env.AUTH_HOST,
    headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: "Basic " + process.env.AUH_BASIC
    },
    timeout: Number(process.env.AUTH_TIMEOUT || 60000),
    withCredentials: false
})
AuthClient.interceptors.request.use(requestHeaderInterceptor)

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


