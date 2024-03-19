<template>
    <view class="content">
        <view class="head-wrap">
            <view class="search-wrap">
                <view class="search-input">
                    <sy-input
                        v-model="keyword"
                        clearable
                        placeholder="请输入人员名称进行搜索"
                        prefix-icon="sy-ui-icon-search"
                        confirm-type="search"
                        @change="handleFilter"
                    />
                </view>
            </view>
        </view>
        <view style="height: 130rpx" />
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
                    {{ item[viewProp] }}
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
    import resourceApi from '@/api/resource'
    // 方法
    // 组件

    export default {
        components: {
        },
        data() {
            return {
                value: null,
                keyword: '',
                viewProp: 'userName',
                valueProp: 'userId',
                searchProp: 'userName',
                excludes: [],
                dataList: [],
                loadType: 'loading',
                totalPage: 1,
                totalSize: 0,
                selectList: [],
                extendParams: {},
                publicParams: {
                    pageSize: 20,
                    pageIndex: 1
                }
            }
        },
        computed: {
            isSubmit() {
                return this.selectList.length > 0
            },
            searchParam() {
                let extendParams = {
                    ...this.extendParams,
                    [this.searchProp]: this.keyword,
                    selectDeviceIds: this.excludes
                }
                return {
                    ...this.publicParams,
                    ...extendParams
                }
            }
        },
        onLoad(params) {
            if (params.datakey) {
                let {
                    title,
                    value,
                    excludes,
                    viewProp,
                    valueProp,
                    searchProp,
                    extendParams,
                    customRequestApi
                } = this.getNavigateData(params.datakey)
                uni.setNavigationBarTitle({ title })
                this.extendParams = {
                    ...this.extendParams,
                    ...extendParams
                }
                this.value = value
                this.excludes = excludes
                this.viewProp = viewProp || this.viewProp
                this.valueProp = valueProp || this.valueProp
                this.searchProp = searchProp || this.searchProp
                this.customRequestApi = customRequestApi
                this.handleFilter()
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
                    let data
                    let value = this.value
                    let { pageSize, pageIndex } = this.searchParam
                    if (this.customRequestApi) {
                        data = await this.customRequestApi(this.searchParam)
                    } else {
                        data = await resourceApi.getPeopleList(this.searchParam)
                    }
                    data.records.forEach(item => {
                        if (item[this.valueProp] === value) {
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
                    uni.navigateBack()
                    setTimeout(() => {
                        uni.$emit(this.$globalEventName['选择人员'], this.selectList)
                    }, 500)
                } else {
                    this.showToast('请至少选择一项！')
                }
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
        padding: 30rpx;
        .search-input {
            flex: 1;
            background: #EFEFF4;
            border-radius: 35rpx;
            padding: 0 30rpx;
            transition: background .3s ease-in-out;
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
