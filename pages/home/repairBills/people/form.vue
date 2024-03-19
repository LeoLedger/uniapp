<template>
    <view class="content">
        <view class="info-wrap">
            <view class="item">
                <view class="label">IEMI：</view>
                <view class="value">{{ formConfig.data.imei || formConfig.data.tempImei }}</view>
                <sy-button
                    v-if="isFillDevice"
                    :styles="{
                        height: '46rpx',
                        minWidth: '100rpx',
                        fontSize: '26rpx'
                    }"
                    text="补"
                    type="primary"
                    @click="handleFillUpDevice"
                />
            </view>
            <view class="item slenderBorderTop">
                <view class="label">反馈异常：</view>
                <view class="value">{{ formConfig.data.clientFeedback || '- -' }}</view>
            </view>
            <view class="item slenderBorderTop">
                <view class="label">是否为二次返修：</view>
                <view class="value">{{ formConfig.data.secondRepair | getDictProp('isSecondRepair') }}</view>
            </view>
        </view>
        <sy-form-config
            ref="FormConfig"
            :style-type="isEdit ? 'form' : 'readonly'"
            @change="handleFormChange"
            @pickerUrlClick="handlePickerUrlClick"
        />
        <template v-if="isEdit">
            <view style="height: 128rpx" />
            <view class="foot-wrap">
                <sy-button
                    type="primary"
                    text="保存"
                    @click="handleSubmit"
                />
            </view>
        </template>
    </view>
</template>

