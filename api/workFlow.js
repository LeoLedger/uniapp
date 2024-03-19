import fly from '@/utils/fly'

export default {
    // 获取流程
    getFlow: function(params) {
        return fly.request({
            url: '/workFlow/getFlow',
            method: 'get',
            params
        })
    },
    // 获取下一环节
    getNextActivities: function(params) {
        return fly.request({
            url: '/workFlow/getNextActivities',
            method: 'get',
            params
        })
    },
    // 发送案件
    send: function(body) {
        return fly.request({
            url: '/workFlow/send',
            method: 'post',
            body
        })
    },
    // 回退案件
    back: function(body) {
        return fly.request({
            url: '/workFlow/back',
            method: 'post',
            body
        })
    },
    // 撤回案件
    withdraw: function(body) {
        return fly.request({
            url: '/workFlow/withdraw',
            method: 'post',
            body
        })
    }
}
