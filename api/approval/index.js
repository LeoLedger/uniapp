import fly from '@/utils/fly'

export default {
    // 获取可审批数量
    getCount: function(type) {
        return fly.request({
            url: '/approval/workflow-num/' + type,
            method: 'get'
        })
    },
    // 获取审批列表
    getList: function(params) {
        return fly.request({
            url: '/approval/flowList/',
            method: 'get',
            params
        })
    },
    demandDetail: function(id) {
        return fly.request({
            url: '/approvalPurchase/' + id,
            method: 'get'
        })
    },
    storagePutDetail: function(id) {
        return fly.request({
            url: '/approval-device-in/' + id,
            method: 'get'
        })
    },
    storageOutDetail: function(guidId) {
        return fly.request({
            url: '/approval-device-out/detail',
            method: 'get',
            params: {
                guidId
            }
        })
    },
    storageBackDetail: function(id) {
        return fly.request({
            url: '/approvalDeviceReturn/' + id,
            method: 'get'
        })
    },
    // 获取退库单下的设备
    getProdDeviceList: function(id) {
        return fly.request({
            url: '/approvalDeviceReturn/return-device/' + id,
            method: 'get'
        })
    },
    invoiceDetail: function(id) {
        return fly.request({
            url: '/approvalInvoice/' + id,
            method: 'get'
        })
    },
    returnCashDetail: function(id) {
        return fly.request({
            url: '/approvalCashPledge/' + id,
            method: 'get'
        })
    },
    serviceChargeRefundDetail: function(id) {
        return fly.request({
            url: '/approvalServiceCharge/' + id,
            method: 'get'
        })
    },
    deviceExtendEarrantyDetail: function(id) {
        return fly.request({
            url: '/approval-extend/' + id,
            method: 'get'
        })
    },
    renewSIMDetail: function(id) {
        return fly.request({
            url: '/approval-sim-renew/' + id,
            method: 'get'
        })
    },
    getRenewSIMList: function(params) {
        return fly.request({
            url: '/approval-sim-renew/device',
            method: 'get',
            params
        })
    },
    deviceAllocateDetail: function(id) {
        return fly.request({
            url: '/approvalDeviceTransfer/' + id,
            method: 'get'
        })
    },
    deviceDamagedDetail: function(id) {
        return fly.request({
            url: '/approval-device-damaged/' + id,
            method: 'get'
        })
    },
    deviceInstallDetail: function(id) {
        return fly.request({
            url: '/approval-device-install/' + id,
            method: 'get'
        })
    },
    salesContractDetail: function(id) {
        return fly.request({
            url: '/sales-contract/' + id,
            method: 'get'
        })
    },
    stocktakingDetail: function(id) {
        return fly.request({
            url: '/approval-inventoryt-device/' + id,
            method: 'get'
        })
    }
}
