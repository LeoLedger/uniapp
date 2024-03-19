
export const systemInfo = uni.getSystemInfoSync()
// 当前设备系统是否为苹果
export const isIos = systemInfo.platform === 'ios' && !!systemInfo.version
// 当前设备系统是否为安卓
export const isAndroid = systemInfo.platform === 'android' && !!systemInfo.version
// 当前设备系统是否为开发者工具
export const isDevtools = systemInfo.platform === 'devtools'

// 判断是否为空
export function isEmpty(value) {
    return ['', null, void 0].includes(value)
}
// 是否Promise对象
export function isPromise(value) {
    return typeof value === 'object' && typeof value.then === 'function'
}
// 数字补零
export function numberPad(n) {
    return String(n).padStart(2, '0')
}
// 格式化金额
export function moneyFormat(num, digit = 2) {
    let split = Number(num).toLocaleString('zh', {
        minimumFractionDigits: digit,
        maximumFractionDigits: digit
    }).split('.')
    if (split[1]) {
        split[1] = split[1].replace(/0+$/, '')
    }
    if (split[1] > 0) {
        return split.join('.')
    } else {
        return split[0]
    }
}
// 对象转css
export function objectToCss(obj) {
    if (!isEmpty(obj) && typeof obj === 'object') {
        return Object.keys(obj).filter(key => !isEmpty(obj[key])).map(key => {
            return `${key.replace(/([A-Z])/, '-$1').toLocaleLowerCase()}:${obj[key]}`
        }).join(';')
    }
    return ''
}
// 获取指定选择器的原生矩形数据
export function getElementRect(selector, context) {
    return new Promise((resolve, reject) => {
        uni.createSelectorQuery()
            .in(context)
            .select(selector)
            .boundingClientRect()
            .exec(res => {
                if (res.length) {
                    resolve(res)
                } else {
                    reject()
                }
            })
    })
}
// 尽可能小改变指定的数值，让其与原来的值不相同
export function getDirtyNumber(value) {
    let minus = value < 0
    value = String(Number(Math.abs(value))).split('.')
    if (value.length === 1) {
        // 整数
        let pad = 16 - value[0].length
        if (pad > 0) {
            value[1] = ''.padEnd(pad - 1, '0') + '1'
        } else {
            value[0] = Number(value[0].substring(0, 16)) + 1
        }
    } else {
        let pad1 = 16 - value[0].length
        let pad2 = pad1 - value[1].length
        if (pad2 > 0) {
            value[1] += ''.padEnd(pad2 - 1, '0') + '1'
        } else {
            value[1] = Number(value[1].substring(0, pad1)) + 1
        }
    }
    return Number(value.join('.')) * (minus ? -1 : 1)
}
/**
 * 获取对象的指定属性值
 * @param {Object} obj 需要操作的对象
 * @param {String} key 需要获取的属性名，可以使用链式写法
 * @param {Boolean} consoleError 是否打印错误信息
 */
export function getProperty(obj, key = '', consoleError) {
    try {
        return key.split('.').reduce((data, key) => data[key], obj)
    } catch (err) {
        if (consoleError) console.error(err)
    }
}
/**
 * 数组转对象
 * @param {Array[Object]} arr 需要转数组
 * @param {String} nameKey 用于设置对象prop名称的key名称
 * @param {String} valueKey 用于设置对象值的key名称
 */
export function arrayToObject(arr, nameKey = 'name', valueKey = 'value') {
    let obj = {}
    arr.forEach(item => {
        obj[item[nameKey]] = item[valueKey]
    })
    return obj
}
/**
 * 数据类型判断
 */
export function isType(obj, name) {
    return Object.prototype.toString.call(obj).toLowerCase() === '[object ' + name.toLowerCase() + ']'
}
/**
 * 深度合并对象
 */
export function deepMerge(obj1, obj2) {
    if (isType(obj1, 'object') && isType(obj2, 'object')) {
        Object.keys(obj2).forEach(key => {
            if (isType(obj1[key], 'object')) {
                obj1[key] = deepMerge(obj1[key], obj2[key])
            } else {
                obj1[key] = obj2[key]
            }
        })
        return obj1
    }
    return Object.assign(obj1, obj2)
}