<script>
    // API
    import deviceApi from '@/api/device'
    import resourceApi from '@/api/resource'
    import repairBillsApi from '@/api/repairBills'
    // 方法
    // 组件

    export default {
        components: {
        },
        data() {
            return {
                isEdit: true,
                formConfig: {
                    data: {},
                    items: [
                        [
                            {
                                type: 'picker',
                                name: 'factoryFeedback',
                                label: '诊断结果',
                                validate: [
                                    { required: true, message: '诊断结果不能为空' }
                                ],
                                props: {
                                    mode: 'selector',
                                    options: [],
                                    allowCreate: true,
                                    createPlaceholder: '请输入诊断结果'
                                }
                            }
                        ],
                        [
                            {
                                type: 'textarea',
                                name: 'factoryHandlingWay',
                                label: '维修处理方式',
                                align: 'left',
                                validate: [
                                    { required: true, message: '处理方式不能为空' }
                                ],
                                props: {
                                    maxlength: 100,
                                    placeholder: '请填写维修处理方式（100字以内…）'
                                }
                            }
                        ],
                        [
                            {
                                type: 'switch',
                                name: 'isReplaceCard',
                                label: '是否更换SIM卡',
                                props: {
                                    trueValue: 1,
                                    falseValue: 0
                                }
                            },
                            {
                                type: 'pickerUrl',
                                name: 'replaceCardNumber',
                                label: '更换的SIM卡号',
                                expandProps: {
                                    replaceCardId: 'replaceCardId'
                                },
                                validate: [
                                    {
                                        required: true,
                                        message: '更换的SIM卡号不能为空',
                                        premise: [
                                            { name: 'isReplaceCard', includes: [1] }
                                        ]
                                    }
                                ],
                                premise: [
                                    { type: 'visible', name: 'isReplaceCard', includes: [1] }
                                ]
                            }
                        ],
                        [
                            {
                                type: 'input',
                                name: 'totalCost',
                                label: '维修费（元）',
                                expandProps: {
                                    secondRepair: 'secondRepair'
                                },
                                validate: [
                                    { required: true, message: '维修费不能为空' }
                                ],
                                premise: [
                                    { type: 'visible', name: 'secondRepair', excludes: [1] }
                                ],
                                props: {
                                    type: 'digit',
                                    quickInput: [0]
                                }
                            }
                        ],
                        [
                            {
                                type: 'upload',
                                name: 'files',
                                label: ''
                            }
                        ]
                    ],
                    button: false
                },
                isFillDevice: false,
                canEditProps: [],
                extendParams: {}
            }
        },
        provide() {
            return {
                provideComponent: this
            }
        },
        onShow() {
        },
        onLoad(params) {
            if (params.datakey) {
                let { data, isEdit, billId, excludes } = this.getNavigateData(params.datakey)
                this.formConfig.data = {
                    ...this.formConfig.data,
                    ...data,
                    files: data.files || []
                }
                this.isEdit = isEdit
                this.extendParams = {
                    billId,
                    excludes
                }
                this.isFillDevice = data.imeiUnidentified === 0 && !data.deviceId
                this.queryBaseInfo()
            }
            uni.$on(this.$globalEventName['选择设备'], this.handleDeviceUpdate)
        },
        onUnload() {
            uni.$off(this.$globalEventName['选择设备'], this.handleDeviceUpdate)
        },
        methods: {
            // 获取基础信息
            async queryBaseInfo() {
                if (!this.isEdit) {
                    this.showLoading('加载中')
                    let files = await repairBillsApi.getPeopleDeviceFiles({ guid: this.formConfig.data.guidId })
                    this.formConfig.data.files = files
                }
                await this.queryHistoryData()
                uni.hideLoading()
            },
            // 获取产品诊断历史记录
            async queryHistoryData() {
                var { productId, factoryFeedback } = this.formConfig.data
                var data = await resourceApi.getProductLanguages({
                    type: 3,
                    productId
                })
                var options = []
                if (Array.isArray(data[productId])) {
                    options = data[productId].map(item => {
                        return {
                            label: item,
                            value: item
                        }
                    })
                }
                if (!this.isEmpty(factoryFeedback) && options.findIndex(v => v.value === factoryFeedback) === -1) {
                    options.splice(0, 0, {
                        label: factoryFeedback,
                        value: factoryFeedback
                    })
                }
                this.$set(this.findFormConfigItem(this.formConfig.items, 'factoryFeedback').props, 'options', options)
            },
            // 点击提交按钮时触发
            handleSubmit() {
                let formData = this.formConfig.data
                if (this.isFillDevice && this.isEmpty(formData.deviceId)) {
                    return this.showToast('请补填imei信息')
                }
                if (this.$refs.FormConfig.validate()) {
                    uni.$emit(this.$globalEventName['维修单设备更新'], {
                        ...formData,
                        _flag: 1,
                        fileNum: (formData.files || []).length
                    })
                    uni.navigateBack()
                }
            },
            // 表单改变时触发
            handleFormChange({ name }) {
                switch (name) {
                case 'isReplaceCard':
                    this.formConfig.data.replaceCardId = null
                    this.formConfig.data.replaceCardNumber = null
                    break
                }
            },
            // 点击pickerUrl组件时触发
            handlePickerUrlClick({ name }) {
                let { billId, excludes } = this.extendParams
                switch (name) {
                case 'replaceCardNumber':
                    this.selectType = 1
                    this.navigateToData('/pages/common/selectDevice', {
                        title: '选择更换SIM卡',
                        value: this.formConfig.data.replaceCardId,
                        viewProp: 'sim',
                        searchProp: 'sim',
                        excludes,
                        customRequestApi: deviceApi.getSimList,
                        extendParams: {
                            expressId: billId
                        }
                    })
                    break
                }
            },
            // 选择设备后触发
            handleDeviceUpdate([data]) {
                let formData = this.formConfig.data
                switch (this.selectType) {
                case 1:
                    // 替换sim卡
                    formData.replaceCardId = data.guidId
                    formData.replaceCardNumber = data.sim
                    break
                case 2:
                    // 补填设备
                    this.formData.imei = data.imei
                    this.formData.deviceId = data.guidId
                    break
                }
            },
            // 点击选择补选设备按钮时触发
            handleFillUpDevice() {
                let data = this.formConfig.data
                this.selectType = 2
                this.navigateToData('/pages/common/selectDevice', {
                    title: '选择补填设备',
                    value: data.deviceId,
                    extendParams: {
                        warehousesId: 'bc5fe3a9-5b92-4aad-b7fe-acc62dcc82de',
                        typeId: 'cf946c33-9f2c-11eb-bbfa-000c29bb1337',
                        sectionId: data.sectionId,
                        productType: '288F8C2D-9CEB-46FC-87C9-DC4C16108162', // 人员智能设备
                        productCategory: 'B16C3151-11D2-4364-8F45-63EFFFFCF424' // 智能设备
                    }
                })
            }
        }
    }
</script>

<style lang="scss" scoped>
.content {
    padding: 30rpx 0;
}
.info-wrap {
    background: #fff;
    border-radius: 30rpx;
    padding: 0 30rpx;
    margin: 0 30rpx 26rpx;
    .item {
        display: flex;
        padding: 10rpx 0;
        line-height: 40rpx;
        .label {
            padding: 14rpx 0;
        }
        .value {
            flex: 1;
            padding: 14rpx 0;
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
