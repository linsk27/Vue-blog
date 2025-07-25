/**
 * @description pinia持久化参数配置
 * @param {String} key 存储到持久化的 name
 * @return persist
 * */
const piniaPersistConfig = (key: string) => {
    const persist = {
        key,
        storage: window.localStorage
    }
    return persist
}

export default piniaPersistConfig
