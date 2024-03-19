<template>
    <view class="content">
        <view :class="{active: filterPopover.visible}" class="head-wrap">
            <view class="head-main">
                <view class="search-wrap">
                    <view class="search-input">
                        <sy-input
                            v-model="filterConfig.data.imei"
                            :popover-hidden-after-display="false"
                            clearable
                            placeholder="请输入关键词进行搜索"
                            prefix-icon="sy-ui-icon-search"
                            confirm-type="search"
                            @change="filterData"
                        />
                    </view>
                    <view class="button-wrap">
                        <view class="button iconfont iconsaoma" @tap="handleScanCode"/>
                        <view class="button iconfont iconshaixuanqi" @click="filterPopover.visible = !filterPopover.visible" />
                    </view>
                </view>
                <view class="tabs-wrap">
                    <view
                        v-for="(item, index) in tabsData"
                        :key="index"
                        :class="{active: tabActive === index}"
                        class="item"
                        @tap="handleTabsChange(index)"
                    >{{ item.label }}({{ item.value }})</view>
                </view>
                <view v-if="isExpandInfo" class="info-wrap">
                    <view class="main-wrap">
                        <view class="item">
                            <view class="label">单据编号：</view>
                            <view class="value">{{ formData.code || '- -' }}</view>
                        </view>
                        <view class="item slenderBorderTop">
                            <view class="label">供应商：</view>
                            <view class="value">{{ formData.supplierName || '- -' }}</view>
                        </view>
                        <view class="item slenderBorderTop">
                            <view class="label">创建时间：</view>
                            <view class="value">{{ formData.createTime | dateFormat('YYYY-MM-DD mm:ss') }}</view>
                        </view>
                        <view class="item slenderBorderTop">
                            <view class="label">创建人：</view>
                            <view class="value">{{ formData.userName || '- -' }}</view>
                        </view>
                        <view class="item slenderBorderTop">
                            <view class="label">备注：</view>
                            <view class="value">{{ formData.remark || '- -' }}</view>
                        </view>
                    </view>
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
        <view style="height: 192rpx" />
        <view class="list-wrap">
            <view
                v-for="(item, index) in viewList"
                :key="index"
                :data-status="item._flag"
                class="item"
            >
                <view class="item-wrap" @tap="handleGotoHandle(item)">
                    <view class="head">
                        <view class="title">{{ item.imei || item.tempImei }}</view>
                        <view class="icon sy-ui-icon-arrow-right"/>
                    </view>
                    <view class="foot slenderBorderTop">
                        <view class="info">
                            <view class="rows folded f1">反馈异常：{{ item.feedback }}</view>
                            <view class="rows folded f1">车牌号：{{ item.carNumber || '- -' }}</view>
                        </view>
                        <view class="status">{{ item._flag | getDictProp('repairStatus') }}</view>
                    </view>
                </view>
            </view>
            <sy-load-more :type="loadType" />
        </view>
        <template v-if="isEdit">
            <view style="height: 128rpx" />
            <view class="foot-wrap">
                <sy-button
                    :disabled="!isSubmit"
                    type="primary"
                    text="提交反馈结果"
                    @click="handleSubmit"
                />
            </view>
        </template>
        <!-- 筛选弹出层 -->
        <sy-popover
            v-model="filterPopover.content"
            :visible="filterPopover.visible"
            :styles="{top: '130rpx'}"
            position="top"
            mask-color="rgba(0,0,0,.4)"
            @masktap="filterPopover.visible = false"
        >
            <view v-if="filterPopover.content" class="filter-popover">
                <view class="body-wrap">
                    <sy-form-config
                        style-type="filter"
                        provide-key="filterConfig"
                        @button="handleFilterButton"
                    />
                </view>
            </view>
        </sy-popover>
    </view>
</template>

