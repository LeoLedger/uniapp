<template>
    <view class="content">
        <sy-navigation-bar title="登录" background-color="" z-index="1000" back/>
        <view class="main-wrap">
            <view class="body-wrap">
                <image class="back-image" src="@/static/image/login/back.png"/>
                <view class="form-wrap">
                    <view class="form-item sy-ui-border-bottom">
                        <sy-input
                            v-model="formData.loginName"
                            icon-color="#cdcdff"
                            prefix-icon="iconfont iconzhanghao"
                            placeholder="请输入登录账号"
                            clearable
                            icon-size="40rpx"
                        />
                    </view>
                    <view class="form-item sy-ui-border-bottom">
                        <sy-input
                            v-model="formData.password"
                            password
                            clearable
                            show-password
                            icon-color="#cdcdff"
                            prefix-icon="iconfont iconmima"
                            placeholder="密码"
                            icon-size="40rpx"
                        />
                    </view>
                    <view class="form-item sy-ui-border-bottom">
                        <sy-input
                            v-model="formData.captcha"
                            clearable
                            icon-color="#cdcdff"
                            prefix-icon="iconfont iconyanzhengma"
                            placeholder="验证码"
                            icon-size="40rpx"
                        >
                            <view slot="append" class="key-code" @tap="handleRefreshCode">
                                <image :src="identifyCode" />
                            </view>
                        </sy-input>
                    </view>
                    <view class="form-button">
                        <sy-button
                            :styles="{
                                height: '110rpx',
                                borderRadius: '55rpx',
                            }"
                            type="primary"
                            text="登录"
                            @tap="handleLogin"
                        />
                    </view>
                </view>
            </view>
            <view class="foot-wrap">
                <image src="@/static/image/login/logo.png"/>
                <text>图元物联网设备管理服务云平台</text>
            </view>
        </view>
    </view>
</template>
<script>
    // API
    import userApi from '@/api/user'
    // 方法
    import { mapState, mapActions, mapMutations } from 'vuex'
    // 组件

    const isDevelopment = ['development', 'staging'].includes(process.env.NODE_ENV)

    export default {
        components: {
        },
        data() {
            return {
                formData: {
                    uuid: '',
                    captcha: '',
                    loginName: isDevelopment ? 'admin' : '',
                    password: isDevelopment ? 'HWadmin123@' : ''
                },
                identifyCode: ''
            }
        },
        computed: {
            ...mapState(['isLogin', 'userInfo', 'appSetting'])
        },
        created() {
            this.handleRefreshCode()
        },
        methods: {
            ...mapActions(['getUserInfo']),
            ...mapMutations(['login', 'setUserInfo']),
            //  获取验证码
            queryCaptcha() {
                userApi.getCaptcha().then(data => {
                    this.identifyCode = data.base64
                    this.formData.uuid = data.uuid
                    if (isDevelopment) {
                        this.formData.captcha = data.code
                    }
                })
            },
            handleLogin() {
                if (this.loading) return
                let { loginName, password, captcha } = this.formData
                if (loginName === '') {
                    return this.showToast('请输入用户名')
                }
                if (password === '') {
                    return this.showToast('请输入密码')
                }
                if (captcha === '') {
                    return this.showToast('请输入验证码')
                }
                this.showLoading()
                this.showLoading('登录中')
                wx.login({
                    success: async({ code }) => {
                        try {
                            let token = await userApi.login(this.formData)
                            this.login(token)
                            this.getUserInfo()
                            // #ifndef H5
                            await userApi.bindWeixin({ code })
                            // #endif
                            uni.switchTab({
                                url: '/pages/tabBar/home'
                            })
                        } catch (err) {
                            console.log(err)
                            this.loading = false
                            this.handleRefreshCode()
                        }
                    },
                    fail: (err) => {
                        console.log(err)
                        uni.hideLoading()
                        this.loading = false
                    }
                })
            },
            // 刷新验证码
            handleRefreshCode() {
                this.identifyCode = ''
                this.formData.uuid = ''
                this.queryCaptcha()
            }
        }
    }
</script>
<style  lang="scss" scoped>
.content {
    height: 100%;
    .main-wrap {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        height: 100%;
    }
    .back-image {
        width: 100%;
        height: 732rpx;
    }
    .form-wrap {
        padding: 0 60rpx;
        .form-item {
            padding: 30rpx 0;
            &::after {
                border-color: #E1E2FF;
            }
        }
        .key-code {
            width: 120rpx;
            height: 60rpx;
            margin-left: 20rpx;
            image {
                width: 100%;
                height: 100%;
            }
        }
        .form-button {
            margin-top: 60rpx;
        }
    }
    .foot-wrap {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 30rpx 0;
        image {
            width: 24rpx;
            height: 24rpx;
            margin-right: 10rpx;
        }
        text {
            font-size: 23rpx;
            color: #999;
        }
    }
}
</style>
