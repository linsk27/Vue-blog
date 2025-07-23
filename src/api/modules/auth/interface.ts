export interface ILoginParams {
    username: string
    password: string
}
export interface IUserInfo {
    id: number
    username: string
    avatar?: string
    token: string
}
export interface IRegisterParams {
    username: string
    password: string
    avatar?: string
}
