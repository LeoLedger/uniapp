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
                        <view class="text">调拨设备</view>
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
                            width: 255
                        },
                        {
                            type: 'dict',
                            dictName: '产品类型',
                            prop: 'productType',
                            label: '产品类型',
                            width: 260
                        },
                        {
                            prop: 'inventoryCount',
                            label: '库存数量',
                            width: 200
                        },
                        {
                            prop: 'count',
                            label: '申请调拨数量',
                            width: 220
                        },
                        {
                            prop: 'transferCount',
                            label: '实际调拨数量',
                            width: 230,
                            visible: false
                        }
                    ]
                },
                approvalType: 9,
                disabledStep: [3],
                includeIntelligentProduct: false
            }
        },
        provide() {
            return {
                provideComponent: this
            }
        },
        methods: {
            // 获取基础信息
            async queryBaseInfo() {
                if (this.dataId) {
                    this.showLoading()
                    try {
                        let formData = await approvalApi.deviceAllocateDetail(this.dataId)
                        if (formData.warehousesInName && formData.shippingSpaceInName) {
                            formData._warehousesInName = `${formData.warehousesInName}/${formData.shippingSpaceInName}`
                        }
                        if (formData.warehousesOutName && formData.shippingSpaceOutName) {
                            formData._warehousesOutName = `${formData.warehousesOutName}/${formData.shippingSpaceOutName}`
                        }
                        let products = formData.products.map(item => {
                            item.transferCount = item.transferCount || 0
                            return item
                        })
                        this.jsonData = formData
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
                this.$refs.BaseFormView.setConfig({
                    formConfig: [
                        { prop: 'code', label: '单据编号' },
                        { prop: 'applyDate', label: '提交时间', type: 'date' },
                        { prop: 'applyUserName', label: '提交人' },
                        { prop: '_warehousesOutName', label: '调出仓库', type: 'multi', separator: '/' },
                        { prop: '_warehousesInName', label: '调入仓库', type: 'multi', separator: '/' },
                        {
                            prop: 'sectionName',
                            label: '调入标段',
                            visible: [
                                'cf946c33-9f2c-11eb-bbfa-000c29bb1337',
                                '3ad17249-a0dd-11eb-8666-000c29bb1337'
                            ].includes(this.formData.warehousesOutTypeId)
                        },
                        { prop: 'count', label: '调拨数量' },
                        { prop: 'remark', label: '备注' },
                        { prop: 'files', label: '附件', type: 'file' }
                    ]
                })
                this.tableConfig.columns.find(v => v.prop === 'transferCount').visible = this.processIndex > 3
            }
        }
    }
</script>

<style lang="scss" scoped>
</style>
