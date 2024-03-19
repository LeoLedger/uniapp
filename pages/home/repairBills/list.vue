<template>
    <view class="content">
        <view
            :class="{active: headbarActive || filterPopover.visible}"
            class="public-filter-head"
        >
            <view class="search-wrap">
                <view class="search-input">
                    <sy-input
                        v-model="filterConfig.data.code"
                        :popover-hidden-after-display="false"
                        clearable
                        placeholder="请输入单号搜索"
                        prefix-icon="sy-ui-icon-search"
                        @clear="handleFilter"
                        @confirm="handleFilter"
                    />
                </view>
                <view class="filter-button">
                    <view
                        :class="{active: filterPopover.visible}"
                        class="button iconfont iconshaixuanqi"
                        @click="filterPopover.visible = !filterPopover.visible"
                    />
                </view>
            </view>
        </view>
        <view style="height: 132rpx" />
        <view class="list-wrap">
            <uni-swipe-action>
                <view
                    v-for="(item, index) in dataList"
                    :key="index"
                    class="item"
                >
                    <uni-swipe-action-item :disabled="!checkFeature('ty.iot.bills.allocate')">
                        <view class="item-wrap" @tap="handleGotoHandle(item)">
                            <view :data-status="item.status" class="head slenderBorderBottom">
                                <view class="title">{{ item.code }}</view>
                                <view class="status">{{ item.status | getDictProp('billsStatus') }}</view>
                            </view>
                            <view class="foot">
                                <view class="rows">
                                    <view>报修数量：{{ item.count }}</view>
                                    <view>报修时间：{{ item.createTime | dateFormat }}</view>
                                </view>
                                <view class="rows">
                                    <view class="folded f1">分派人员：{{ item.assignName || '- -' }}</view>
                                </view>
                                <view v-if="item.remark" class="rows">
                                    <view>备注：{{ item.remark || '- -' }}</view>
                                </view>
                            </view>
                        </view>
                        <template v-slot:right>
                            <view class="flex">
                                <sy-button
                                    :styles="{
                                        height: '56rpx',
                                        margin: '0 0 0 20rpx',
                                        padding: '0 20rpx',
                                        fontSize: '24rpx',
                                        borderRadius: '12rpx',
                                    }"
                                    type="success"
                                    text="分派"
                                    @click="handleAllocate(item)"
                                />
                            </view>
                        </template>
                    </uni-swipe-action-item>
                </view>
            </uni-swipe-action>
            <sy-load-more :type="loadType" />
        </view>
        <!-- 筛选弹出层 -->
        <sy-popover
            v-model="filterPopover.content"
            :visible="filterPopover.visible"
            :styles="{top: '128rpx'}"
            position="top"
            mask-color="rgba(0,0,0,.4)"
            @masktap="filterPopover.visible = false"
        >
            <view v-if="filterPopover.content" class="public-filter-popover">
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
    import { mapState } from 'vuex'
    import enums from '@/utils/enum'
    // 组件

    export default {
        components: {
        },
        data() {
            return {
                dataList: [],
                loadType: 'loading',
                totalPage: 1,
                totalSize: 0,
                filterConfig: {
                    data: {
                        status: 'ing',
                        filterOwin: true,
                        pageSize: 20,
                        pageIndex: 1
                    },
                    items: [
                        [
                            {
                                type: 'pickerDate',
                                name: 'createTime',
                                label: '日期',
                                align: 'left',
                                column: true,
                                props: {
                                    mode: 'range',
                                    separator: ' 至 ',
                                    placeholder: '选择日期范围'
                                }
                            },
                            {
                                type: 'radio',
                                name: 'type',
                                label: '按类型',
                                column: true,
                                showLabel: true,
                                align: 'left',
                                props: {
                                    button: true,
                                    isCancel: true,
                                    options: enums.billsType
                                }
                            },
                            {
                                type: 'radio',
                                name: 'status',
                                label: '按状态',
                                column: true,
                                showLabel: true,
                                align: 'left',
                                props: {
                                    button: true,
                                    isCancel: true,
                                    options: enums.billsStatus
                                }
                            }
                        ]
                    ],
                    button: [
                        { text: '取消', name: 'cancel' },
                        { text: '确定', type: 'primary', name: 'submit' }
                    ]
                },
                filterPopover: {
                    content: false,
                    visible: false
                },
                billsStatus: enums.billsStatus,
                headbarActive: false
            }
        },
        provide() {
            return {
                provideComponent: this
            }
        },
        onShow() {
        },
        onLoad() {
            this.queryList()
            uni.$on(this.$globalEventName['维修单列表更新'], this.handleFilter)
            uni.$on(this.$globalEventName['选择人员'], this.handlePeopleChange)
        },
        computed: {
            ...mapState(['userInfo'])
        },
        onUnload() {
            uni.$off(this.$globalEventName['维修单列表更新'], this.handleFilter)
            uni.$off(this.$globalEventName['选择人员'], this.handlePeopleChange)
        },
        onPageScroll(e) {
            if (!this.filterPopover.visible) {
                this.headbarActive = e.scrollTop > 0
            }
        },
        onReachBottom() {
            if (this.loadType !== 'loading') {
                if (this.filterConfig.data.pageIndex < this.totalPage) {
                    this.filterConfig.data.pageIndex += 1
                    this.queryList()
                }
            }
        },
        methods: {
            // 获取列表
            async queryList() {
                this.loadType = 'loading'
                try {
                    let { pageSize, pageIndex } = this.filterConfig.data
                    var data = await repairBillsApi.getList(this.filterConfig.data)
                    data.records.forEach(item => {
                        this.dataList.push(item)
                    })
                    this.totalSize = data.total
                    this.totalPage = Math.ceil(data.total / pageSize)
                    if (!data.records.length && pageIndex === 1) {
                        this.loadType = 'empty'
                    } else if (pageIndex >= this.totalPage) {
                        this.loadType = 'maxpage'
                    } else {
                        this.loadType = 'tips'
                    }
                } catch (e) {
                    console.log(e)
                    this.loadType = 'error'
                }
            },
            // 过滤列表
            handleFilter() {
                this.dataList = []
                this.filterConfig.data.pageIndex = 1
                this.queryList()
            },
            // 点击分派按钮时触发
            handleAllocate(data) {
                this.activeRowData = data
                let { deptId, isAdmin } = this.userInfo
                this.navigateToData('/pages/common/selectPeople', {
                    title: '选择人员',
                    value: data.replaceCardId,
                    extendParams: {
                        deptId: isAdmin ? '' : deptId
                    }
                })
            },
            // 跳转到详情页面
            handleGotoHandle(data) {
                switch (data.type) {
                case 'express':
                    uni.navigateTo({
                        url: `/pages/home/repairBills/people/handle?id=${data.guidId}`
                    })
                    break
                case 'fault':
                    uni.navigateTo({
                        url: `/pages/home/repairBills/vehicle/handle?id=${data.guidId}`
                    })
                    break
                }
            },
            // 选择人员后触发
            async handlePeopleChange([data]) {
                this.showLoading()
                try {
                    let { code, type } = this.activeRowData
                    await repairBillsApi.allocate({
                        code,
                        type,
                        assignId: data.userId,
                        assignName: data.userName
                    })
                    this.$set(this.activeRowData, 'assignName', data.userName)
                } catch (err) {
                    console.error(err)
                }
                uni.hideLoading()
            },
            // 点击筛选弹出框按钮时触发
            handleFilterButton(name) {
                if (name === 'submit') {
                    this.handleFilter()
                }
                this.filterPopover.visible = false
            }
        }
    }
</script>

<style lang="scss" scoped>
.list-wrap {
    padding: 0 30rpx;
    .item {
        border-radius: 14rpx;
        & + .item {
            margin-top: 15rpx;
        }
        .item-wrap {
            background: #fff;
            box-shadow: 0 2rpx 7rpx 0 rgba(228, 227, 227, 0.5);
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
            &[data-status = ing] {
                ::before {
                    background: #0001AE;
                }
                .status {
                    background: linear-gradient(270deg, #0001AE 0%, #5B2B90 100%);
                }
            }
            ::before {
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
        .foot {
            padding: 12rpx 30rpx;
            .rows {
                display: flex;
                align-items: center;
                justify-content: space-between;
                color: #999;
                font-size: 24rpx;
                & + .rows {
                    margin-top: 4rpx;
                }
            }
        }
    }
}
</style>
