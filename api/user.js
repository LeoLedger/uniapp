import fly from '@/utils/fly'
import store from '@/store'

export default {
    // 登录
    login: function login(body) {
        return fly.request({
            url: '/login',
            method: 'post',
            body
        })
    },
    // 退出登录
    logout: function logout(body) {
        return fly.request({
            url: '/login',
            method: 'post',
            body
        })
    },
    // 获取用户信息
    getUserInfo: function() {
        return fly.request({
            url: '/account/userinfo',
            method: 'get'
        })
    },
    // 静默登录
    quietLogin: function quietLogin(params) {
        return fly.request({
            url: '/oauth/wx/login',
            method: 'post',
            params,
            showErrorToast: false
        })
    },
    // 获取验证码
    getCaptcha: function getCaptcha(params) {
        return fly.request({
            url: '/captcha',
            method: 'get',
            params
        })
    },
    // 绑定维修
    bindWeixin: function bindWeixin(params) {
        return fly.request({
            url: '/account/bind-weixin',
            method: 'post',
            params
        })
    },
    // 获取用户权限
    getPermission: function() {
        return fly.request({
            url: '/menu-grant/list?appId=409d1a3c-2068-459c-9f9d-8e591d12d6dc',
            method: 'get'
        })
    }
}
