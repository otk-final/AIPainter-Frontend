import fs, { BaseDirectory } from "@tauri-apps/plugin-fs";
import os from "@tauri-apps/plugin-os";
import axios, { InternalAxiosRequestConfig } from "axios";
import { createStore } from "zustand";



export interface ClientAuthentication {
    header: any
    user?: UserPrincipal
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
            "x-dev-arch": await os.arch(),
            "x-dev-platform": await os.platform(),
            "x-dev-type": await os.type(),
            "x-dev-hostname": await os.hostname(),
            "x-dev-version": await os.version(),
        } as any

        //读取文件
        let exist = await fs.exists(".pollyai/.author.json", { baseDir: BaseDirectory.Home })
        if (exist) {
            let jwtText = await fs.readTextFile(".pollyai/.author.json", { baseDir: BaseDirectory.Home })
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
        await fs.writeTextFile(".pollyai/.author.json", JSON.stringify(author), { baseDir: BaseDirectory.Home, append: false })

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

export const BaseClient = axios.create({
    baseURL: process.env.BASE_HOST,
    headers: {
        'Content-Type': 'application/json;charset=utf-8',
        'Accept': 'application/json'
    },
    timeout: Number(process.env.BASE_TIMEOUT || 60000),
    withCredentials: false
})
BaseClient.interceptors.request.use(requestHeaderInterceptor)


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


