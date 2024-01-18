import { create } from "zustand"

export interface UserAuth {
    token: string
    refresh_token: string
}


export interface UserIdentificationStorage {
    clientId: string
    userAssistantId?: string
    auth?: UserAuth
}



export const usePersistUserIdentificationStorage = create<UserIdentificationStorage>((set, get) => ({
    clientId: "abc",
    userAssistantId: "asst_iVUdB5cY5Y4yIq6uW5xdNEdM",
}))