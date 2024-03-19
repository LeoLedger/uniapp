<template>
    <view class="content">
        <view v-if="canCreate" class="register-button" @tap="handleGotoHandle()">
            <text class="icon iconfont iconicon-jia"/>
            <text class="text">登记新安装的设备</text>
        </view>
        <view class="info-wrap">
            <view class="item">
                <view class="label">安装企业：</view>
                <view class="value">{{ formData.customerName || '- -' }}</view>
            </view>
            <view class="item slenderBorderTop">
                <view class="label">安装标段：</view>
                <view class="value">{{ formData.sectionName || '- -' }}</view>
            </view>
            <view class="item slenderBorderTop">
                <view class="label">标段联系人：</view>
                <view class="value">
                    <text class="text">{{ formData.sectionMember || '- -' }}</text>
                    <text class="icon iconfont icondianhua" @tap="handlePhone"/>
                </view>
            </view>
            <view class="item slenderBorderTop">
                <view class="label">申请安装数量：</view>
                <view class="value">{{ formData.count }}</view>
            </view>
        </view>
        <view class="title-wrap">
            <image src="@/static/image/home/icon-register.png" class="icon"/>
            <text>登记安装（{{ formData.installCount || 0 }}）</text>
        </view>
        <view v-if="dataList.length" class="list-wrap">
            <uni-swipe-action>
                <view
                    v-for="(item, index) in dataList"
                    :key="index"
                    class="item"
                >
                    <uni-swipe-action-item :disabled="!canEdit">
                        <view class="item-wrap" @tap="handleGotoHandle(item)">
                            <view class="body-wrap">
                                <view class="text">{{ item.imei }}</view>
                                <view v-if="!item.guidId" class="flag iconfont iconiconfontzhizuobiaozhun023113"/>
                                <view class="icon sy-ui-icon-arrow-right"/>
                                <view
                                    v-if="item._error"
                                    class="red-dot"
                                    @tap.stop="handleErrorMsg(item)"
                                >!</view>
                            </view>
                        </view>
                        <template v-slot:right>
                            <view class="button">
                                <sy-button
                                    :styles="{
                                        height: '56rpx',
                                        marginRight: '30rpx',
                                        padding: '0 20rpx',
                                        fontSize: '24rpx',
                                        borderRadius: '12rpx',
                                    }"
                                    type="danger"
                                    text="删除"
                                    @click="handleDelete(index)"
                                />
                            </view>
                        </template>
                    </uni-swipe-action-item>
                </view>
            </uni-swipe-action>
        </view>
        <sy-load-more :config="loadConfig" :type="loadType"/>
        <sy-modal
            :visible.sync="errorMsgModal.visible"
            title="错误信息"
            @confirm="errorMsgModal.visible = false"
        >
            <view slot="content">
                <view
                    v-for="(item, index) in errorMsgModal.content"
                    :key="index"
                >{{ index + 1 }}：{{ item }}</view>
            </view>
        </sy-modal>
    </view>
</template>

