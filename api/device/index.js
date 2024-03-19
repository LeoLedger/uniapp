import fly from '@/utils/fly'

export default {
    // 列表
    getList: function(body) {
        return fly.request({
            url: '/approval-device-out/stock',
            method: 'post',
            body
        })
    },
    // 获取sim卡列表
    getSimList: function(params) {
        return fly.request({
            url: '/device-sim',
            method: 'get',
            params
        })
    },
    // 获取所有sim卡列表
    getAllSimList: function(params) {
        return fly.request({
            url: '/device-sim/list-all',
            method: 'get',
            params
        })
    },
    // 为设备替换SIM卡
    updateSim: function(params) {
        return fly.request({
            url: '/device-install-details/update-sim',
            method: 'put',
            params
        })
    }
}
