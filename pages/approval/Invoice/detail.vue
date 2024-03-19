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
                        <view class="text">申请开票明细</view>
                    </view>
                    <view class="body-wrap">
                        <sy-table-config/>
                    </view>
                </view>
                <view v-show="processIndex >= 1" class="invoice-list">
                    <view class="head-wrap slenderBorderBottom">
                        <view class="text">开票信息</view>
                    </view>
                    <view class="list-wrap">
                        <view
                            v-for="(item, index) in invoiceList"
                            :key="index"
                            class="item"
                        >
                            <view class="head flex slenderBorderTop">
                                <view class="name">{{ item.type | getDictProp('invoiceType') }}</view>
                                <view class="date">{{ item.invoiceDate | dateFormat }}</view>
                            </view>
                            <template v-if="item.type === 2">
                                <view class="rows slenderBorderTop">
                                    <view class="label">编号：</view>
                                    <view class="value">{{ item.code }}</view>
                                </view>
                                <view class="rows slenderBorderTop">
                                    <view class="label">合计金额：</view>
                                    <view class="value">{{ item.amount | moneyFormat }}</view>
                                </view>
                            </template>
                            <template v-else>
                                <view class="rows slenderBorderTop">
                                    <view class="label">代码：</view>
                                    <view class="value">{{ item.code }}</view>
                                </view>
                                <view class="rows slenderBorderTop">
                                    <view class="label">号码：</view>
                                    <view class="value">{{ item.number }}</view>
                                </view>
                                <view class="rows slenderBorderTop">
                                    <view class="label">校验码：</view>
                                    <view class="value">{{ item.checkCode }}</view>
                                </view>
                                <view class="rows slenderBorderTop">
                                    <view class="label">金额合计(不含税)：</view>
                                    <view class="value">{{ item.amount | moneyFormat }}</view>
                                </view>
                                <view class="rows slenderBorderTop">
                                    <view class="label">税额合计：</view>
                                    <view class="value">{{ item.tax | moneyFormat }}</view>
                                </view>
                                <view class="rows slenderBorderTop">
                                    <view class="label">价税合计(含税)：</view>
                                    <view class="value">{{ item.levied | moneyFormat }}</view>
                                </view>
                            </template>
                        </view>
                    </view>
                    <view class="not-data">
                        <sy-load-more v-if="!invoiceList.length" type="empty"/>
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
                            prop: 'approvalCode',
                            label: '关联单据',
                            width: 260
                        },
                        {
                            label: '提供产品',
                            prop: 'productProvide',
                            width: 260
                        },
                        {
                            type: 'dict',
                            dictName: 'costType',
                            prop: 'costType',
                            label: '费用类型',
                            width: 200
                        },
                        {
                            type: 'money',
                            prop: 'amountUninvoice',
                            label: '可开票',
                            width: 200
                        },
                        {
                            type: 'money',
                            prop: 'amountApply',
                            label: '申请开票',
                            width: 230
                        }
                    ]
                },
                invoiceList: [],
                approvalType: 4,
                disabledStep: [2]
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
                    { prop: 'applyDate', label: '提交时间', type: 'date' },
                    { prop: 'applyUserName', label: '提交人' },
                    { prop: 'customerName', label: '客户' },
                    { prop: 'invoiceType', label: '申请开票类型', type: 'dict', dictName: 'invoiceType' },
                    { prop: 'isMerge', label: '合并开票', type: 'dict', dictName: 'isMergeInvoice' },
                    { prop: 'invoiceAmount', label: '申请开票金额', type: 'money' },
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
                        let formData = await approvalApi.invoiceDetail(this.dataId)
                        this.updateData(formData)
                        this.invoiceList = formData.invoiceList
                        this.$refs.BaseFormView.setConfig({ formData })
                        this.tableConfig.list = formData.claimList
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
.invoice-list {
    margin-top: 30rpx;
    .head-wrap {
        display: flex;
        align-items: center;
        height: 72rpx;
        background: #fff;
        border-radius: 40rpx 40rpx 0 0;
        &::before {
            content: '';
            width: 8rpx;
            height: 24rpx;
            background: $APP_COLOR;
            margin-right: 22rpx;
        }
        .text {
            flex: 1;
            color: $APP_COLOR;
            font-weight: bold;
        }
    }
    .list-wrap {
        .item {
            background: #fff;
            padding: 0 30rpx;
            border-radius: 40rpx;
            &:first-child {
                border-radius: 0 0 40rpx 40rpx;
            }
            & + .item {
                margin-top: 16rpx;
            }
            .head {
                height: 72rpx;
                .date {
                    flex: 1;
                    text-align: right;
                }
            }
            .rows {
                display: flex;
                padding: 15rpx 0;
                line-height: 42rpx;
                .value {
                    flex: 1;
                    word-break: break-all;
                }
            }
        }
    }
    .not-data {
        background: #fff;
        border-radius: 0 0 40rpx 40rpx;
    }
}
</style>
