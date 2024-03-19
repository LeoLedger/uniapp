<template>
    <view class="content">
        <view class="head-wrap">
            <view :class="{expanded: isExpandInfo}" class="info-wrap">
                <view v-if="isExpandInfo" class="main-wrap">
                    <view class="item">
                        <view class="label">单据编号：</view>
                        <view class="value">{{ formData.code || '- -' }}</view>
                    </view>
                    <view class="item slenderBorderTop">
                        <view class="label">供应商：</view>
                        <view class="value">{{ formData.supplierName || '- -' }}</view>
                    </view>
                    <view class="item slenderBorderTop">
                        <view class="label">申请产品编号：</view>
                        <view class="value">{{ formData.productCode || '- -' }}</view>
                    </view>
                    <view class="item slenderBorderTop">
                        <view class="label">申请安装产品名称：</view>
                        <view class="value">{{ formData.productName || '- -' }}</view>
                    </view>
                    <view class="item slenderBorderTop">
                        <view class="label">计划安装时间：</view>
                        <view class="value">{{ formData.startDate | dateFormat('YYYY-MM-DD') }} 至 {{ formData.endDate | dateFormat('YYYY-MM-DD') }}</view>
                    </view>
                    <view class="item slenderBorderTop">
                        <view class="label">联系人：</view>
                        <view class="value">{{ formData.contactPerson || '- -' }}</view>
                    </view>
                    <view class="item slenderBorderTop">
                        <view class="label">联系电话：</view>
                        <view class="value">{{ formData.contactPhone || '- -' }}</view>
                    </view>
                    <view class="item slenderBorderTop">
                        <view class="label">联系地址：</view>
                        <view class="value">{{ formData.address || '- -' }}</view>
                    </view>
                    <view class="item slenderBorderTop">
                        <view class="label">创建时间：</view>
                        <view class="value">{{ formData.regisTime | dateFormat('YYYY-MM-DD') }}</view>
                    </view>
                    <view class="item slenderBorderTop">
                        <view class="label">创建人：</view>
                        <view class="value">{{ formData.regisUserName || '- -' }}</view>
                    </view>
                </view>
                <view
                    :class="{active: isExpandInfo, visible: isScrollTop}"
                    class="expand-button"
                    @tap="isExpandInfo = !isExpandInfo"
                >
                    <text class="icon sy-ui-icon-arrow-right"/>
                </view>
            </view>
        </view>
        <view class="title-wrap">
            <image src="@/static/image/home/icon-register.png" class="icon"/>
            <text>申请安装情况（{{ formData.completeCount || 0 }}/{{ formData.count || 0 }}）</text>
        </view>
        <view class="list-wrap">
            <view
                v-for="(item, index) in dataList"
                :key="index"
                :data-status="item.installCount >= item.count ? 1 : 0"
                class="item"
                @tap="handleGotoHandle(item)"
            >
                <view class="head">
                    <view class="title">{{ item.customerName }}</view>
                    <view class="icon sy-ui-icon-arrow-right"/>
                </view>
                <view class="foot slenderBorderTop">
                    <view class="text">{{ item.sectionName }}</view>
                    <view class="count">{{ item.installCount }}/{{ item.count }}</view>
                </view>
                <view
                    v-if="item._error"
                    class="red-dot"
                >!</view>
            </view>
            <sy-load-more :type="loadType" />
        </view>
        <template v-if="canEdit">
            <view style="height: 128rpx" />
            <view class="foot-wrap">
                <sy-button
                    type="primary"
                    text="提交设备安装结果"
                    @click="handleSubmit"
                />
            </view>
        </template>
        <sy-modal
            :visible.sync="errorMsgModal.visible"
            :content="errorMsgModal.content"
            :show-cancel="errorMsgModal.showCancel"
            title="错误信息"
            @confirm="errorMsgModal.visible = false"
        />
    </view>
</template>

