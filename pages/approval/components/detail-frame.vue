
<template>
    <view class="detail-frame">
        <view class="tabs-wrap">
            <view class="body-wrap flex">
                <view
                    v-for="item in tabsData"
                    :key="item.value"
                    :class="{active: tabsActive === item.value}"
                    class="item"
                    @tap="handleTabsChange(item)"
                >
                    <view class="text">{{ item.label }}</view>
                    <view class="iconfont iconbanyuan"/>
                </view>
            </view>
        </view>
        <view style="height: 124rpx"/>
        <view v-show="tabsActive === 0" class="detail-wrap">
            <slot/>
        </view>
        <view v-show="tabsActive === 1" class="process-wrap">
            <approval-process
                ref="ApprovalProcess"
                :wf-inst-id="wfInstId"
                @update="handleProcessUpdate"
            />
        </view>
        <view id="ProcessBottom"/>
        <template v-if="canApproval">
            <view style="height: 126rpx"/>
            <view class="foot-wrap">
                <sy-button text="审批" type="primary" @click="handleApproval" />
            </view>
        </template>
        <approval-dialog
            v-if="extendParams"
            :visible.sync="approvalDialog.visible"
            :extend-params="extendParams"
            :only-allow-back="onlyAllowBack"
            @update="handleUpdate"
        />
    </view>
</template>

<script>
    // 组件
    import ApprovalDialog from '@/components/Approval/ApprovalDialog'
    import ApprovalProcess from '@/components/Approval/ApprovalProcess'

    export default {
        components: {
            ApprovalDialog,
            ApprovalProcess
        },
        props: {
            // 是否显示审批按钮
            canApproval: Boolean,
            // 禁用的环节code
            disabledStep: Array,
            // 审批参数
            extendParams: Object
        },
        data() {
            return {
                tabsData: [
                    { label: '基础信息', value: 0 },
                    { label: '审批流程', value: 1 }
                ],
                tabsActive: 0,
                processIndex: -1,
                approvalDialog: {
                    visible: false
                }
            }
        },
        computed: {
            wfInstId() {
                if (this.extendParams) {
                    return this.extendParams.wfInstId
                }
            },
            onlyAllowBack() {
                let disabledStep = this.disabledStep || []
                return disabledStep.includes(this.processIndex)
            }
        },
        watch: {
        },
        methods: {
            handleUpdate() {
                this.showToast('提交成功', {
                    mask: true
                })
                setTimeout(() => {
                    uni.$emit(this.$globalEventName['审批列表更新'])
                    uni.navigateBack()
                }, 1000)
            },
            // 点击审批按钮时触发
            handleApproval() {
                let processIndex = this.processIndex
                if (processIndex > -1) {
                    this.approvalDialog = {
                        visible: true
                    }
                }
            },
            // 选项卡切换时触发
            handleTabsChange(data) {
                switch (data.value) {
                case 0:
                    uni.pageScrollTo({
                        scrollTop: 0,
                        duration: 0
                    })
                    break
                case 1:
                    uni.pageScrollTo({
                        selector: '#ProcessBottom',
                        duration: 0
                    })
                    break
                }
                this.tabsActive = data.value
            },
            // 流程更新时触发
            handleProcessUpdate(index) {
                this.processIndex = index
                this.$emit('process-update', index)
            }
        }
    }
</script>
<style lang="scss" scoped>
.detail-frame {
    padding: 30rpx 0;
}
.tabs-wrap {
    position: fixed;
    top: var(--window-top);
    left: 0;
    right: 0;
    height: 72rpx;
    z-index: 100;
    padding: 20rpx 30rpx 0;
    background: $APP_COLOR;
    border-radius: 0 0 40rpx 40rpx;
    .body-wrap {
        background: #fff;
        height: 104rpx;
        border-radius: 40rpx;
        box-shadow: 0 4rpx 60rpx 0 rgba(180, 180, 180, 0.24);
    }
    .item {
        position: relative;
        flex: 1;
        color: #666;
        text-align: center;
        &.active {
            color: $APP_COLOR;
            .text {
                font-weight: bold;
            }
            .iconfont {
                opacity: 1;
            }
        }
    }
    .text {
        font-size: 32rpx;
    }
    .iconfont {
        position: absolute;
        left: 50%;
        bottom: -4rpx;
        transform: translate3d(-50%, 100%, 0);
        opacity: 0;
        font-size: 20rpx;
        line-height: 1em;
    }
}
.foot-wrap {
    position: fixed;
    left: 0;
    bottom: 0;
    right: 0;
    background: #fff;
    padding: 19rpx 30rpx;
    z-index: 100;
    box-shadow: 0 -4rpx 60rpx 0 rgba(180, 180, 180, 0.24);
}
</style>
