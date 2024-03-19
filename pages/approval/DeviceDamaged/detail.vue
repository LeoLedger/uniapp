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
                approvalType: 10
            }
        },
        computed: {
        },
        watch: {
        },
        onShow() {
        },
        mounted() {
            this.$refs.BaseFormView.setConfig({
                formConfig: [
                    { prop: 'code', label: '单据编号' },
                    { prop: 'applyDate', label: '提交时间', type: 'date' },
                    { prop: 'applyUserName', label: '提交人' },
                    { prop: '_warehousesName', label: '仓库' },
                    { prop: 'count', label: '报损数量' },
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
                        let formData = await approvalApi.deviceDamagedDetail(this.dataId)
                        if (formData.warehousesName && formData.shippingSpaceName) {
                            formData._warehousesName = `${formData.warehousesName}/${formData.shippingSpaceName}`
                        }
                        this.updateData(formData)
                        this.$refs.BaseFormView.setConfig({ formData })
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
