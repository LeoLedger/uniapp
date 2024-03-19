
// API
import userApi from '@/api/user'
// 工具
import store from '@/store'
import enums from '@/utils/enum'
import gcoord from 'gcoord'
import { isEmpty } from '@/components/sy-ui/utils'
import { baseURL } from './config'
import { getToken } from './storage'
import QQMapWX from '@/utils/qqmap-wx-jssdk.min.js'

export const MAP_KEY = '6IJBZ-QGZ62-GYWUM-CZ47S-UC2DQ-JMBVZ'
// 实例化微信jssdk
export const QQMapSDK = new QQMapWX({
    key: MAP_KEY
})

export const uploadFileUrl = baseURL + 'fmp/upload' // + fileId // 附件上传路径
export const previewImgSrc = baseURL + 'fmp/thumbImage/' // 略缩图 fileId
export const baseImgSrc = baseURL + 'fmp/open/' // 整图 fileId
export const baseDownSrc = baseURL + 'fmp/download/' // 下载文件路径 fileId
export const imgReg = /(.*)\.(jpg|bmp|gif|ico|pcx|jpeg|tif|png|raw|tga)$/ // 图片匹配正则
export const videoReg = /(.*)\.(mp4|3gp|mov|m4v|avi|m3u8|webm)$/ // 视频匹配正则
export const idCardReg = /^[1-9]\d{5}(18|19|20)\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/

// #ifdef H5
wx.login = function(option) {
    option.success && option.success({ code: '' })
}
// #endif

// 对象转url参数
export function objectToUrl(obj) {
    if (!isEmpty(obj) && typeof obj === 'object') {
        return Object.keys(obj).map(key => {
            return `${key}=${obj[key]}`
        }).join('&')
    }
}
/**
 * @param obj 【检测对象】
 * @param keyArr 【需要获取该对象内部数据key数组】
 * @returns {*}
 */
export function getDeepValue(obj, keyArr) {
    return keyArr.reduce((acc, key) => {
        return acc[key] ? acc[key] : ''
    }, obj)
}
/**
 * 坐标点互转
 * @param location: [longitude || lng, latitude || lat]     [经度, 纬度]
 * @param isTransGCJ02 true || false  是否转译为GCJ02
 * @returns {GeoJSON | Position | Array} eg: [longitude, latitude] 被转译后的 新数据
 */
export function GCOORD_transform(location = [], isTransGCJ02 = false) {
    const trans = isTransGCJ02 ? [gcoord.BD09, gcoord.GCJ02] : [gcoord.GCJ02, gcoord.BD09]
    try {
        return gcoord.transform(location, ...trans)
    } catch (e) {
        // 失败 操作
        return [0, 0]
    }
}
/**
 *  根据坐标点获取当前详细地址
 */
export function getCurAddressData({
    latKey = 'lat',
    lngKey = 'lng',
    addressKey = 'address',
    isGeocoder = true
} = {}) {
    return new Promise(function(resolve, reject) {
        // #ifdef H5
        let time = 1000
        // #endif
        // #ifndef H5
        let time = 10000
        // #endif
        let timeout = false
        let timer = setTimeout(() => {
            timeout = true
            reject('操作超时！')
        }, time)
        uni.getLocation({
            type: 'gcj02',
            complete({ latitude, longitude }) {
                if (timeout) return
                if (isGeocoder) {
                    QQMapSDK.reverseGeocoder({
                        location: {
                            latitude,
                            longitude
                        },
                        complete: (res) => {
                            if (timeout) return
                            if (res.status === 0) {
                                clearTimeout(timer)
                                resolve({
                                    [latKey]: latitude,
                                    [lngKey]: longitude,
                                    [addressKey]: res.result.address || ''
                                })
                            } else {
                                reject(res)
                            }
                        },
                        fail: () => {
                            if (timeout) return
                            clearTimeout(timer)
                            reject()
                        }
                    })
                } else {
                    clearTimeout(timer)
                    resolve({
                        [latKey]: latitude,
                        [lngKey]: longitude
                    })
                }
            },
            fail: () => {
                if (timeout) return
                clearTimeout(timer)
                reject()
            }
        })
    })
}
// 提示重新登录
export function goToLoginPage() {
    // #ifdef H5
    // if (1) return
    // #endif
    // 如果是首页，不会提示登录
    if (getCurrentPages().slice(-1)[0].route === 'pages/tabBar/home') return

    var token = getToken().access_token
    if (token) {
        uni.showModal({
            title: '提示',
            content: '登录信息已过期，请重新登录',
            showCancel: false,
            success: () => {
                store.commit('logout')
                uni.redirectTo({
                    url: '/pages/user/login?returnUrl='
                })
            }
        })
    } else {
        uni.showModal({
            title: '提示',
            content: '该功能需要登录，是否前往登录？',
            success: ({ confirm, cancel }) => {
                if (confirm) {
                    uni.reLaunch({
                        url: '/pages/user/login?returnUrl='
                    })
                } else if (cancel) {
                    uni.navigateBack()
                }
            }
        })
    }
}
// 静默登录
export function quietLogin() {
    return new Promise((resolve, reject) => {
        wx.login({
            success: ({ code }) => {
                userApi.quietLogin({ code }).then(data => {
                    store.commit('login', data)
                }).finally(() => {
                    store.dispatch('getUserInfo')
                    resolve()
                })
            }
        })
    })
}
/**
 *  获取友好距离单位
 * @param distance: Number     //距离（单位米）
 */