<script>
    // API
    import repairBillsApi from '@/api/repairBills'
    // 方法
    import mixin from '../mixin'
    import enums from '@/utils/enum'
    // 组件

    export default {
        components: {
        },
        mixins: [mixin],
        data() {
            return {
                filterConfig: {
                    data: {
                        pageSize: 20,
                        pageIndex: 1
                    },
                    items: [
                        [
                            {
                                type: 'picker',
                                name: 'sectionId',
                                label: '标段',
                                align: 'left',
                                column: true,
                                props: {
                                    mode: 'selector',
                                    options: [],
                                    placeholder: '选择标段'
                                }
                            },
                            {
                                type: 'picker',
                                name: 'productId',
                                label: '产品编号',
                                align: 'left',
                                column: true,
                                props: {
                                    mode: 'selector',
                                    options: [],
                                    placeholder: '选择产品编号'
                                }
                            },
                            {
                                type: 'radio',
                                name: 'billsStatus',
                                label: '按状态',
                                column: true,
                                showLabel: true,
                                align: 'left',
                                props: {
                                    button: true,
                                    isCancel: true,
                                    options: enums.repairStatus
                                }
                            }
                        ]
                    ],
                    button: [
                        { text: '取消', name: 'cancel' },
                        { text: '确定', type: 'primary', name: 'submit' }
                    ]
                },
                repairStatus: enums.repairStatus
            }
        },
        provide() {
            return {
                provideComponent: this
            }
        },
        computed: {
            isEdit() {
                return this.formData.status !== 1
            },
            excludeSim() {
                let list = []
                this.dataList.map(item => {
                    if (item.sim) {
                        list.push(item.sim)
                    }
                    if (item.sim !== item.replaceSim && item.replaceSim) {
                        list.push(item.replaceSim)
                    }
                })
                return list
            }
        },
        methods: {
            // 获取详情
            async queryBaseData() {
                this.loadType = 'loading'
                try {
                    var data = await repairBillsApi.getCarRepairDetail(this.filterConfig.data.id)
                    let productOptions = []
                    let sectionOptions = []
                    this.dataList = data.listFaultCu.map(item => {
                        item._flag = item.status > 0 ? 1 : 0
                        if (productOptions.findIndex(v => v.value === item.productId) === -1) {
                            productOptions.push({
                                label: item.productCode,
                                value: item.productId
                            })
                        }
                        if (sectionOptions.findIndex(v => v.value === item.sectionId) === -1) {
                            sectionOptions.push({
                                label: item.sectionName,
                                value: item.sectionId
                            })
                        }
                        return item
                    })
                    this.$set(this.findFormConfigItem(this.filterConfig.items, 'productId').props, 'options', productOptions)
                    this.$set(this.findFormConfigItem(this.filterConfig.items, 'sectionId').props, 'options', sectionOptions)
                    this.formData = data
                    this.filterData()
                } catch (e) {
                    this.loadType = 'error'
                }
            },
            // 筛选数据
            filterData() {
                let { imei, productId, sectionId, billsStatus } = this.filterConfig.data
                let list = this.dataList.filter(item => {
                    return (this.isEmpty(imei) || item.imei.indexOf(imei) > -1) &&
                        (this.isEmpty(productId) || item.productId === productId) &&
                        (this.isEmpty(sectionId) || item.sectionId === sectionId) &&
                        (this.isEmpty(billsStatus) || item._flag === billsStatus)
                })
                this.tabsData.forEach((item, index) => {
                    switch (index) {
                    case 0:
                        item.list = list
                        break
                    case 1:
                        item.list = list.filter(v => v._flag === 1)
                        break
                    case 2:
                        item.list = list.filter(v => v._flag === 0)
                        break
                    }
                    item.value = item.list.length
                })
                this.viewList = this.tabsData[this.tabActive].list
                this.isSubmit = this.tabsData[1].list.filter(v => v.status === 0).length > 0
                if (this.viewList.length) {
                    this.loadType = 'hide'
                } else {
                    this.loadType = 'empty'
                }
            },
            // 点击提交按钮时触发
            async handleSubmit() {
                this.showLoading()
                await repairBillsApi.updateRepair({
                    ...this.formData,
                    listFaultCu: this.tabsData[1].list.filter(v => v.status === 0),
                    status: 1
                })
                this.showToast('保存成功', {
                    mask: true
                })
                uni.$emit(this.$globalEventName['维修单列表更新'])
                uni.navigateBack()
            },
            // 跳转到详情页面
            handleGotoHandle(data) {
                let params = {
                    data: JSON.parse(JSON.stringify(data)),
                    isEdit: data.status === 0,
                    billId: this.formData.guidId,
                    excludeSim: this.excludeSim,
                    excludeDevice: this.dataList.map(v => v.replaceDeviceId).filter(v => v)
                }
                this.activeRowData = data
                this.navigateToData('form', params)
            }
        }
    }
