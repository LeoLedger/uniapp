/**
 * 系统共用、稳定的数据。
 */
// 全局事件枚举
export const globalEventName = {
    '用户登录': 'user.login',
    '退出登录': 'user.logout',
    '选择设备': 'select.device',
    '选择人员': 'select.people',
    '审批列表更新': 'approval.list.update',
    '维修单列表更新': 'repair.bills.list.update',
    '维修单设备更新': 'repair.bills.device.update',
    '设备安装-单据列表更新': 'device.install.bills.list.update',
    '设备安装-设备列表更新': 'device.install.device.list.update',
    '设备安装-设备信息更新': 'device.install.device.info.update',
    '车辆维修-选择更换设备': 'vehicle.repair.select.replace.device'
}
export default {
    // 销售模式
    salesType: [
        { label: '销售', value: 0 },
        { label: '租赁', value: 1 },
        { label: '其他', value: 2 }
    ],
    // 合同类型
    contractType: [
        { label: '销售+服务', value: 0, type: 1 },
        { label: '租赁+服务', value: 1, type: 1 },
        { label: '补购', value: 2, type: 2 },
        { label: '续费', value: 3, type: 3 },
        { label: '其他', value: 9, type: 1 }
    ],
    // 出库类型
    storageOutType: [
        { label: '全新出库', value: 0 },
        { label: '旧设备出库', value: 1 },
        { label: '保修更换出库', value: 2 },
        { label: '保修更换出库', value: 3 }
    ],
    // 发票类型
    invoiceType: [
        { label: '增值税普通发票（纸）', value: 0 },
        { label: '增值税普通发票（电子）', value: 3 },
        { label: '增值税专用发票（电子）', value: 4 },
        { label: '增值税专用发票（纸）', value: 1 },
        { label: '押金条', value: 2 }
    ],
    // 发票类型
    isMergeInvoice: [
        { label: '是', value: 0 },
        { label: '否', value: 1 }
    ],
    // 收款-费用类型
    costType: [
        { label: '押金', value: 0, dialogType: 'salesContract' },
        { label: '服务费', value: 1, dialogType: 'salesContract' },
        { label: '产品销售费', value: 2, dialogType: 'salesContract' },
        { label: '安装费', value: 3, dialogType: 'salesContract' },
        { label: '扣除押金', value: 4, dialogType: 'returnCashApproval' },
        { label: '设备维修费', value: 5, dialogType: 'maintenanceBill' },
        { label: '迁装费', value: 6, dialogType: 'salesContract' }
    ],
    // 单据类型
    billsType: [
        { label: '寄修单', value: 'express' },
        { label: '维修单', value: 'fault' }
    ],
    // 单据状态
    billsStatus: [
        { label: '维修中', value: 'ing' },
        { label: '已完成', value: 'ed' }
    ],
    // 维修状态
    repairStatus: [
        { label: '待维修', value: 0 },
        { label: '已维修', value: 1 }
    ],
    // 是否有换卡
    isReplaceSim: [
        { label: '否', value: 0 },
        { label: '是', value: 1 }
    ],
    // 是否二次返修
    isSecondRepair: [
        { label: '否', value: 0 },
        { label: '是', value: 1 }
    ],
    // 车辆维修单处理方式
    vehicleHandlingWay: [
        { label: '继续运营', value: 0 },
        { label: '收回备用库', value: 1 },
        { label: '报废', value: 2 }
    ],
    // 替换类型
    replaceType: [
        { label: '全新设备', value: 1 },
        { label: '旧设备', value: 2 },
        { label: '备用设备', value: 3 }
    ],
    // 审批类型
    approvalType: [
        { type: 0, label: '需求申请单', name: 'Demand', key: 'ty.iot.approval.demand', handleKey: 'ty.iot.approval.handle.demand' },
        { type: 1, label: '入库申请单', name: 'StoragePut', key: 'ty.iot.approval.storagePut', handleKey: 'ty.iot.approval.handle.storagePut' },
        { type: 2, label: '出库申请单', name: 'StorageOut', key: 'ty.iot.approval.storageOut', handleKey: 'ty.iot.approval.handle.storageOut' },
        { type: 3, label: '退库申请单', name: 'StorageBack', key: 'ty.iot.approval.storageBack', handleKey: 'ty.iot.approval.handle.storageBack' },
        { type: 4, label: '开票申请单', name: 'Invoice', key: 'ty.iot.approval.invoice', handleKey: 'ty.iot.approval.handle.invoice' },
        { type: 5, label: '退还押金申请单', name: 'ReturnCash', key: 'ty.iot.approval.returnCash', handleKey: 'ty.iot.approval.handle.returnCash' },
        { type: 6, label: '服务费退款申请单', name: 'ServiceChargeRefund', key: 'ty.iot.approval.serviceChargeRefund', handleKey: 'ty.iot.approval.handle.serviceChargeRefund' },
        { type: 7, label: '设备延保申请单', name: 'DeviceExtendEarranty', key: 'ty.iot.approval.deviceExtendEarranty', handleKey: 'ty.iot.approval.handle.deviceExtendEarranty' },
        { type: 8, label: 'SIM卡续费申请单', name: 'RenewSIM', key: 'ty.iot.approval.renewSIM', handleKey: 'ty.iot.approval.handle.renewSIM' },
        { type: 9, label: '设备调拨申请单', name: 'DeviceAllocate', key: 'ty.iot.approval.deviceAllocate', handleKey: 'ty.iot.approval.handle.deviceAllocate' },
        { type: 10, label: '设备报损申请单', name: 'DeviceDamaged', key: 'ty.iot.approval.deviceDamaged', handleKey: 'ty.iot.approval.handle.deviceDamaged' },
        { type: 11, label: '设备安装申请单', name: 'DeviceInstall', key: 'ty.iot.approval.deviceInstall', handleKey: 'ty.iot.approval.handle.deviceInstall' },
        { type: 12, label: '销售合同', name: 'SalesContract', key: 'ty.iot.approval.salesContract', handleKey: 'ty.iot.approval.handle.salesContract' },
        { type: 13, label: '库存盘点申请单', name: 'Stocktaking', key: 'ty.iot.approval.stocktaking', handleKey: 'ty.iot.approval.handle.stocktaking' }
    ],
    // 审批类型
    approvalStatus: [
        { label: '未办理', value: 0, color: '#999' },
        { label: '通过', value: 1, color: '#76c84f' },
        { label: '驳回', value: 2, color: '#f59a23' },
        { label: '已撤回', value: 3, color: '#999' },
        { label: '已取消', value: 4, color: '#999' },
        { label: '已停止', value: 5, color: '#fc455c' },
        { label: '重新开始', value: 6, color: '#999' }
    ],
    // 单据状态
    documentStatus: [
        { label: '审批中', value: 0, color: '#0001AE' },
        { label: '已撤回', value: 1, color: '#FFA024' },
        { label: '已驳回', value: 2, color: '#EE6A5C' },
        { label: '已通过', value: 3, color: '#0001AE' },
        { label: '已核销', value: 4, color: '#0001AE' }
    ],
    // 审批对象类型
    receiveType: [
        { label: '用户', value: 100601 },
        { label: '角色', value: 100602 },
        { label: '部门', value: 100603 },
        { label: '其它', value: 100604 }
    ],
    // 抽检结果
    spotCheckResult: [
        { label: '通过', value: 0, color: '#6fc544' },
        { label: '不通过', value: 1, color: '#f85c5c' }
    ]
}
