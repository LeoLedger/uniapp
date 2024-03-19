<template>
    <view class="content">
        <sy-navigation-bar title="首页" background-color="" is-space-usage>
            <view slot="left" class="scan-code" @click="handleScanCode">
                <image src="@/static/image/home/scan-code.png" />
            </view>
        </sy-navigation-bar>
        <view class="banner-swiper">
            <swiper
                :autoplay="false"
                :interval="5000"
                :duration="300"
                class="swiper"
                @change="handleBannerSwiperChange"
            >
                <swiper-item v-for="(image, index) in bannerSwiper" :key="index" class="swiper-item">
                    <image :src="image" />
                </swiper-item>
            </swiper>
            <view class="indicator-dots">
                <view v-for="(item, index) in bannerSwiper" :key="index" :class="{active: bannerSwiperIndex === index}" class="item" />
            </view>
        </view>
        <view class="menu-group">
            <navigator class="item" @click="handleTodo">
                <image class="icon" src="@/static/image/home/icon-report.png"/>
                <view class="text">报表</view>
            </navigator>
            <navigator class="item" @click="handleTodo">
                <image class="icon" src="@/static/image/home/icon-message.png"/>
                <view class="text">消息</view>
            </navigator>
            <navigator class="item" url="/pages/home/installRegister/list">
                <image class="icon" src="@/static/image/home/icon-register.png"/>
                <view class="text">安装登记</view>
            </navigator>
            <navigator class="item" url="/pages/home/repairBills/list">
                <image class="icon" src="@/static/image/home/icon-repair.png"/>
                <view class="text">维修寄修</view>
            </navigator>
            <navigator class="item" @click="handleTodo">
                <image class="icon" src="@/static/image/home/icon-more.png"/>
                <view class="text">更多</view>
            </navigator>
        </view>
        <view class="menu-layout">
            <view class="item">
                <view class="wrap button1" data-url="/pages/approval/countList" @tap="handleGoto">
                    <image class="icon" src="@/static/image/home/icon-approve.png"/>
                    <view class="text">审批</view>
                    <view
                        v-if="approvalCount > 0"
                        class="count sy-ui-din-medium"
                    >
                        {{ approvalCount > 99 ? '99+': approvalCount }}
                    </view>
                </view>
            </view>
        </view>
        <view class="menu-layout">
            <view class="item" @click="handleGoto">
                <view class="wrap button2">
                    <image class="icon" src="@/static/image/home/icon-query.png"/>
                    <view class="text">业务查询</view>
                </view>
            </view>
            <view class="item" @click="handleGoto">
                <view class="wrap button3">
                    <image class="icon" src="@/static/image/home/icon-bills.png"/>
                    <view class="text">我的单据</view>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
    // API
    import approvalApi from '@/api/approval'
    // 方法
    import { scanCode } from '@/utils'
    // 组件

    export default {
        components: {
        },
        data() {
            return {
                bannerSwiper: [
                    require('@/static/image/home/banner.png')
                ],
                bannerSwiperIndex: 0,
                approvalCount: 0
            }
        },
        onShow() {
            approvalApi.getCount(0).then(data => {
                this.approvalCount = data.reduce((a, b) => {
                    return a + b.count
                }, 0)
            })
            this.setCustomTabBar(0)
        },
        onLoad() {
        },
        methods: {
            // 点击扫码按钮时触发
            async handleScanCode() {
                let data = await scanCode()
                this.showToast(data)
            },
            // 轮播图切换时触发
            handleBannerSwiperChange(res) {
                this.bannerSwiperIndex = res.detail.current
            }
        }
    }
</script>

<style lang="scss" scoped>
.content {
    min-height: 80vh;
    background-image: url(~@/static/image/home/home-head.png);
    background-size: 100%;
    background-repeat: no-repeat;
}
.scan-code{
    padding: 0 15px;
    height: 100%;
    display: flex;
    align-items: center;
    image {
        width: 24px;
        height: 24px;
    }
}
.banner-swiper{
    position: relative;
    padding-top: 10rpx;
    .swiper {
        height: 284rpx;
        .swiper-item {
            padding: 0 30rpx;
            box-sizing: border-box;
            image {
                width: 100%;
                height: 254rpx;
                border-radius: 40rpx;
                box-shadow: 0 2rpx 4rpx 0 #E9EEFF;
            }
        }
    }
    .indicator-dots{
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        bottom: 44rpx;
        display: flex;
        align-items: center;
        .item {
            width: 12rpx;
            height: 12rpx;
            background: rgba(204, 204, 204, 0.7);
            border-radius: 50%;
            & + .item {
                margin-left: 14rpx;
            }
            &.active {
                background: #fff;
            }
        }
    }
}
.menu-group {
    display: flex;
    align-items: center;
    background: #fff;
    box-shadow: 0 2rpx 2rpx 0 #E9EEFF;
    border-radius: 30rpx;
    padding: 22rpx 0;
    margin: 0 30rpx;
    .item {
        flex: 1;
        display: flex;
        align-items: center;
        flex-direction: column;
        .icon {
            width: 80rpx;
            height: 80rpx;
        }
        .text {
            color: #7180CD;
            margin-top: 6rpx;
        }
    }
}
.menu-layout {
    display: flex;
    flex-wrap: wrap;
    margin: 30rpx 15rpx 0;
    .item {
        position: relative;
        flex: 1;
        padding: 0 15rpx;
        .wrap {
            display: flex;
            align-items: center;
            justify-content: center;
            flex-direction: column;
            height: 180rpx;
            background-size: 100% 100%;
            background-repeat: no-repeat;
            background-position: 50%;
            border-radius: 30rpx;
            box-shadow: 0 2rpx 2rpx 0 #E9EEFF;
            &.button1 {
                background-image: url(~@/static/image/home/button1.png)
            }
            &.button2 {
                background-image: url(~@/static/image/home/button2.png)
            }
            &.button3 {
                background-image: url(~@/static/image/home/button3.png)
            }
            .icon {
                width: 80rpx;
                height: 80rpx;
            }
            .text {
                color: #7180CD;
                margin-top: 6rpx;
            }
        }
        .count {
            position: absolute;
            top: 16rpx;
            right: 30rpx;
            background: #DA5E5E;
            line-height: 28rpx;
            color: #fff;
            font-size: 22rpx;
            border-radius: 14rpx;
            padding: 0 12rpx;
        }
    }
}
</style>