<script>
    // API
    import installRegisterApi from '@/api/installRegister'
    // 方法
    import enums from '@/utils/enum'
    // 组件

    export default {
        components: {
        },
        data() {
            return {
                formData: {},
                dataList: [],
                tabsData: [
                    { label: '全部', value: 0, list: [] },
                    { label: '已维修', value: 0, list: [] },
                    { label: '待维修', value: 0, list: [] }
                ],
                tabActive: 0,
                loadType: 'loading',
                searchParam: {
                    id: '',
                    imei: '',
                    type: 0,
                    pageSize: 20,
                    pageIndex: 1
                },
                filterButton: [
                    { text: '取消', name: 'cancel' },
                    { text: '确定', type: 'primary', name: 'submit' }
                ],
                filterConfig: [
                    [
                        {
                            type: 'checkbox',
                            name: 'xxx1',
                            label: '按类型',
                            options: enums.billsType,
                            button: true,
                            column: true,
                            showLabel: true,
                            align: 'left'
                        },
                        {
                            type: 'checkbox',
                            name: 'xxx2',
                            label: '按状态',
                            options: enums.repairStatus,
                            button: true,
                            column: true,
                            showLabel: true,
                            align: 'left'
                        }
                    ]
                ],
                repairStatus: enums.repairStatus,
                activeRowData: null,
                isScrollTop: true,
                isExpandInfo: false,
                errorMsgModal: {
                    visible: false
                },
                filterPopoverVisible: false
            }
        },
        onShow() {
            uni.$on(this.$globalEventName['维修单设备更新'], (data) => {
                Object.keys(data).forEach(key => {
                    this.activeRowData[key] = data[key]
                })
            })
        },
        onLoad(params) {
            if (params.id) {
                this.searchParam.id = params.id
                this.queryBaseData()
            }
            uni.$on(this.$globalEventName['设备安装-设备列表更新'], this.handleDeviceUpdate)
        },
        onUnload() {
            uni.$off(this.$globalEventName['设备安装-设备列表更新'], this.handleDeviceUpdate)
        },
        onPageScroll(e) {
            this.isExpandInfo = false
            this.isScrollTop = e.scrollTop < 1
        },
        computed: {
            canEdit() {
                return this.formData.status !== 9
            }
        },
        methods: {
            // 验证数据
            validate() {
                let imeis = this.getDeviceImeis()
                this.dataList.forEach(customer => {
                    let devices = customer.installDevices
                    if (Array.isArray(devices)) {
                        // 找到验证不通过的设备
                        devices.forEach(item => {
                            item._errorMsg = []
                            // imei不能相同
                            if (imeis.filter(v => v === item.imei).length > 1) {
                                item._errorMsg.push('该imei已存在')
                            }
                        })
                        // 找到超出申请安装数量的设备
                        devices.slice(customer.count).forEach(item => {
                            item._errorMsg.push('已超出最大申请数量')
                        })
                        devices.forEach(item => {
                            item._error = item._errorMsg.length > 0
                        })
                        customer._error = devices.findIndex(v => v._error) > -1
                        return customer._error
                    }
                })
                return this.dataList.findIndex(v => v._error) === -1
            },
            // 获取单据详情
            async queryBaseData() {
                this.loadType = 'loading'
                try {
                    let data = await installRegisterApi.billsDetail(this.searchParam.id)
                    this.dataList = data.deviceInstallListDetail
                    this.formData = data
                    this.loadType = 'hide'
                } catch (e) {
                    this.loadType = 'error'
                }
            },
            // 合并最新数据
            async mergeDataList() {
                try {
                    this.showLoading()
                    // 获取最新的安装信息
                    let formData = await installRegisterApi.billsDetail(this.searchParam.id)
                    let dataList = []
                    // 获取所有客户下的安装设备列表
                    await Promise.all(this.dataList.map(async customer1 => {
                        // 找到当前用户数据版本下该客户数据
                        let customer2 = formData.deviceInstallListDetail.find(v => v.guidId === customer1.guidId)
                        if (customer2) {
                            customer2._error = false
                            dataList.push(customer2)
                            // 获取线上版本的安装数据
                            let devices1 = await installRegisterApi.list({
                                pageSize: customer1.installCount,
                                installListId: customer1.guidId
                            })
                            devices1 = devices1.records.map(item => {
                                item.files = null
                                item._error = false
                                item._errorMsg = []
                                return item
                            })
                            // 如果installDevices等于null表示当前用户没有安装该客户下的设备，所以不需要处理
                            if (Array.isArray(customer1.installDevices)) {
                                // 如果安装设备guidId等于null，则表示该数据是当前用户新安装的设备，以此过滤掉不是新安装的设备
                                let devices2 = customer1.installDevices.filter(item => !item.guidId).map(item => {
                                    return {
                                        ...item,
                                        _error: false,
                                        _errorMsg: []
                                    }
                                })
                                // 合并数据
                                customer2.installDevices = devices1.concat(devices2)
                            } else {
                                customer2.installDevices = devices1
                            }
                            customer2.installCount = customer2.installDevices.length
                        }
                    }))
                    formData.deviceInstallListDetail = dataList
                    this.dataList = dataList
                    this.formData = formData
                    this.validate()
                } catch (err) {
                    console.log(err)
                }
                uni.hideLoading()
            },
            // 获取已安装的设备imei
            getDeviceImeis() {
                let excludes = []
                this.dataList.forEach(item => {
                    if (Array.isArray(item.installDevices)) {
                        excludes = excludes.concat(item.installDevices.map(v => v.imei))
                    }
                })
                return excludes
            },
            // 点击提交按钮时触发
            async handleSubmit() {
                if (this.validate()) {
                    try {
                        this.showLoading()
                        let data = await installRegisterApi.update(this.dataList.filter(v => v.installDevices))
                        if (data.code > 200) {
                            this.showModal('该数据与线上版本有冲突，是否进行合并？').then(() => {
                                this.mergeDataList()
                            }).catch(() => {
                                uni.hideLoading()
                            })
                        } else {
                            this.showToast('保存成功', {
                                mask: true
                            })
                            uni.$emit(this.$globalEventName['设备安装-单据列表更新'])
                            uni.navigateBack()
                        }
                    } catch (err) {
                        console.error(err)
                    }
                } else {
                    this.errorMsgModal = {
                        visible: true,
                        content: '该数据与线上版本有冲突，请解决后再提交'
                    }
                }
            },
            // 跳转到详情页面
            handleGotoHandle(data) {
                let { guidId, productId, supplierId } = this.formData
                this.activeRowData = data
                this.navigateToData('/pages/home/installRegister/register', {
                    data,
                    canEdit: this.canEdit,
                    installId: guidId,
                    excludes: this.getDeviceImeis(),
                    productId,
                    supplierId
                })
            },
            // 设备列表更新时触发
            handleDeviceUpdate(data) {
                if (this.activeRowData) {
                    this.activeRowData.installDevices = data
                    this.activeRowData.installCount = data.length
                }
                this.validate()
            }
        }
    }