<script>
    // API
    import installRegisterApi from '@/api/installRegister'
    // 方法
    // 组件
    export default {
        components: {
        },
        data() {
            return {
                canEdit: false,
                loadType: 'loading',
                loadConfig: {
                    empty: {
                        text: '暂无设备',
                        styles: {
                            height: '300rpx'
                        },
                        iconStyles: {
                            margin: '0 0 20rpx 0',
                            fontSize: '120rpx'
                        }
                    }
                },
                dataList: [],
                formData: {
                    count: 0,
                    installCount: 0,
                    sectionPhone: '',
                    sectionMember: ''
                },
                errorMsgModal: {
                    visible: false
                },
                extendParams: {},
                activeRowData: null
            }
        },
        onShow() {
        },
        onLoad(params) {
            if (params.datakey) {
                let { data, canEdit, installId, excludes, productId, costCenterId } = this.getNavigateData(params.datakey)
                this.formData = {
                    ...this.formData,
                    ...data
                }
                this.canEdit = canEdit
                this.extendParams = {
                    installId,
                    excludes,
                    productId,
                    contractId: data.contractId,
                    costCenterId
                }
                this.queryDeviceList()
                this.querySectionMember()
            }
            uni.$on(this.$globalEventName['设备安装-设备信息更新'], this.handleDeviceUpdate)
        },
        onUnload() {
            uni.$off(this.$globalEventName['设备安装-设备信息更新'], this.handleDeviceUpdate)
        },
        computed: {
            canCreate() {
                let { count, installCount } = this.formData
                return installCount < count && this.canEdit
            }
        },
        methods: {
            // 验证数据
            validate() {
                let install = this.formData
                let devices = this.dataList
                let { excludes } = this.extendParams
                // 找到验证不通过的设备
                devices.forEach(item => {
                    item._errorMsg = []
                    // imei不能相同
                    if (excludes.filter(v => v === item.imei).length > 1) {
                        item._errorMsg.push('该imei已存在')
                    }
                })
                // 找到超出申请安装数量的设备
                devices.slice(install.count).forEach(item => {
                    item._errorMsg.push('已超出最大申请数量')
                })
                devices.forEach(item => {
                    item._error = item._errorMsg.length > 0
                })
                return devices.findIndex(v => v._error) > -1
            },
            // 获取设备列表
            async queryDeviceList() {
                let { installDevices } = this.formData
                if (installDevices) {
                    this.dataList = installDevices
                    this.validate()
                    this.loadType = this.dataList.length ? 'hide' : 'empty'
                } else {
                    this.loadType = 'loading'
                    try {
                        let { guidId, installCount } = this.formData
                        var data = await installRegisterApi.list({
                            pageSize: installCount,
                            installListId: guidId
                        })
                        this.dataList = data.records.map(item => {
                            item.files = null
                            item._error = false
                            item._errorMsg = []
                            return item
                        })
                        this.loadType = this.dataList.length ? 'hide' : 'empty'
                    } catch (err) {
                        console.log(err)
                        this.loadType = 'error'
                    }
                }
            },
            // 获取标段联系人
            async querySectionMember() {
                var data = await installRegisterApi.getSectionMember(this.formData.sectionId)
                if (data && data.length) {
                    this.formData = {
                        ...this.formData,
                        sectionPhone: data[0].phone,
                        sectionMember: data[0].name
                    }
                }
            },
            // 更新安装数量
            updateCount() {
                this.formData.installCount = this.dataList.length
                this.validate()
            },
            // 点击电话按钮时触发
            handlePhone() {
                let { sectionPhone } = this.formData
                if (sectionPhone) {
                    uni.makePhoneCall({
                        phoneNumber: sectionPhone
                    })
                } else {
                    this.showToast('暂无联系电话')
                }
            },
            // 点击删除按钮时触发
            handleDelete(index) {
                this.showModal('是否删除该设备？').then(() => {
                    this.dataList.splice(index, 1)
                    this.updateCount()
                    uni.$emit(this.$globalEventName['设备安装-设备列表更新'], this.dataList)
                })
            },
            // 点击红点时触发
            handleErrorMsg(data) {
                this.errorMsgModal = {
                    visible: true,
                    content: data._errorMsg
                }
            },
            // 跳转到详情页面
            handleGotoHandle(data) {
                let params = {
                    isEdit: !data,
                    canEdit: this.canEdit,
                    ...this.extendParams
                }
                if (data) {
                    if (data.guidId) {
                        params.dataId = data.guidId
                    } else {
                        params.data = data
                    }
                }
                this.activeRowData = data
                this.navigateToData('/pages/home/installRegister/update', params)
            },
            // 设备信息更新时触发
            handleDeviceUpdate(data) {
                if (this.activeRowData) {
                    Object.keys(data).forEach(key => {
                        this.activeRowData[key] = data[key]
                    })
                } else {
                    data._error = false
                    data._errorMsg = []
                    this.dataList.splice(0, 0, data)
                    this.updateCount()
                }
                this.formData.installCount = this.dataList.length
                uni.$emit(this.$globalEventName['设备安装-设备列表更新'], this.dataList)
            }
        }
    }
</script>

<style lang="scss" scoped>
.content {
    padding: 30rpx 0;
}
.register-button {
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 30rpx;
    height: 88rpx;
    color: #0001AE;
    border: 1px dashed #4142DB;
    &:active {
        background: #f5f5f5;
    }
    .icon {
        font-size: 30rpx;
        margin-right: 10rpx;
    }
    .text {
        font-size: 32rpx;
        font-weight: bold;
    }
}
.info-wrap {
    background: #fff;
    border-radius: 14rpx;
    padding: 0 30rpx;
    margin: 30rpx 30rpx 0;
    &:first-child {
        margin-top: 0;
    }
    .item {
        display: flex;
        line-height: 42rpx;
        padding: 15rpx 0;
        .value {
            display: flex;
            align-items: center;
            flex: 1;
            .text {
                flex: 1;
            }
            .icon {
                color: #0001AE;
                font-size: 48rpx;
            }
        }
    }
}
.title-wrap {
    position: sticky;
    z-index: 10;
    top: 0;
    //#ifdef H5
    top: var(--window-top);
    //#endif
    display: flex;
    align-items: center;
    padding: 30rpx 0;
    margin: 0 30rpx;
    line-height: 48rpx;
    background: #F9FAFD;
    border-radius: 0 0 30rpx 30rpx;
    &.active {
        background: #fff;
        box-shadow: 0 2rpx 7rpx 0 rgba(228, 227, 227, 0.5);
    }
    image {
        width: 44rpx;
        height: 44rpx;
        margin-right: 10rpx
    }
    text {
        flex: 1;
        font-size: 32rpx;
    }
}
.list-wrap {
    .item {
        .item-wrap {
            padding: 10rpx 30rpx;
            .body-wrap {
                position: relative;
                display: flex;
                align-items: center;
                height: 72rpx;
                padding: 0 30rpx;
                background: #FFFFFF;
                box-shadow: 0 2rpx 7rpx 0 rgba(228, 227, 227, 0.5);
                border-radius: 14rpx;
                .text {
                    flex: 1;
                }
                .icon {
                    font-size: 20rpx;
                    color: #c7c7cc;
                }
                .flag {
                    position: absolute;
                    left: 0;
                    top: 0;
                    color: $SUCCESS_COLOR;
                    font-size: 40rpx;
                    border-radius: 14rpx 0 0 0;
                    overflow: hidden;
                }
            }
            .red-dot {
                position: absolute;
                top: -10rpx;
                right: -10rpx;
                z-index: 10;
                display: flex;
                align-items: center;
                justify-content: center;
                width: 32rpx;
                height: 32rpx;
                color: #fff;
                font-size: 20rpx;
                border-radius: 50%;
                background: $DANGER_COLOR;
            }
        }
    }
    .button {
        display: flex;
        align-items: center;
    }
}
</style>
