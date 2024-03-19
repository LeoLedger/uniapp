import fly from '@/utils/fly'

export default {
    // 单据列表
    billsList: function(params) {
        return fly.request({
            url: '/device-install',
            method: 'get',
            params
        })
    },
    // 单据列表
    billsDetail: function(id) {
        return fly.request({
            url: '/device-install/' + id,
            method: 'get'
        })
    },
    // 列表
    list: function(params) {
        return fly.request({
            url: '/device-install-details',
            method: 'get',
            params
        })
    },
    // 更新
    update: function(body) {
        return fly.request({
            url: '/device-install-details',
            method: 'post',
            body
        })
    },
    // 详情
    detail: function(id) {
        return fly.request({
            url: '/device-install-details/' + id,
            method: 'get'
        })
    },
    // 获取标段联系人
    getSectionMember: function(id) {
        return fly.request({
            url: `/section/section/${id}/member`,
            method: 'get'
        })
    },
    // 根据设备信息查找设备
    findDevice(params) {
        return fly.request({
            url: '/device-install/device/wx/',
            method: 'get',
            params
        })
    },
    // 更新安装设备信息
    updateDevice(body) {
        return fly.request({
            url: '/device-install-details/device',
            method: 'put',
            body
        })
    }
}
