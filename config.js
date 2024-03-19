export const ENV = process.env.NODE_ENV
console.log.apply(void 0, [`%c environment %c ${ENV} `, 'padding: 1px; border-radius: 10px 0 0 10px; color: #fff; background: #606060;', 'padding: 1px; border-radius: 0 10px 10px 0; color: #fff; background: #1475b2;'])
const Config = {
    development: {
        // 本地环境
        // BASE_API: 'http://192.168.3.50:8081/', // 许志文
        // BASE_API: 'http://192.168.3.2:8081/', // 方鹏龙
        // BASE_API: 'http://192.168.3.33:8081/' // 郑泽坤
        // BASE_API: 'http://192.168.3.48:8081/' // 康泽灿
        // BASE_API: 'http://192.168.3.17:8081/', // 赵坤
        // BASE_API: 'http://192.168.0.101:8081/' // 远程
        BASE_API: 'https://hw-iot.topevery.com/api/' // 正式
    },
    production: { // 生产
        // BASE_API: 'http://192.168.0.101:8081/' // 远程
        BASE_API: 'https://hw-iot.topevery.com/api/' // 正式
    }
}
export const envConfig = Config[ENV]
