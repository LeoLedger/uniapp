// flyio 文档
// https://wendux.github.io/dist/#/doc/flyio/config
import { baseURL, env as VUE_APP_ENV } from './config'
import { goToLoginPage, getDeepValue } from './index'
import { getToken } from './storage'
import store from '@/store'
import Fly from './flyio.min.js'

var fly = new Fly() // 创建fly实例

const fixObjUndefined2Null = (config, objKey) => {
    const params = config[objKey]
    const paramsKeys = Object.keys(params)
    config[objKey] = paramsKeys.reduce((_params, key) => {
        // fix_params 处理
        const val = params[key]
        if (typeof val !== 'undefined' && val !== null) {
            _params[key] = val
        }
        return _params
    }, {})
}
// 根据是否生产环境判断 函数外壳
const environmentalWrap = function(fn) {
    // 在生产环境 禁止 log 输出
    if (VUE_APP_ENV === 'production') {
        return function() {}
    }
    return fn
}

// 当发起请求时的url 及 参数
const requestLog = environmentalWrap(function(config) {
    var params = config.body || config.params
    console.log(`%c request: Start %c ${config.url}`, 'color: #2098ff', 'color: #2098ff',
                'params: ', {
                    object: params,
                    string: JSON.stringify(params)
                }
    )
})

// 当请求发生错误
const errorLog = environmentalWrap(function(res, type = 'default') {
    console.log(`%c request: Error ${type} %c ${res._options.url}`, 'color: #F74242', 'color: #2098ff', 'result: ', res.response)
})

// 当请求成功
const successLog = environmentalWrap(function(res, type = 'default') {
    console.log(`%c request: Success ${type} %c ${getDeepValue(res, ['request', 'url'])}`, 'color: #0EB13C', 'color: #2098ff', 'result: ', res)
})
// 添加拦截器
fly.interceptors.request.use((config, promise) => {
    // 给所有请求添加自定义header
    config.headers['X-Tag'] = 'flyio'
    const token = store.state.token || (getToken() || {}).access_token || ''
    if (token.length > 0) {
        config.headers.token = config.headers.token || token
    }
    // 请求前 针对params中有数据为 null 或者 undefined 的数据 进行过滤 (flyio 对于undefined 的值[可能作为 'undefined'] 带入 后台请求)
    if (typeof (config.params) === 'object') {
        if (!Array.isArray(config.params)) {
            if (Object.keys(config.params || {}).length) {
                fixObjUndefined2Null(config, 'params')
            }
        }
    }
    if (typeof (config.body) === 'object') {
        if (!Array.isArray(config.body)) {
            // 给body 参数进行过滤
            if (Object.keys(config.body || {}).length) {
                fixObjUndefined2Null(config, 'body')
            }
        }
    }
    requestLog(config)
    config.headers['Content-Type'] = config.headers['Content-Type']
    return config
})
// 添加响应拦截器，响应拦截器会在then/catch处理之前执行
fly.interceptors.response.use(
    res => {
        let data = res.data
        successLog(data, 'default')
        switch (data.success) {
        case true:
            if (data.code === 200) {
                return data.data
            } else {
                return data
            }
        case false:
            uni.hideLoading()
            if (res.request.showErrorToast !== false) {
                uni.showToast({
                    icon: 'none',
                    title: data.msg || '网络错误！',
                    duration: 2000
                })
            }
            return Promise.reject(res.engine.response)
        default:
            return data
        }
    },
    (res) => {
        // 请求失败关闭加载动画
        uni.hideLoading()
        // 发生网络错误后会走到这里
        errorLog(res.engine, 'default')
        // 登录信息过期，重新登录
        if (res.engine.status === 401) {
            return goToLoginPage()
        }
        let response = res.engine.response || {}
        if (res.request.showErrorToast !== false) {
            uni.showToast({
                icon: 'none',
                title: response.message || '网络错误！',
                duration: 2000
            })
        }
        return Promise.reject(response)
    }
)
// 配置请求基地址
fly.config.baseURL = baseURL

export default fly
