<template>
    <view class="content">
        <view class="head-wrap">
            <view class="search-wrap">
                <view class="search-input">
                    <sy-input
                        v-model="publicParams.imei"
                        clearable
                        placeholder="请输入关键词进行搜索"
                        prefix-icon="sy-ui-icon-search"
                        confirm-type="search"
                        @change="handleFilter"
                    />
                </view>
                <view class="button-wrap">
                    <view class="button iconfont iconsaoma" @tap="handleScanCode"/>
                </view>
            </view>
            <view class="tabs-wrap">
                <view
                    v-for="(item, index) in tabsData"
                    :key="index"
                    :class="{active: tabActive === index}"
                    class="item"
                    @tap="handleTabsChange(index)"
                >{{ item.label }}</view>
            </view>
        </view>
        <view style="height: 192rpx" />
        <view class="list-wrap">
            <view
                v-for="(item, index) in dataList"
                :key="index"
                class="item"
                @click="handleCheckChange(item)"
            >
                <view class="checkbox">
                    <sy-radio :value="item._checked" :label="true" :disabled="item._disabled" />
                </view>
                <view :class="{checked: item._checked}" class="item-wrap">
                    {{ item.imei }}
                </view>
            </view>
            <sy-load-more :type="loadType" />
        </view>
        <view style="height: 128rpx" />
        <view class="foot-wrap">
            <sy-button
                :disabled="!isSubmit"
                type="primary"
                text="确认"
                @click="handleSubmit"
            />
        </view>
    </view>
</template>

<script>
    // API
    import deviceApi from '@/api/device'
    // 方法
    import { scanCode } from '@/utils'
    // 组件

    export default {
        components: {
        },
        data() {
            return {
                value: null,
                excludes: [],
                dataList: [],
                tabsData: [
                    { label: '项目备用库', value: 0, list: [] },
                    { label: '旧设备', value: 0, list: [] }
                ],
                tabActive: 0,
                loadType: 'loading',
                totalPage: 1,
                totalSize: 0,
                selectList: [],
                extendParams: {},
                publicParams: {
                    imei: '',
                    pageSize: 20,
                    pageIndex: 1,
                    // productType: '95E968C3-D1BE-4A6C-93A8-6AF62558B909',
                    productCategory: 'B16C3151-11D2-4364-8F45-63EFFFFCF424'
                }
            }
        },
        computed: {
            isSubmit() {
                return this.selectList.length > 0
            },
            searchParam() {
                let extendParams = {
                    isCarType: 1,
                    selectDeviceIds: this.excludes
                }
                let { projectId, productCode } = this.extendParams
                switch (this.tabActive) {
                case 0:
                    extendParams = {
                        ...extendParams,
                        projectId: null,
                        standbyProjectId: projectId,
                        warehousesId: '9f1d6d84-98da-4bc3-bc7c-ec299ef2b4d5',
                        typeId: 'cf946b83-9f2c-11eb-bbfa-000c29bb1337'
                    }
                    break
                case 1:
                    extendParams = {
                        ...extendParams,
                        projectId: null,
                        unitStatus: 1,
                        warehousesId: '1bba900a-26c8-492e-bd6d-1583814866c9',
                        typeId: 'cf9469fd-9f2c-11eb-bbfa-000c29bb1337'
                    }
                    break
                }
                return {
                    ...this.publicParams,
                    ...extendParams
                }
            }
        },
        onLoad(params) {
            if (params.datakey) {
                let { title, value, extendParams, excludes } = this.getNavigateData(params.datakey)
                uni.setNavigationBarTitle({ title })
                this.extendParams = {
                    ...this.extendParams,
                    ...extendParams
                }
                this.value = value
                this.excludes = excludes
                this.handleTabsChange(0)
            }
        },
        onReachBottom() {
            if (this.loadType !== 'loading') {
                if (this.searchParam.pageIndex < this.totalPage) {
                    this.searchParam.pageIndex += 1
                    this.queryList()
                }
            }
        },
        methods: {
            // 获取列表
            async queryList() {
                this.loadType = 'loading'
                try {
                    let value = this.value
                    let { pageSize, pageIndex } = this.searchParam
                    let data = await deviceApi.getList(this.searchParam)
                    data.records.forEach(item => {
                        if (item.guidId === value) {
                            item._checked = true
                            this.selectList = [item]
                        } else {
                            item._checked = false
                        }
                        this.dataList.push(item)
                    })
                    this.totalSize = data.total
                    this.totalPage = Math.ceil(data.total / pageSize)
                    if (!this.dataList.length && pageIndex === 1) {
                        this.loadType = 'empty'
                    } else if (pageIndex >= this.totalPage) {
                        this.loadType = 'maxpage'
                    } else {
                        this.loadType = 'tips'
                    }
                } catch (e) {
                    this.loadType = 'error'
                }
            },
            // 过滤列表
            handleFilter() {
                this.dataList = []
                this.searchParam.pageIndex = 1
                this.queryList()
            },
            // 点击提交按钮时触发
            handleSubmit() {
                if (this.selectList.length) {
                    let data = this.selectList[0]
                    let replaceType = [3, 2][this.tabActive]
                    if (data.isNewDevice) {
                        replaceType = 1
                    }
                    uni.$emit(this.$globalEventName['车辆维修-选择更换设备'], { data, replaceType })
                    uni.navigateBack()
                } else {
                    this.showToast('请至少选择一项！')
                }
            },
            // 点击扫码按钮时触发
            async handleScanCode() {
                let data = await scanCode()
                this.publicParams.imei = data
                this.handleFilter()
            },
            // 选项卡切换时触发
            handleTabsChange(index) {
                this.tabActive = index
                this.handleFilter()
            },
            // 点击列表行时触发
            handleCheckChange(data) {
                this.dataList.forEach(item => {
                    item._checked = false
                })
                data._checked = true
                this.selectList = [data]
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
}
.list-wrap {
    padding: 30rpx 30rpx 0 0;
    .item {
        display: flex;
        & + .item {
            margin-top: 15rpx;
        }
        .checkbox{
            display: flex;
            align-items: center;
            padding: 0 30rpx;
        }
        .item-wrap {
            flex: 1;
            display: flex;
            align-items: center;
            height: 72rpx;
            background: #fff;
            box-shadow: 0 2rpx 7rpx 0 rgba(228, 227, 227, 0.5);
            border-radius: 14rpx;
            padding: 0 30rpx;
            &.checked {
                color: #fff;
                background: #0001ae;
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
</style>
