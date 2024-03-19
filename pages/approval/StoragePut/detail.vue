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
                        <view class="text">入库产品</view>
                    </view>
                    <view class="body-wrap">
                        <sy-table-config/>
                    </view>
                </view>
                <view v-show="showProductTest" class="module">
                    <view class="head-wrap slenderBorderBottom">
                        <view class="text">来料批次检测</view>
                    </view>
                    <view class="body-wrap">
                        <sy-table-config provide-key="testTableConfig"/>
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

    const intelligentCategoryProductId = 'B16C3151-11D2-4364-8F45-63EFFFFCF424'

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
                            width: 240
                        },
                        {
                            type: 'dict',
                            dictName: '产品类型',
                            prop: 'productType',
                            label: '产品类型',
                            width: 300
                        },
                        {
                            prop: 'count',
                            label: '采购数量',
                            width: 160
                        },
                        {
                            prop: 'countInbound',
                            label: '已入库',
                            width: 160
                        },
                        {
                            prop: 'countBounding',
                            label: '入库中',
                            width: 160
                        },
                        {
                            prop: 'countApply',
                            label: '申请入库数量',
                            width: 210
                        }
                    ]
                },
                testTableConfig: {
                    list: [],
                    columns: [
                        {
                            prop: 'code',
                            label: '批次',
                            width: 260
                        },
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            width: 220
                        },
                        {
                            type: 'dict',
                            dictName: '产品类型',
                            prop: 'productType',
                            width: 260,
                            label: '产品类型'
                        },
                        {
                            prop: 'count',
                            label: '抽检数量',
                            width: 190
                        },
                        {
                            prop: 'countInvalid',
                            label: '不良品数',
                            width: 190
                        },
                        {
                            type: 'date',
                            prop: 'createTime',
                            label: '抽检日期',
                            width: 190
                        },
                        {
                            prop: 'checkResult',
                            type: 'status',
                            dictName: 'spotCheckResult',
                            label: '抽检结果',
                            width: 160
                        }
                    ]
                },
                approvalType: 1,
                disabledStep: [2],
                includeIntelligentProduct: false
            }
        },
        provide() {
            return {
                provideComponent: this
            }
        },
        computed: {
            showProductTest() {
                return this.processIndex > 2 && this.includeIntelligentProduct
            }
        },
        mounted() {
            this.$refs.BaseFormView.setConfig({
                formConfig: [
                    { prop: 'contractCode', label: '采购合同' },
                    { prop: 'contractName', label: '合同名称' },
                    { prop: 'supplierName', label: '供应商' },
                    { label: '合同有效期', type: 'dateRange', minKey: 'beginDate', maxKey: 'endDate' },
                    { prop: 'signedDate', label: '签订日期', type: 'date' },
                    { prop: 'deliveryTime', label: '预计到货时间', type: 'date' },
                    { prop: 'warehousesName', label: '入库仓库' },
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
                        let formData = await approvalApi.storagePutDetail(this.dataId)
                        let deviceInProdList = formData.deviceInProdList.map(item => {
                            item.countInbound = item.countInbound || 0
                            item.countBounding = item.countBounding || 0
                            return item
                        })
                        this.updateData(formData)
                        this.includeIntelligentProduct = deviceInProdList.findIndex(v => v.productCategory === intelligentCategoryProductId) > -1
                        this.disabledStep = this.includeIntelligentProduct ? [2] : []
                        this.$refs.BaseFormView.setConfig({ formData })
                        this.tableConfig.list = deviceInProdList
                        this.testTableConfig.list = formData.incomingInspectionList
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
