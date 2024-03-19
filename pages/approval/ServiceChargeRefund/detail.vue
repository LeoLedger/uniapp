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
                        <view class="text">退费清单</view>
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
                            type: 'dict',
                            dictName: '产品类型',
                            prop: 'productType',
                            label: '产品类型',
                            width: 260
                        },
                        {
                            prop: 'count',
                            label: '可退费设备数量',
                            width: 240
                        },
                        {
                            type: 'dict',
                            dictName: 'salesType',
                            label: '销售类型',
                            prop: 'sectionSalesType',
                            width: 180
                        },
                        {
                            type: 'date',
                            prop: 'serviceEndDate',
                            label: '服务截止日期',
                            width: 220
                        },
                        {
                            type: 'money',
                            prop: 'amount',
                            label: '可退服务费',
                            width: 190
                        },
                        {
                            type: 'date',
                            prop: 'serviceChangeEndDate',
                            label: '变更服务截止日期',
                            width: 270
                        },
                        {
                            type: 'money',
                            prop: 'applyAmount',
                            label: '申请退款金额',
                            width: 220
                        }
                    ]
                },
                approvalType: 6
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
                    { prop: 'applyDate', label: '提交时间' },
                    { prop: 'applyUserName', label: '提交人' },
                    { prop: 'sectionName', label: '标段' },
                    { prop: 'projectName', label: '项目' },
                    { prop: 'customerName', label: '企业' },
                    { prop: 'dailyServiceFee', label: '可退服务费', type: 'money' },
                    { prop: 'amountApply', label: '申请退款金额', type: 'money' },
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
                        let formData = await approvalApi.serviceChargeRefundDetail(this.dataId)
                        formData.dailyServiceFee = formData.prodList.reduce((a, b) => {
                            return a + (b.amount || 0)
                        }, 0)
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
