<template>
    <view class="content">
        <view
            :class="{
                active: headbarActive || filterPopover.visible
            }"
            class="head-wrap"
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
                <view class="filter-button iconfont iconshaixuanqi" @tap="filterPopover.visible = !filterPopover.visible" />
            </view>
        </view>
        <view style="height: 132rpx" />
        <view class="public-approval-list">
            <view
                v-for="(item, index) in dataList"
                :key="index"
                class="item"
                @tap="handleGotoDetail(item)"
            >
                <view class="flex">
                    <view class="label">申请单号：</view>
                    <view class="value folded f1">{{ getViewProp(item, 'code') }}</view>
                    <view
                        :style="{color: getDictProp(item.approvalStatus, 'documentStatus', 'color')}"
                        class="status"
                    >
                        {{ item.approvalStatus | getDictProp('documentStatus') }}
                    </view>
                </view>
                <view class="flex slenderBorderTop">
                    <view class="label">提交人：</view>
                    <view class="value folded f1">{{ item.applyUserName }}</view>
                </view>
                <view class="flex slenderBorderTop">
                    <view class="label">提交时间：</view>
                    <view class="value folded f1">{{ item.applyDate | dateFormat }}</view>
                </view>
            </view>
        </view>
        <sy-load-more :type="loadType" />
        <!-- 筛选弹出层 -->
        <sy-popover
            v-model="filterPopover.content"
            :visible="filterPopover.visible"
            :styles="{top: '128rpx'}"
            position="top"
            mask-color="rgba(0,0,0,.4)"
            @masktap="filterPopover.visible = false"
        >
            <view v-if="filterPopover.content" class="filter-popover">
                <view class="body-wrap">
                    <sy-form-config
                        label-width=""
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
    import approvalApi from '@/api/approval'
    // 方法
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
                        type: 0,
                        selectType: 0,
                        pageSize: 10,
                        pageIndex: 1
                    },
                    items: [
                        [
                            {
                                type: 'pickerDate',
                                name: 'applyDate',
                                label: '日期',
                                align: 'left',
                                column: true,
                                props: {
                                    mode: 'range',
                                    separator: ' 至 ',
                                    placeholder: '选择提交日期范围'
                                }
                            },
                            {
                                type: 'input',
                                name: 'applyUserName',
                                label: '提交人',
                                column: true,
                                showLabel: true,
                                align: 'left'
                            },
                            {
                                type: 'radio',
                                name: 'approvalStatus',
                                label: '单据状态',
                                column: true,
                                visible: true,
                                showLabel: true,
                                align: 'left',
                                props: {
                                    button: true,
                                    isCancel: true,
                                    options: enums.documentStatus.filter(v => v.value < 4)
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
                headbarActive: false
            }
        },
        provide() {
            return {
                provideComponent: this
            }
        },
        onLoad(params) {
            Object.assign(this.filterConfig.data, {
                type: Number(params.type),
                selectType: Number(params.selectType)
            })
            if (this.filterConfig.data.selectType === 0) {
                this.findFormConfigItem(this.filterConfig.items, 'approvalStatus').visible = false
            }
            this.queryList()
            uni.$on(this.$globalEventName['审批列表更新'], this.handleFilter)
        },
        onUnload() {
            uni.$off(this.$globalEventName['审批列表更新'], this.handleFilter)
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
            // 获取审批数量
            async queryList() {
                this.loadType = 'loading'
                try {
                    let { pageSize, pageIndex } = this.filterConfig.data
                    let data = await approvalApi.getList(this.filterConfig.data)
                    data.records.forEach(item => {
                        // 销售合同
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
            getViewProp(data, name) {
                if (this.filterConfig.data.type === 12) {
                    switch (name) {
                    case 'code':
                        return data.contractCode
                    case 'guidId':
                        return data.contractId
                    }
                }
                return data[name]
            },
            // 过滤列表
            handleFilter() {
                this.dataList = []
                this.filterConfig.data.pageIndex = 1
                this.queryList()
            },
            // 跳转到审批单详情
            handleGotoDetail(data) {
                try {
                    let { type, selectType } = this.filterConfig.data
                    let name = enums.approvalType.find(v => v.type === type).name
                    let params = {
                        dataId: this.getViewProp(data, 'guidId'),
                        canHandle: selectType === 0
                    }
                    uni.navigateTo({
                        url: `/pages/approval/${name}/detail?jsonData=${JSON.stringify(params)}`
                    })
                } catch (err) {
                    console.error(err)
                }
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
.head-wrap{
    position: fixed;
    left: 0;
    right: 0;
    top: var(--window-top);
    z-index: 50;
    background: #F9FAFD;
    transition: .1s ease-in-out;
    &.active {
        background: #fff;
        box-shadow: 0 2rpx 7rpx 0 rgba(228, 227, 227, 0.5);
        .search-wrap .filter-button {
            color: #0001AE;
        }
    }
    .search-wrap {
        display: flex;
        align-items: center;
        padding: 30rpx 0 30rpx 30rpx;
        .search-input {
            flex: 1;
            background: #EFEFF4;
            border-radius: 35rpx;
            padding: 0 30rpx;
            transition: background .3s ease-in-out;
        }
        .filter-button {
            height: 70rpx;
            line-height: 70rpx;
            padding: 0 30rpx;
            font-size: 36rpx;
            color: #999;
        }
    }
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
