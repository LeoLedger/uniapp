/**
 * 系统稳定数据
 */

// API
import resourctApi from '@/api/resource'
// 工具
import enums from '@/utils/enum'

const dict = {
    state: {
        // 字典
        dict: {},
        // 行政区域
        region: []
    },
    getters: {
    },
    actions: {
        initRootData({ dispatch }) {
            // 异步请求
            // 同步请求
            return Promise.all([
                dispatch('queryDict')
            ])
        },
        // 获取字典数据
        async queryDict({ state }) {
            let dict = {}
            let data = await resourctApi.getAllDict()
            data.forEach(item => {
                dict[item.nsName] = item.dictList.map(option => {
                    return {
                        value: option.dictId,
                        label: option.dictName
                    }
                })
            })
            Object.keys(enums).forEach(key => {
                dict[key] = enums[key]
            })
            state.dict = dict
        }
    }
}

export default dict
