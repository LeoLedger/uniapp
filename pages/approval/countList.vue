<template>
    <view class="content">
        <view class="data-list">
            <view
                v-for="(item, index) in dataList"
                :key="index"
                class="item flex"
                @tap="handleGotoHandle(item)"
            >
                <view class="text">{{ item.label }}</view>
                <view v-if="item.count > 0" class="count sy-ui-din-medium flex">{{ item.count > 99 ? '99+': item.count }}</view>
            </view>
        </view>
        <view style="height: 124rpx" />
        <view class="foot-wrap">
            <view
                v-for="item in tabsList"
                :key="item.value"
                :class="{active: searchParam.selectType === item.value}"
                class="item"
                @click="handleTabsChange(item)"
            >
                <view :class="[item.icon]" class="iconfont" />
                <view class="text">
                    {{ item.label }}
                </view>
            </view>
        </view>
    </view>
</template>

<script>
    // API
    import approvalApi from '@/api/approval'
    // 方法
    import enums from '@/utils/enum'
    // 组件

    export default {
        components: {
        },
        data() {
            return {
                tabsList: [
                    { label: '待审批的', icon: 'icondaishenpide', value: 0 },
                    { label: '我审批的', icon: 'iconwoshenpide', value: 1 },
                    { label: '我提交的', icon: 'iconwotijiaode', value: 2 }
                ],
                dataList: enums.approvalType.map(item => {
                    return {
                        type: item.type,
                        name: item.name,
                        label: item.label,
                        count: 0
                    }
                }),
                searchParam: {
                    selectType: 0
                }
            }
        },
        onShow() {
        },
        onLoad() {
            this.queryCount()
            uni.$on(this.$globalEventName['审批列表更新'], this.queryCount)
        },
        onUnload() {
            uni.$off(this.$globalEventName['审批列表更新'], this.queryCount)
        },
        methods: {
            // 获取审批数量
            queryCount() {
                this.showLoading()
                approvalApi.getCount(this.searchParam.selectType).then(list => {
                    this.dataList.forEach(item => {
                        let data = list.find(v => v.type === item.type)
                        if (data) {
                            item.count = data.count
                        }
                    })
                    uni.hideLoading()
                })
            },
            // 跳转到详情页面
            handleGotoHandle(data) {
                uni.navigateTo({
                    url: `/pages/approval/approvalList?type=${data.type}&selectType=${this.searchParam.selectType}`
                })
            },
            // 选项卡切换时触发
            handleTabsChange(data) {
                this.searchParam.selectType = data.value
                this.queryCount()
            }
        }
    }
</script>

<style lang="scss" scoped>
.data-list {
    padding: 30rpx;
    .item {
        display: flex;
        align-items: center;
        height: 84rpx;
        background: #fff;
        box-shadow: 0 2rpx 7rpx 0 rgba(228, 227, 227, 0.5);
        border-radius: 14rpx;
        padding-right: 30rpx;
        & + .item {
            margin-top: 15rpx;
        }
        &::before {
            content: '';
            width: 8rpx;
            height: 24rpx;
            background: $APP_COLOR;
            margin-right: 22rpx;
        }
        .text {
            flex: 1;
            color: #333;
            font-weight: bold;
        }
        .count {
            min-width: 68rpx;
            height: 44rpx;
            color: $APP_COLOR;
            background: #EFEFF4;
            border-radius: 22rpx;
            justify-content: center;
            padding: 0 10rpx;
        }
    }
}
.foot-wrap {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 50;
    background: #fff;
    box-shadow: 0 -4rpx 60rpx 0 rgba(180, 180, 180, 0.24);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24rpx 0 18rpx;
    .item {
        flex: 1;
        text-align: center;
        color: #999;
        .iconfont {
            font-size: 42rpx;
        }
        .text {
            font-size: 26rpx;
            margin-top: 6rpx;
        }
        &.active {
            color: $APP_COLOR;
            .text {
                font-weight: bold;
            }
        }
    }
}
</style>
