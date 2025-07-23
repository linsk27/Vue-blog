import { ILoginParams, IRegisterParams, IUserInfo } from './interface'
import { LOGIN_API, REGISTER_API } from './url.const'
import http from '@/api'

const authApi = {
    login: (params: ILoginParams) => {
        return http.post<IUserInfo>(LOGIN_API, params)
    },
    register: (params: IRegisterParams) => {
        return http.post(REGISTER_API, params)
    }
}

export default authApi
