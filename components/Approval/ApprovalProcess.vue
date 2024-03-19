<template>
    <view class="approval-process">
        <sy-load-more :type="loadType"/>
        <view
            :class="{line: showLine}"
            class="process-list"
        >
            <view v-for="(item, index) in dataList" :key="index" class="item sy-ui-border-bottom">
                <view class="head-wrap flex">
                    <view
                        class="title"
                        @click="handleExpand(item)"
                    >
                        {{ item.activityName }}
                    </view>
                    <template v-if="!['提交', '结束环节'].includes(item.activityName)">
                        <view
                            class="role"
                            @click="handleShowUserList(item)"
                        >
                            【{{ item.receiveObjectName }}】
                        </view>
                        <view
                            v-if="index !== lastIndex"
                            :style="{color: item._statusColor, borderColor: item._statusColor}"
                            class="status"
                        >
                            {{ item._statusText }}
                        </view>
                    </template>
                </view>
                <template v-if="item._expand && index !== lastIndex">
                    <view class="body-wrap sy-ui-border-top">
                        <view class="content">{{ item.content || '- -' }}</view>
                        <view
                            v-if="item.files && item.files.length"
                            class="file-list"
                        >
                            <sy-upload
                                :file-list="item.files"
                                round
                                readonly
                            />
                        </view>
                    </view>
                    <view class="foot-wrap sy-ui-border-top flex">
                        <view class="name">{{ item.operatorName }}</view>
                        <view class="date">审批于：{{ item.finishedDate | dateFormat }}</view>
                    </view>
                </template>
            </view>
        </view>
        <sy-popover
            v-model="userListDialog.content"
            :visible="userListDialog.visible"
            :styles="{zIndex: 500}"
            position="center"
            mask-color="rgba(0,0,0,.4)"
            @masktap="userListDialog.visible = false"
        >
            <view v-if="userListDialog.content" class="user-popover">
                <view class="title sy-ui-border-bottom">{{ userListDialog.title }}</view>
                <view class="user-list">
                    <view
                        v-for="(item, index) in userListDialog.list"
                        :key="index"
                        class="item"
                    >
                        <view class="text">{{ item }}</view>
                    </view>
                </view>
                <sy-load-more :type="userListDialog.loadType"/>
            </view>
        </sy-popover>
    </view>
</template>

<script>
    // API
    import workFlowApi from '@/api/workFlow'
    import resourceApi from '@/api/resource'
    // 方法
    import enums from '@/utils/enum'

    export default {
        name: 'ApprovalProcess',
        components: {},
        props: {
            wfInstId: String
        },
        data() {
            return {
                loadType: 'loading',
                dataList: [],
                userListDialog: {
                    list: [],
                    content: false,
                    visible: false,
                    loadType: 'loading'
                }
            }
        },
        computed: {
            lastIndex() {
                return this.dataList.length - 1
            },
            showLine() {
                return this.dataList.length > 1
            }
        },
        watch: {
            wfInstId() {
                this.queryDataList()
            }
        },
        mounted() {
            this.queryDataList()
        },
        methods: {
            // 获取流程数据
            async queryDataList() {
                if (this.wfInstId) {
                    this.loadType = 'loading'
                    let data = await workFlowApi.getFlow({
                        wfInstId: this.wfInstId
                    })
                    this.dataList = data.map(item => {
                        var config = enums.approvalStatus.find(v => v.value === item.handlerStatus)
                        item._statusText = config.label
                        item._statusColor = config.color
                        item._expand = true
                        return item
                    })
                    this.loadType = this.dataList.length ? 'hide' : 'empty'
                    this.$emit('update', Number(this.dataList.slice(-1)[0].definitionCode))
                }
            },
            handleExpand(data) {
                data._expand = !data._expand
            },
            // 查看审批对象下用户列表
            async handleShowUserList(data) {
                if ([100603, 100602].includes(data.receiveTypeId)) {
                    this.userListDialog = {
                        list: [],
                        title: data.receiveObjectName,
                        visible: true,
                        content: true,
                        loadType: 'loading'
                    }
                    let res
                    try {
                        switch (data.receiveTypeId) {
                        case 100603:
                            // 部门
                            res = await resourceApi.getDeptUser({
                                deptId: data.receiveObjectId,
                                pageIndex: -1
                            })
                            break
                        case 100602:
                            // 角色
                            res = await resourceApi.getRoleUser({
                                roleId: data.receiveObjectId,
                                pageIndex: -1
                            })
                            break
                        }
                    } catch (err) {
                        console.error(err)
                    }
                    this.userListDialog = {
                        list: res.records.map(v => v.userName),
                        title: data.receiveObjectName,
                        visible: true,
                        content: true,
                        loadType: res.records.length ? 'hide' : 'empty'
                    }
                }
            }
        }
    }
</script>

<style lang="scss" scoped>
.approval-process {
    .process-list {
        position: relative;
        background: #fff;
        border-radius: 40rpx;
        padding: 0 30rpx 0 94rpx;
        &.line {
            &::before {
                content: '';
                position: absolute;
                top: 66rpx;
                left: 48rpx;
                bottom: 66rpx;
                width: 1px;
                background:-webkit-gradient(linear, 0 0, 0 95%, from($APP_COLOR), to(#FFF));
            }
        }
        .item {
            position: relative;
            z-index: 2;
            &::before {
                content: '\e6ac';
                position: absolute;
                top: 28rpx;
                left: -64rpx;
                font-family: 'iconfont';
                color: $APP_COLOR;
                font-size: 36rpx;
                background: #fff;
            }
            .head-wrap {
                height: 94rpx;
                .title {
                    flex: 1;
                    color: $APP_COLOR;
                    font-size: 30rpx;
                    font-weight: bold;
                }
                .role {
                    color: #999;
                    font-size: 26rpx;
                    margin: 0 10rpx;
                }
                .status {
                    font-size: 26rpx;
                    border-radius: 22rpx;
                    min-width: 120rpx;
                    height: 44rpx;
                    line-height: 44rpx;
                    text-align: center;
                    border: solid 1px #fff;
                }
            }
            .body-wrap {
                padding: 26rpx 0;
                .content {
                    font-size: 26rpx;
                }
                .file-list {
                    margin-top: 26rpx;
                }
            }
            .foot-wrap {
                height: 90rpx;
                color: #999;
                font-size: 26rpx;
                .date {
                    flex: 1;
                    text-align: right;
                }
            }
        }
    }
    .user-popover {
        width: 80vw;
        background: #fff;
        border-radius: 40rpx;
        padding: 0 30rpx 40rpx;
        .title {
            font-size: 34rpx;
            font-weight: bold;
            text-align: center;
            line-height: 90rpx;
        }
        .user-list {
            display: flex;
            flex-wrap: wrap;
            padding-top: 30rpx;
            max-height: 50vh;
            overflow: auto;
            .item {
                padding: 10rpx;
                .text {
                    color: #666;
                    font-size: 26rpx;
                    min-width: 80rpx;
                    line-height: 46rpx;
                    padding: 0 20rpx;
                    border: solid 1px #c7c7c7;
                    border-radius: 23rpx;
                    text-align: center;
                }
            }
        }
    }
}
</style>

