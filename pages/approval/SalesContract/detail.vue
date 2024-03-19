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
                    columns: []
                },
                approvalType: 12
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
                    { prop: 'code', label: '合同编号' },
                    { prop: 'name', label: '合同名称' },
                    { prop: 'type', label: '合同类型', type: 'dict', dictName: 'contractType' },
                    { prop: 'customerName', label: '客户' },
                    { prop: 'sectionName', label: '标段' },
                    { label: '合同期限', type: 'dateRange', minKey: 'startDate', maxKey: 'endDate' },
                    { prop: 'amount', label: '合同总金额', type: 'money' },
                    { prop: 'signedDate', label: '签订日期', type: 'date' },
                    { prop: 'remark', label: '备注' },
                    { prop: 'fileList', label: '附件', type: 'file' }
                ]
            })
        },
        methods: {
            // 获取基础信息
            async queryBaseInfo() {
                if (this.dataId) {
                    this.showLoading()
                    try {
                        let formData = await approvalApi.salesContractDetail(this.dataId)
                        let productList = [];
                        (formData.productList || []).forEach(item => {
                            item.countEd = item.countEd || 0
                            item.countIng = item.countIng || 0
                            productList.push(item);
                            (item.bomList || []).forEach(bom => {
                                bom.countEd = bom.countEd || 0
                                bom.countIng = bom.countIng || 0
                                productList.push(bom)
                            })
                        })
                        formData.approvalId = formData.approvalContractId
                        this.updateData(formData)
                        this.$refs.BaseFormView.setConfig({ formData })
                        this.tableConfig.list = productList
                        uni.hideLoading()
                    } catch (err) {
                        console.error(err)
                    }
                }
            },
            // 更新表格配置
            updateTabelConfig() {
                let columns = []
                let { type, approvalStatus } = this.formData
                switch (type) {
                case 2:
                    // 补购
                    columns = [
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            width: 230
                        },
                        {
                            prop: 'productName',
                            label: '可补购产品名称',
                            width: 260
                        },
                        {
                            type: 'dict',
                            dictName: 'salesType',
                            prop: 'salesType',
                            label: '原销售模式',
                            width: 200
                        },
                        {
                            prop: 'originCount',
                            label: '在运营数量',
                            width: 200
                        },
                        {
                            prop: 'count',
                            label: '补购数量',
                            width: 180
                        },
                        {
                            prop: 'outCount',
                            label: '已出库',
                            width: 180,
                            visible: approvalStatus >= 3
                        },
                        {
                            type: 'money',
                            prop: 'unitPriceSalesTotal',
                            label: '销售价格',
                            width: 180
                        },
                        {
                            type: 'money',
                            prop: 'unitPriceServicesTotal',
                            label: '服务费',
                            width: 180
                        },
                        {
                            type: 'money',
                            prop: 'unitPriceInstallTotal',
                            label: '安装费',
                            width: 180
                        }
                    ]
                    break
                case 3:
                    // 续费
                    columns = [
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            width: 260
                        },
                        {
                            prop: 'productName',
                            label: '可续费产品名称',
                            width: 260
                        },
                        {
                            type: 'dict',
                            dictName: 'salesType',
                            prop: 'salesType',
                            label: '原销售模式',
                            width: 200
                        },
                        {
                            type: 'date',
                            prop: 'endDateOrigin',
                            width: 200,
                            label: '原服务期限'
                        },
                        {
                            prop: 'count',
                            label: '续期设备数量',
                            width: 240
                        },
                        {
                            type: 'date',
                            prop: 'endDate',
                            label: '续费至',
                            width: 200
                        },
                        {
                            type: 'money',
                            prop: 'unitPriceServicesTotal',
                            label: '服务费',
                            width: 180
                        },
                        {
                            type: 'money',
                            prop: 'unitPriceInstallTotal',
                            label: '安装费',
                            width: 180
                        }
                    ]
                    break
                default:
                    columns = [
                        {
                            prop: 'productCode',
                            label: '产品编号',
                            width: 260
                        },
                        {
                            prop: 'productName',
                            label: '产品名称',
                            width: 230
                        },
                        {
                            type: 'dict',
                            dictName: 'salesType',
                            prop: 'salesType',
                            label: '销售模式',
                            width: 200
                        },
                        {
                            prop: 'count',
                            label: '数量',
                            width: 180
                        },
                        {
                            prop: 'outCount',
                            label: '已出库',
                            width: 180,
                            visible: approvalStatus >= 3
                        },
                        {
                            type: 'money',
                            prop: 'unitPriceDepositTotal',
                            label: '押金',
                            width: 200
                        },
                        {
                            type: 'money',
                            prop: 'unitPriceSalesTotal',
                            label: '销售价格',
                            width: 200
                        },
                        {
                            type: 'money',
                            prop: 'unitPriceServicesTotal',
                            label: '服务费',
                            width: 200
                        },
                        {
                            type: 'money',
                            prop: 'unitPriceInstallTotal',
                            label: '安装费',
                            width: 200
                        },
                        {
                            type: 'money',
                            prop: 'unitPriceMoveTotal',
                            label: '迁装费',
                            width: 200
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