</script>

<style lang="scss" scoped>
.head-wrap{
    .info-wrap {
        padding: 0 30rpx;
        border-radius: 0 0 30rpx 30rpx;
        &.expanded {
            background: #0001AE;
        }
        .main-wrap {
            border-radius: 14rpx;
            background: #fff;
            .item {
                display: flex;
                align-items: center;
                font-size: 28rpx;
                line-height: 42rpx;
                padding: 15rpx 30rpx;
                .value {
                    flex: 1;
                }
            }
        }
        .expand-button {
            z-index: 10;
            text-align: center;
            line-height: 1em;
            font-size: 28rpx;
            padding: 16rpx 0 0;
            color: #0001AE;
            transform: translateY(-100%);
            transition: transform .1s ease-in-out;
            .icon {
                display: inline-block;
                transform: rotateZ(90deg);
            }
            &.active {
                color: #AFC4F9;
                padding: 10rpx 0;
                .icon {
                    transform: rotateZ(-90deg);
                }
            }
            &.visible{
                transform: translateY(0);
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
    padding: 30rpx;
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
    padding: 0 30rpx;
    .item {
        position: relative;
        background: #fff;
        box-shadow: 0 2rpx 7rpx 0 rgba(228, 227, 227, 0.5);
        border-radius: 14rpx;
        & + .item {
            margin-top: 15rpx;
        }
        &:hover {
            background: #f9f9f9;
        }
        &[data-status = '0'] {
            .head::before {
                background: #0001AE;
            }
            .foot .count {
                background: linear-gradient(270deg, #0001AE 0%, #5B2B90 100%);
            }
        }
        .head {
            position: relative;
            display: flex;
            align-items: center;
            padding: 0 30rpx;
            height: 72rpx;
            &::before {
                content: '';
                position: absolute;
                left: 0;
                top: 50%;
                width: 12rpx;
                height: 23rpx;
                background: #C7C7CC;
                transform: translateY(-50%);
            }
            .title {
                font-size: 28rpx;
                flex: 1;
            }
            .icon {
                font-size: 20rpx;
                color: #c7c7cc;
            }
        }
        .foot {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 14rpx 30rpx;
            .text {
                flex: 1;
                margin-right: 30rpx;
                color: #999;
                font-size: 24rpx;
            }
            .count {
                display: flex;
                align-items: center;
                justify-content: center;
                min-width: 120rpx;
                height: 44rpx;
                background: #C7C7CC;
                border-radius: 22rpx;
                color: #fff;
                font-size: 24rpx;
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
.foot-wrap {
    position: fixed;
    left: 0;
    bottom: 0;
    right: 0;
    padding: 20rpx 30rpx;
    background: #fff;
    z-index: 50;
    box-shadow: 0 -2rpx 7rpx 0 rgba(228, 227, 227, 0.5);
}
</style>
