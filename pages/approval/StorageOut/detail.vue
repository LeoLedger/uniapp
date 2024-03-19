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
                        <view class="text">出库产品</view>
                    </view>
                    <view class="body-wrap">
                        <sy-table-config/>
                    </view>
                </view>
                <view v-show="showProductTest" class="module">
                    <view class="head-wrap slenderBorderBottom">
                        <view class="text">领料批次检测</view>
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
                    columns: []
                },
                testTableConfig: {
                    list: [],
                    columns: [
                        {
                            prop: 'code',
                            label: '批次',
                            width: 250
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
                            width: 220,
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
                            width: 180
                        }
                    ]
                },
                approvalType: 2,
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
                return this.processIndex > 3 && this.includeIntelligentProduct
            }
        },
        mounted() {
            this.$refs.BaseFormView.setConfig({
                formConfig: [
                    { prop: 'outType', label: '出库类型', type: 'dict', dictName: 'storageOutType' },
                    { prop: 'contractCode', label: '销售合同' },
                    { prop: 'contractName', label: '合同名称' },
                    { prop: 'contractType', label: '合同类型', type: 'dict', dictName: 'contractType' },
                    { prop: 'projectName', label: '项目' },
                    { prop: 'customerName', label: '企业' },
                    { prop: 'sectionName', label: '标段' },
                    { label: '合同有效期', type: 'dateRange', minKey: 'startDate', maxKey: 'endDate' },
                    { prop: 'signedDate', label: '签订日期' },
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
                        let formData = await approvalApi.storageOutDetail(this.dataId)
                        let products = []
                        formData.products.forEach(item => {
                            item.countEd = item.countEd || 0
                            item.countIng = item.countIng || 0
                            products.push(item);
                            (item.bomList || []).forEach(bom => {
                                bom.countEd = bom.countEd || 0
                                bom.countIng = bom.countIng || 0
                                products.push(bom)
                            })
                        })
                        this.updateData(formData)
                        this.includeIntelligentProduct = products.findIndex(v => v.productCategoryId === intelligentCategoryProductId) > -1
                        this.disabledStep = this.includeIntelligentProduct ? [3, 4] : [4]
                        this.$refs.BaseFormView.setConfig({ formData })
                        this.tableConfig.list = products
                        this.testTableConfig.list = formData.incomingInspectionList
                        uni.hideLoading()
                    } catch (err) {
                        console.error(err)
                    }
                }
            },
            // 更新表格配置
            updateTabelConfig() {
                let columns = []
                switch (this.formData.contractType) {
                case 2:
                    // 补购
                    columns = [
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            width: 230
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
                            label: '补购数量',
                            width: 200
                        },
                        {
                            prop: 'countEd',
                            label: '已出库',
                            width: 200,
                            visible: this.processIndex < 4
                        },
                        {
                            prop: 'countIng',
                            label: '出库中',
                            width: 100,
                            visible: this.processIndex < 4
                        },
                        {
                            prop: 'countApply',
                            label: '申请出库数量',
                            width: 210
                        },
                        {
                            prop: 'countConf',
                            label: '配置出库数量',
                            width: 210,
                            visible: this.processIndex >= 4
                        }
                    ]
                    break
                default:
                    columns = [
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            width: 230
                        },
                        {
                            type: 'dict',
                            dictName: '产品类型',
                            prop: 'productType',
                            label: '产品类型',
                            width: 260
                        },
                        {
                            type: 'dict',
                            dictName: 'salesType',
                            prop: 'salesType',
                            label: '销售模式',
                            width: 180
                        },
                        {
                            prop: 'count',
                            label: '销售/租用数量',
                            width: 240
                        },
                        {
                            prop: 'countEd',
                            label: '已出库',
                            width: 180,
                            visible: this.processIndex < 4
                        },
                        {
                            prop: 'countIng',
                            label: '出库中',
                            width: 180,
                            visible: this.processIndex < 4
                        },
                        {
                            prop: 'countApply',
                            label: '申请出库数量',
                            width: 210
                        },
                        {
                            prop: 'countConf',
                            label: '配置出库数量',
                            width: 210,
                            visible: this.processIndex >= 4
                        }
                    ]
                    break
                }
                this.tableConfig.columns = columns
            }
        }
    }
</script>

<style lang="scss" scoped>
</style>
