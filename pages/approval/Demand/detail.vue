<template>
    <view class="public-approval-detail">
        <detail-frame
            :can-approval="canApproval"
            :extend-params="extendParams"
            :disabled-step="disabledStep"
            @update="queryBaseInfo"
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
            <view v-show="showVerifiableList" class="module">
                <view class="head-wrap slenderBorderBottom">
                    <view class="text">核销信息</view>
                </view>
                <view class="body-wrap">
                    <sy-table-config/>
                </view>
            </view>
        </detail-frame>
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
                            type: 'date',
                            prop: 'verifiableTime',
                            label: '单据核销时间',
                            width: 210
                        },
                        {
                            prop: 'verifiableUserName',
                            label: '操作人',
                            width: 130
                        },
                        {
                            prop: 'verifiableContent',
                            label: '说明',
                            flex: true
                        }
                    ]
                },
                approvalType: 0,
                showVerifiableList: false
            }
        },
        provide() {
            return {
                provideComponent: this
            }
        },
        onShow() {
        },
        mounted() {
            this.$refs.BaseFormView.setConfig({
                formConfig: [
                    { prop: 'code', label: '单据编号' },
                    { prop: 'applyDate', label: '提交时间', type: 'date' },
                    { prop: 'applyUserName', label: '提交人' },
                    { prop: 'projectName', label: '项目' },
                    { prop: 'productName', label: '产品' },
                    { prop: 'purchaseCount', label: '需求数量' },
                    { prop: 'purchaseDate', label: '需求日期', type: 'date' },
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
                        let formData = await approvalApi.demandDetail(this.dataId)
                        this.updateData(formData)
                        this.showVerifiableList = formData.approvalStatus === 4
                        this.$refs.BaseFormView.setConfig({ formData })
                        let { verifiableTime, verifiableUserName, verifiableContent } = formData
                        this.tableConfig.list = [{
                            verifiableTime,
                            verifiableUserName,
                            verifiableContent
                        }]
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
