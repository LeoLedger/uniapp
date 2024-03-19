import { envConfig, ENV } from '../config'
export const env = ENV
export const baseURL = envConfig.BASE_API
export const webviewURL = envConfig.WEBVIEW_URL
export const WS_API = envConfig.WS_API
export const WS_ORIGIN = envConfig.WS_ORIGIN
export const clientId = 'app-h5'
export const clientSecret = 'C99AFA9B-F863-4B36-B0E5-EBAD6FA2CFE8'
export const version = '1.0.0' // 一个版本标记用于在手机中确认版本； 主版本.次版本.build号（每构建一次+1）
export default {
    baseURL,
    webviewURL,
    WS_API,
    clientId,
    clientSecret
}
