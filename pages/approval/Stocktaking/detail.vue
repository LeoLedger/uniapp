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
                        <view class="text">产品盘点清单</view>
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
                    ]
                },
                approvalType: 13,
                disabledStep: [2]
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
                    { prop: 'productCategoryId', label: '产品种类', type: 'dict', dictName: 'productCategory' },
                    { prop: '_warehousesName', label: '仓库' },
                    { prop: 'planDate', label: '计划盘点时间', type: 'date' },
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
                        let formData = await approvalApi.stocktakingDetail(this.dataId)
                        let products = formData.products.filter(item => {
                            return item.bookCount > 0
                        }).map(item => {
                            item.count = item.count || 0
                            item.value = item.value || 0
                            item.inventoryProfitCount = item.inventoryProfitCount || 0
                            item.inventoryProfitValue = item.inventoryProfitValue || 0
                            item.inventoryLossCount = item.inventoryLossCount || 0
                            item.inventoryLossValue = item.inventoryLossValue || 0
                            return item
                        })
                        if (formData.warehousesName && formData.shippingSpaceName) {
                            formData._warehousesName = `${formData.warehousesName}/${formData.shippingSpaceName}`
                        }
                        this.updateData(formData)
                        this.$refs.BaseFormView.setConfig({ formData })
                        this.tableConfig.list = products
                        uni.hideLoading()
                    } catch (err) {
                        console.error(err)
                    }
                }
            },
            // 更新表格配置
            updateTabelConfig() {
                let columns = [
                    {
                        prop: 'productCode',
                        label: '产品编号',
                        width: 260
                    },
                    {
                        prop: 'productName',
                        label: '产品名称',
                        width: 260
                    },
                    {
                        type: 'dict',
                        dictName: '产品类型',
                        label: '产品类型',
                        prop: 'productType',
                        width: 260
                    },
                    {
                        prop: 'bookCount',
                        label: '库存账面数量',
                        width: 220
                    },
                    {
                        type: 'money',
                        prop: 'bookValue',
                        label: '账面价值',
                        width: 200
                    }
                ]
                if (this.processIndex >= 2) {
                    columns = columns.concat([
                        {
                            prop: 'count',
                            label: '在库数量',
                            width: 200
                        },
                        {
                            type: 'money',
                            prop: 'value',
                            label: '在库价值',
                            width: 200
                        },
                        {
                            prop: 'inventoryProfitCount',
                            label: '盘盈数量',
                            width: 200
                        },
                        {
                            type: 'money',
                            prop: 'inventoryProfitValue',
                            label: '盘盈价值',
                            width: 200
                        },
                        {
                            prop: 'inventoryLossCount',
                            label: '盘亏数量',
                            width: 200
                        },
                        {
                            type: 'money',
                            prop: 'inventoryLossValue',
                            label: '盘亏价值',
                            width: 200
                        }
                    ])
                }
                this.tableConfig.columns = columns
            }
        }
    }
</script>

<style lang="scss" scoped>
</style>
