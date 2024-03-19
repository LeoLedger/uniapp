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
                        <view class="text">押金退还明细</view>
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
                            prop: 'countApply',
                            label: '清点退库数量',
                            width: 220
                        },
                        {
                            type: 'money',
                            prop: 'amountCashPledge',
                            label: '设备合同押金(元)',
                            width: 260
                        },
                        {
                            type: 'money',
                            prop: 'amountActual',
                            label: '实收押金(元)',
                            width: 210
                        },
                        {
                            type: 'money',
                            prop: 'amountDeduct',
                            label: '扣除押金(元)',
                            width: 210
                        },
                        {
                            type: 'money',
                            prop: 'amount',
                            label: '申请退还(元)',
                            width: 210
                        }
                    ]
                },
                approvalType: 5
            }
        },
        provide() {
            return {
                provideComponent: this
            }
        },
        watch: {
            processIndex() {
                this.updateTabelConfig()
            }
        },
        mounted() {
            this.$refs.BaseFormView.setConfig({
                formConfig: [
                    { prop: 'code', label: '单据编号' },
                    { prop: 'applyDate', label: '提交时间', type: 'date' },
                    { prop: 'applyUserName', label: '提交人' },
                    { prop: 'sectionName', label: '标段' },
                    { prop: 'projectName', label: '项目' },
                    { prop: 'customerName', label: '企业' },
                    { prop: 'applyAmount', label: '申请退还金额', type: 'money' },
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
                        let formData = await approvalApi.returnCashDetail(this.dataId)
                        this.jsonData = formData.prodList
                        this.updateData(formData)
                        this.$refs.BaseFormView.setConfig({ formData })
                        this.tableConfig.list = formData.prodList
                        uni.hideLoading()
                    } catch (err) {
                        console.error(err)
                    }
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
</style>
