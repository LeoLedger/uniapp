<template>
    <view class="public-approval-detail">
        <view v-show="!loading">
            <detail-frame
                :can-approval="canApproval"
                :extend-params="extendParams"
                :disabled-step="disabledStep"
                @process-update="handleProcessUpdate"
            >
                <view class="module">
                    <view class="head-wrap slenderBorderBottom">
                        <view class="text">基础信息</view>
                    </view>
                    <view class="body-wrap">
                        <form-view
                            ref="BaseFormView"
                        />
                    </view>
                </view>
                <view class="module">
                    <view class="head-wrap slenderBorderBottom">
                        <view class="text">续期明细</view>
                    </view>
                    <view class="body-wrap">
                        <sy-table-config/>
                    </view>
                </view>
            </detail-frame>
        </view>
        <sy-load-more :type="loading ? 'loading' : 'hide'"/>
    </view>
</template>

<script>
    // API
    import approvalApi from '@/api/approval'
    // 方法
    import mixin from '../mixin/detail'
    // 组件
    import FormView from '../components/form-view'
    import DetailFrame from '../components/detail-frame'

    export default {
        components: {
            FormView,
            DetailFrame
        },
        mixins: [mixin],
        data() {
            return {
                tableConfig: {
                    list: [],
                    columns: [
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            width: 200
                        },
                        {
                            prop: 'productType',
                            label: '产品类型',
                            width: 260,
                            type: 'dict',
                            dictName: '产品类型'
                        },
                        {
                            prop: 'count',
                            label: '续期数量',
                            width: 200
                        },
                        {
                            prop: 'renewalYear',
                            label: '续期时长(年)',
                            width: 230
                        },
                        {
                            prop: 'unitPrice',
                            label: '单价(元)',
                            width: 200
                        },
                        {
                            type: 'money',
                            prop: 'totalAmount',
                            label: '总价(元)',
                            width: 220
                        }
                    ]
                },
                approvalType: 8
            }
        },
        provide() {
            return {
                provideComponent: this
            }
        },
        mounted() {
            this.$refs.BaseFormView.setConfig({
                formConfig: [
                    { prop: 'code', label: '单据编号' },
                    { prop: 'applyDate', label: '提交时间', type: 'date' },
                    { prop: 'applyUserName', label: '提交人' },
                    { prop: 'purchaseSupplierName', label: '供应商' },
                    { prop: 'count', label: '续期SIM卡数量' },
                    { prop: 'amount', label: '续期费用', type: 'money' },
                    { prop: 'remark', label: '备注' },
                    { prop: 'files', label: '附件', type: 'file' }
                ]
            })
        },
        methods: {
            // 获取基础信息
            async queryBaseInfo() {
                if (this.dataId) {
                    this.showLoading()
                    try {
                        let formData = await approvalApi.renewSIMDetail(this.dataId)
                        await Promise.all(formData.products.map(item => this.queryDeviceList(item)))
                        this.jsonData = formData.products
                        this.updateData(formData)
                        this.$refs.BaseFormView.setConfig({ formData })
                        this.tableConfig.list = formData.products
                        uni.hideLoading()
                    } catch (err) {
                        console.error(err)
                    }
                }
            },
            // 获取清单下的设备
            async queryDeviceList(data) {
                if (data.count) {
                    let res = await approvalApi.getRenewSIMList({ simRenewProdGuid: data.guidId, pageSize: -1 })
                    data.devices = res.records
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
</style>
