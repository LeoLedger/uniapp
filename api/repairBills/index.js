import fly from '@/utils/fly'

export default {
    // 列表
    getList: function(params) {
        return fly.request({
            url: '/express-fault',
            method: 'get',
            params
        })
    },
    // 获取人员寄修单详情
    getSendRepairDetail: function(id) {
        return fly.request({
            url: '/express/' + id,
            method: 'get'
        })
    },
    // 获取车辆维修单详情
    getCarRepairDetail: function(id) {
        return fly.request({
            url: '/fault-repair-car/' + id,
            method: 'get'
        })
    },
    // 更新人员寄修单
    updateSendRepair: function(body) {
        return fly.request({
            url: '/express/wx',
            method: 'post',
            body
        })
    },
    // 更新车辆维修单
    updateRepair: function(body) {
        return fly.request({
            url: '/fault-repair-car/wx',
            method: 'post',
            body
        })
    },
    // 分派维修人员
    allocate(params) {
        return fly.request({
            url: '/express-fault/assign',
            method: 'put',
            params
        })
    },
    // 获取人员设备附件
    getPeopleDeviceFiles: function(params) {
        return fly.request({
            url: '/express/files',
            method: 'get',
            params
        })
    },
    // 获取车辆设备附件
    getVehicleDeviceFiles: function(params) {
        return fly.request({
            url: '/fault-repair-car/files',
            method: 'get',
            params
        })
    }
}