export function getFormatDistance(distance) {
    distance = Number(distance)
    if (distance < 1000) {
        return Math.floor(distance) + '米'
    } if (distance < 100000) {
        return Math.floor((distance / 1000) * 10) / 10 + '公里'
    }
    return Math.floor((distance / 1000000) * 10) / 10 + '千公里'
}
/**
 *  获取两个GPS点之间的距离(米)
 * @param lat1: Number     //点1的纬度
 * @param lng1: Number     //点1的经度
 * @param lat2: Number     //点2的纬度
 * @param lng2: Number     //点2的经度
 * @param hasFormat: Boolean     //是否转为友好距离单位
 */

export function getDistance(lat1, lng1, lat2, lng2, hasFormat = true) {
    const radLat1 = (lat1 * Math.PI) / 180.0
    const radLat2 = (lat2 * Math.PI) / 180.0
    const radLng1 = (lng1 * Math.PI) / 180.0
    const radLng2 = (lng2 * Math.PI) / 180.0
    const a = radLat1 - radLat2
    const b = radLng1 - radLng2
    let s = 2 *
        Math.asin(
            Math.sqrt(
                Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
            )
        )
    s *= 6378137
    // 输出为米
    s = Math.round(s * 10) / 10
    if (hasFormat) {
        return getFormatDistance(s)
    }
    return Number(s.toFixed(2))
}
// 获取字典属性
export function getDictProp(value, data, prop = 'label') {
    data = Array.isArray(data) ? data : (enums[data] || store.state.rootData.dict[data])
    if (data) {
        return (data.find(v => v.value === value) || {})[prop] || '- -'
    }
    return '- -'
}
/**
 * 检测是否包含权限
 * @param {String | Array} value 权限列表
 * @param {Boolean} isSome 是否检测全部权限，为false时，只要包含一项权限，就判定为通过
 */
export function checkFeature(value, isSome = true) {
    value = Array.isArray(value) ? value : [value]
    let feature = store.state.feature || []
    if (isSome) {
        return value.findIndex(item => feature.indexOf(item) === -1) === -1
    } else {
        return feature.some(item => value.includes(item))
    }
}
/**
 * 调起识别二维码接口
 */
export function scanCode(options) {
    return new Promise((resolve, reject) => {
        uni.showLoading({
            mask: true,
            title: '识别中'
        })
        uni.scanCode({
            scanType: 'qrCode',
            onlyFromCamera: true,
            ...options,
            success: ({ result }) => {
                resolve(result)
                uni.hideLoading()
            },
            fail: ({ errMsg }) => {
                uni.hideLoading()
                let isCancel = errMsg.indexOf('cancel') > -1
                if (isCancel) {
                    uni.showToast({
                        icon: 'none',
                        title: '已取消',
                        duration: 2000
                    })
                } else {
                    uni.showToast({
                        icon: 'none',
                        title: '识别失败',
                        duration: 2000
                    })
                }
                reject({
                    errMsg,
                    isCancel
                })
            }
        })
    })
}
