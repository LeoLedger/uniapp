
const TOKEN_KEY = 'TOKEN'
const USERINFO_KEY = 'USERINFO'
const isDevelopment = process.env.VUE_APP_ENV === 'development'

export function getToken() {
    return uni.getStorageSync(TOKEN_KEY)
}

export function setToken(data) {
    return uni.setStorageSync(TOKEN_KEY, data)
}

export function clearToken() {
    uni.removeStorageSync(TOKEN_KEY)
}

export function getUserInfo() {
    return uni.getStorageSync(USERINFO_KEY)
}

export function setUserInfo(data) {
    return uni.setStorageSync(USERINFO_KEY, data)
}

export function clearUserInfo() {
    uni.removeStorageSync(USERINFO_KEY)
}

export function getItem(key) {
    return uni.getStorageSync(key)
}

export function setItem(key, data) {
    return uni.setStorageSync(key, data)
}
