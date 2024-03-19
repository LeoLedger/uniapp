// API
import userApi from '@/api/user'
// 方法
import * as storage from '@/utils/storage'

const defaultUserInfo = {
    avatar: null,
    nickName: null,
    userName: null,
    sex: null,
    phone: null,
    address: null,
    roles: [],
    feature: [],
    appSettings: [],
    tenants: [],
    uuid: null // 唯一标识符
}

const user = {
    state: {
        isLogin: false,
        userInfo: storage.getUserInfo() || defaultUserInfo,
        token: (storage.getToken() || {}).access_token || '',
        refreshToken: (storage.getToken() || {}).refresh_token || '',
        feature: null // 用户权限列表
    },
    mutations: {
        login(state, res) {
            state.isLogin = true
            state.token = res.access_token
            state.refreshToken = res.refresh_token
            storage.setToken(res)
        },
        logout(state) {
            state.isLogin = false
            state.token = ''
            state.refreshToken = ''
            state.feature = []
            storage.clearToken()
            storage.clearUserInfo()
        },
        setUserInfo(state, userInfo) {
            state.userInfo = userInfo
            state.isLogin = true
            storage.setUserInfo(userInfo)
        },
        clearUserInfo(state) {
            state.userInfo = { ...defaultUserInfo }
            storage.clearUserInfo()
            state.isLogin = false
        }
    },
    actions: {
        // 获取用户信息
        getUserInfo({ state, commit, dispatch }) {
            if (state.token) {
                userApi.getUserInfo().then(data => {
                    commit('setUserInfo', data)
                })
                // 获取用户权限
                userApi.getPermission().then(data => {
                    state.feature = data.permissionGrants
                })
                dispatch('initRootData')
            }
        }
    }
}

export default user
