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
                        placeholder="请输入关键词进行搜索"
                        prefix-icon="sy-ui-icon-search"
                        @change="handleFilter"
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
            <view
                v-for="(item, index) in dataList"
                :key="index"
                :data-status="item._status"
                class="item"
                @tap="handleGotoHandle(item)"
            >
                <view class="head slenderBorderBottom">
                    <view class="title">{{ item.code }}</view>
                    <view class="status">{{ item._status | getDictProp(installStatus) }}</view>
                </view>
                <view class="foot">
                    <view>已安装：{{ item.completeCount || 0 }}/{{ item.count || 0 }}</view>
                    <view>报装时间：{{ item.startDate | dateFormat('YYYY-MM-DD') }} 至 {{ item.endDate | dateFormat('YYYY-MM-DD') }}</view>
                </view>
            </view>
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
    import installRegisterApi from '@/api/installRegister'
    // 方法
    import enums from '@/utils/enum'
    // 组件

    export default {
        components: {
        },
        data() {
            const installStatus = [
                { label: '待安装', value: 0 },
                { label: '已完成', value: 9 }
            ]
            return {
                dataList: [],
                loadType: 'loading',
                totalPage: 1,
                totalSize: 0,
                // 安装状态
                installStatus,
                filterConfig: {
                    data: {
                        pageSize: 20,
                        pageIndex: 1,
                        filterOwin: true
                    },
                    items: [
                        [
                            {
                                type: 'pickerDate',
                                name: 'planTime',
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
                                name: 'status',
                                label: '按状态',
                                column: true,
                                showLabel: true,
                                align: 'left',
                                props: {
                                    button: true,
                                    isCancel: true,
                                    options: installStatus
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
            uni.$on(this.$globalEventName['设备安装-单据列表更新'], this.handleFilter)
        },
        onUnload() {
            uni.$off(this.$globalEventName['设备安装-单据列表更新'], this.handleFilter)
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
                    let data = await installRegisterApi.billsList(this.filterConfig.data)
                    data.records.forEach(item => {
                        item.count = item.count || 0
                        item.completeCount = item.completeCount || 0
                        item._status = item.status
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
                this.filterConfig.data.pageIndex = 1
                this.queryList()
            },
            // 跳转到详情页面
            handleGotoHandle(data) {
                uni.navigateTo({
                    url: '/pages/home/installRegister/handle?id=' + data.guidId
                })
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
            .head {
                ::before {
                    background: #0001AE;
                }
                .status {
                    background: linear-gradient(270deg, #0001AE 0%, #5B2B90 100%);
                }
            }
        }
        .head {
            position: relative;
            display: flex;
            align-items: center;
            padding: 0 30rpx;
            height: 72rpx;
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
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 30rpx;
            height: 64rpx;
            color: #999;
            font-size: 24rpx;
        }
    }
}
</style>
