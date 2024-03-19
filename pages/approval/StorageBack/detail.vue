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
                        <view class="text">退库产品清单</view>
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
                            width: 260
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
                            label: '可退库数量',
                            width: 200
                        },
                        {
                            prop: 'countIng',
                            label: '退库中',
                            width: 160
                        },
                        {
                            prop: 'countApply',
                            label: '申请退库数量',
                            width: 220
                        },
                        {
                            prop: 'countApply_',
                            label: '清点退库数量',
                            width: 220,
                            visible: false
                        },
                        {
                            type: 'money',
                            prop: 'amountDeduct',
                            label: '扣除押金(元)',
                            width: 220,
                            visible: false
                        }
                    ]
                },
                approvalType: 3,
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
                    { prop: 'sectionName', label: '标段' },
                    { prop: 'projectName', label: '项目' },
                    { prop: 'customerName', label: '企业' },
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
                        let formData = await approvalApi.storageBackDetail(this.dataId)
                        await Promise.all(formData.prodList.map(item => this.queryDeviceList(item)))
                        this.jsonData = formData.prodList
                        this.updateData(formData)
                        this.tableConfig.list = formData.prodList
                        this.$refs.BaseFormView.setConfig({ formData })
                        uni.hideLoading()
                    } catch (err) {
                        console.error(err)
                    }
                }
            },
            // 获取申请入库设备列表
            async queryDeviceList(data) {
                if (data.countApply) {
                    let res = await approvalApi.getProdDeviceList(data.guidId)
                    data.deviceList = res
                    data.countApply_ = res.length
                }
            },
            updateTabelConfig() {
                this.tableConfig.columns.find(v => v.prop === 'countApply_').visible = this.processIndex >= 2
                this.tableConfig.columns.find(v => v.prop === 'amountDeduct').visible = this.processIndex > 2
            }
        }
    }
</script>

<style lang="scss" scoped>
</style>
