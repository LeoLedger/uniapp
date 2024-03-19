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
                        <view class="text">申请安装清单</view>
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
                            prop: 'contractCode',
                            label: '合同编号',
                            width: 240
                        },
                        {
                            prop: 'customerName',
                            label: '企业',
                            width: 240
                        },
                        {
                            label: '标段',
                            prop: 'sectionName',
                            width: 240
                        },
                        {
                            prop: 'canInstallNumber',
                            label: '剩余可安装数量',
                            width: 240
                        },
                        {
                            prop: 'applyInstallNumber',
                            label: '申请安装数量',
                            width: 240
                        }
                    ]
                },
                approvalType: 11
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
                    { prop: 'productCode', label: '产品编号' },
                    { prop: 'productName', label: '产品名称' },
                    { prop: 'supplierName', label: '供应商' },
                    { prop: 'count', label: '申请安装数量' },
                    { prop: 'startDate', label: '计划开始时间', type: 'date' },
                    { prop: 'endDate', label: '计划完成时间', type: 'date' },
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
                        let formData = await approvalApi.deviceInstallDetail(this.dataId)
                        this.updateData(formData)
                        this.$refs.BaseFormView.setConfig({ formData })
                        this.tableConfig.list = formData.details
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