</script>

<style lang="scss" scoped>
.head-wrap{
    position: fixed;
    left: 0;
    right: 0;
    top: var(--window-top);
    z-index: 50;
    background: #0001AE;
    border-radius: 0 0 30rpx 30rpx;
    &.active {
        .head-main {
            background: #fff;
            .search-wrap {
                .button-wrap {
                    color: #0001AE;
                }
            }
        }
    }
    .head-main {
        position: relative;
        background: #0001AE;
        z-index: 2;
        border-radius: 0 0 30rpx 30rpx;
        transition: .1s ease-in-out;
        .search-wrap {
            display: flex;
            align-items: center;
            padding: 30rpx 0 0 30rpx;
            .search-input {
                flex: 1;
                background: #EFEFF4;
                border-radius: 35rpx;
                padding: 0 30rpx;
                transition: background .3s ease-in-out;
            }
            .button-wrap {
                display: flex;
                align-items: center;
                padding: 0 15rpx;
                color: #fff;
                .button {
                    height: 70rpx;
                    line-height: 70rpx;
                    padding: 0 15rpx;
                    font-size: 36rpx;
                }
            }
        }
        .tabs-wrap {
            display: flex;
            align-items: center;
            .item {
                position: relative;
                flex: 1;
                color: #fff;
                text-align: center;
                font-size: 32rpx;
                line-height: 92rpx;
                &::after {
                    content: '';
                    opacity: 0;
                    position: absolute;
                    width: 86rpx;
                    margin-left: -43rpx;
                    left: 50%;
                    bottom: 0;
                    height: 6rpx;
                    background: #AFC4F9;
                    border-radius: 3rpx;
                    transform: scaleX(0);
                    transition: .1s ease-in-out;
                }
                &.active {
                    &::after {
                        opacity: 1;
                        transform: scaleX(1);
                    }
                }
            }
        }
        .info-wrap {
            padding: 0 30rpx;
            .main-wrap {
                border-radius: 14rpx;
                background: #fff;
                .item {
                    display: flex;
                    font-size: 28rpx;
                    line-height: 42rpx;
                    padding: 15rpx 30rpx;
                    .value {
                        flex: 1;
                    }
                }
            }
        }
    }
    .expand-button {
        position: absolute;
        left: 0;
        right: 0;
        bottom: -60rpx;
        z-index: 1;
        text-align: center;
        line-height: 1em;
        font-size: 28rpx;
        padding: 16rpx 0;
        color: #AFC4F9;
        transform: translateY(-100%);
        transition: transform .1s ease-in-out;
        .icon {
            display: inline-block;
            transform: rotateZ(90deg);
        }
        &.active {
            position: relative;
            bottom: 0;
            .icon {
                transform: rotateZ(-90deg);
            }
        }
        &.visible{
            transform: translateY(0);
        }
    }
}
.list-wrap {
    margin-top: 60rpx;
    padding: 0 30rpx;
    .item {
        & + .item {
            margin-top: 15rpx;
        }
        &[data-status = '0'] {
            .head::before {
                background: #0001AE;
            }
            .foot .status {
                background: linear-gradient(270deg, #0001AE 0%, #5B2B90 100%);
            }
        }
        .item-wrap {
            background: #fff;
            box-shadow: 0 2rpx 7rpx 0 rgba(228, 227, 227, 0.5);
            border-radius: 14rpx;
            &:hover {
                background: #f9f9f9;
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
                font-size: 32rpx;
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
            .info {
                flex: 1;
                margin-right: 30rpx;
                .rows {
                    color: #999;
                    font-size: 24rpx;
                }
            }
            .status {
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
.filter-popover {
    display: flex;
    flex-direction: column;
    width: 100%;
    background: #fff;
    border-radius: 0 0 40rpx 40rpx;
    .body-wrap {
        flex: 1;
        margin-top: -20rpx;
    }
}
</style>
