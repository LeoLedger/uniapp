<template>
    <view class="content">
        <sy-navigation-bar title="我的" background-color="" is-space-usage/>
        <view style="height: 110rpx;"/>
        <view class="body-wrap">
            <view class="user-wrap">
                <view class="avatar">
                    <open-data v-if="isLogin" type="userAvatarUrl"/>
                    <image v-else src="@/static/image/login/avatar.png" mode="aspectFill"/>
                </view>
                <view class="info-wrap">
                    <open-data v-if="isLogin" type="userNickName"/>
                    <navigator v-else class="link" url="/pages/user/login">点击登录</navigator>
                </view>
            </view>
            <view class="menu-wrap">
                <!-- <view class="item slenderBorderBottom" data-url="" @tap="handleTodo">
                    <image src="@/static/image/home/icon-user.png" />
                    <view class="text">个人信息</view>
                    <view class="icon sy-ui-icon-arrow-right"/>
                </view>
                <view class="item slenderBorderBottom" data-url="" @tap="handleTodo">
                    <image src="@/static/image/home/icon-scan.png" />
                    <view class="text">扫一扫</view>
                    <view class="icon sy-ui-icon-arrow-right"/>
                </view>
                <view class="item slenderBorderBottom" data-url="" @tap="handleTodo">
                    <image src="@/static/image/home/icon-setting.png" />
                    <view class="text">设置</view>
                    <view class="icon sy-ui-icon-arrow-right"/>
                </view> -->
                <view v-if="isLogin" class="item slenderBorderBottom" data-url="" @tap="handleLogout">
                    <image src="@/static/image/home/icon-setting.png" />
                    <view class="text">退出登录</view>
                    <view class="icon sy-ui-icon-arrow-right"/>
                </view>
            </view>
        </view>
    </view>
</template>

<script>
    // API
    // 方法
    import { mapState, mapMutations } from 'vuex'
    import {
        previewImgSrc
    } from '@/utils/index'
    // 组件

    export default {
        components: {
        },
        data() {
            return {
            }
        },
        onShow() {
            let page = this.$mp.page
            if (typeof page.getTabBar === 'function' && page.getTabBar()) {
                page.getTabBar().setData({
                    selected: 2
                })
            }
        },
        computed: {
            ...mapState({
                isLogin: (state) => state.user.isLogin,
                userInfo: (state) => state.user.userInfo
            }),
            avatarUrl() {
                let avatar = this.userInfo || {}
                if (avatar) {
                    return previewImgSrc + avatar
                }
                return ''
            }
        },
        onLoad() {

        },
        methods: {
            ...mapMutations([
                'logout'
            ]),
            // 未实现功能点击时触发
            handleTodo() {
                this.showToast('功能开发中...')
            },
            // 退出登录
            handleLogout() {
                this.showModal('是否确定退出登录？').then(() => {
                    this.logout()
                    this.showToast('退出成功')
                })
            }
        }
    }
</script>

<style lang="scss" scoped>
.content {
    display: flex;
    flex-direction: column;
    min-height: 100%;
    background-image: url(~@/static/image/home/user-head.png);
    background-size: 100%;
    background-repeat: no-repeat;
}
.body-wrap {
    flex: 1;
    position: relative;
    margin: 0 30rpx;
    background: #fff;
    border-radius: 30rpx 30rpx 0 0;
    padding: 0 30rpx;
    .user-wrap {
        display: flex;
        align-items: flex-end;
        margin-top: -79rpx;
        .avatar {
            width: 158rpx;
            height: 158rpx;
            border-radius: 50%;
            background: #fff;
            box-shadow: 0 2rpx 4rpx rgba(0,0,0,.3);
            overflow: hidden;
            image {
                width: 100%;
                height: 100%;
                border-radius: 50%;
            }
        }
        .info-wrap {
            font-size: 36rpx;
            line-height: 50rpx;
            margin-left: 30rpx;
        }
    }
    .menu-wrap {
        margin-top: 30rpx;
        .item {
            position: relative;
            display: flex;
            align-items: center;
            padding: 20rpx 0;
            image {
                width: 68rpx;
                height: 68rpx;
                margin-right: 16rpx;
            }
            .text {
                flex: 1;
                font-size: 32rpx;
            }
            .icon {
                font-size: 26rpx;
                color: #c7c7cc;
                margin-left: 16rpx;
            }
        }
    }
}
</style>
