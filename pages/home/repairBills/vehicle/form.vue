<template>
    <view class="content">
        <view class="info-wrap">
            <view class="item">
                <view class="label">IEMI：</view>
                <view class="value">{{ formConfig.data.imei }}</view>
            </view>
            <view class="item slenderBorderTop">
                <view class="label">反馈异常：</view>
                <view class="value">{{ formConfig.data.feedback || '- -' }}</view>
            </view>
            <view class="item slenderBorderTop">
                <view class="label">所属企业：</view>
                <view class="value">{{ formConfig.data.customerName || '- -' }}</view>
            </view>
            <view class="item slenderBorderTop">
                <view class="label">所属标段：</view>
                <view class="value">{{ formConfig.data.sectionName || '- -' }}</view>
            </view>
            <view class="item slenderBorderTop">
                <view class="label">车牌号：</view>
                <view class="value">{{ formConfig.data.carNumber || '- -' }}</view>
            </view>
        </view>
        <sy-form-config
            ref="FormConfig"
            :style-type="isEdit ? 'form' : 'readonly'"
            @change="handleFormChange"
            @inputBlur="handleInputBlur"
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
    import enums from '@/utils/enum'
    import rigorous from '@/utils/rigorous'
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
                                    allowCreate: true
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
                                name: 'isReplaceDevice',
                                label: '是否更换设备'
                            },
                            {
                                type: 'pickerUrl',
                                name: 'replaceImei',
                                label: '更换的设备编号',
                                expandProps: {
                                    replaceType: 'replaceType',
                                    replaceDeviceId: 'replaceDeviceId'
                                },
                                validate: [
                                    {
                                        required: true,
                                        message: '更换的设备编号不能为空',
                                        premise: [
                                            { name: 'isReplaceDevice', includes: [true] }
                                        ]
                                    }
                                ],
                                premise: [
                                    { type: 'visible', name: 'isReplaceDevice', includes: [true] }
                                ]
                            }
                        ],
                        [
                            {
                                type: 'switch',
                                name: 'isReplaceCard',
                                label: '是否更换SIM卡'
                            },
                            {
                                type: 'pickerUrl',
                                name: 'replaceSim',
                                label: '更换的SIM卡号',
                                validate: [
                                    {
                                        required: true,
                                        message: '更换的SIM卡号不能为空',
                                        premise: [
                                            { name: 'isReplaceCard', includes: [true] }
                                        ]
                                    }
                                ],
                                premise: [
                                    { type: 'visible', name: 'isReplaceCard', includes: [true] }
                                ]
                            }
                        ],
                        [
                            {
                                mode: 'selector',
                                type: 'picker',
                                name: 'handlingWay',
                                label: '处理方式',
                                validate: [
                                    { required: true, message: '请选择处理方式' }
                                ],
                                props: {
                                    options: enums.vehicleHandlingWay
                                }
                            }
                        ],
                        [
                            {
                                type: 'input',
                                name: 'labourCost',
                                label: '人工费（元）',
                                validate: [
                                    { required: true, message: '人工费不能为空' }
                                ],
                                props: {
                                    type: 'digit',
                                    quickInput: [0]
                                }
                            },
                            {
                                type: 'input',
                                name: 'cost',
                                label: '维修费（元）',
                                expandProps: {
                                    companyBearCost: 'companyBearCost',
                                    enterpriseBearCost: 'enterpriseBearCost'
                                },
                                validate: [
                                    { required: true, message: '维修费不能为空' }
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
                                label: '附件'
                            }
                        ]
                    ],
                    button: false
                },
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
                let { data, isEdit, billId, excludeSim, excludeDevice } = this.getNavigateData(params.datakey)
                this.formConfig.data = {
                    ...this.formConfig.data,
                    ...data,
                    files: data.files || []
                }
                this.isEdit = isEdit
                this.extendParams = {
                    billId,
                    excludeSim,
                    excludeDevice
                }
                this.queryBaseInfo()
            }
            uni.$on(this.$globalEventName['选择设备'], this.handleReplaceSimUpdate)
            uni.$on(this.$globalEventName['车辆维修-选择更换设备'], this.handleReplaceDeviceUpdate)
        },
        onUnload() {
            uni.$off(this.$globalEventName['选择设备'], this.handleReplaceSimUpdate)
            uni.$off(this.$globalEventName['车辆维修-选择更换设备'], this.handleReplaceDeviceUpdate)
        },
        methods: {
            // 获取基础信息
            async queryBaseInfo() {
                if (!this.isEdit) {
                    this.showLoading('加载中')
                    let files = await repairBillsApi.getVehicleDeviceFiles({ guid: this.formConfig.data.guidId })
                    this.formConfig.data.files = files
                }
                await this.queryHistoryData()
                uni.hideLoading()
            },
            // 获取产品诊断历史记录
            async queryHistoryData() {
                this.showLoading('加载中')
                var { productId, factoryFeedback } = this.formConfig.data
                var data = await resourceApi.getProductLanguages({
                    type: 6,
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
                uni.hideLoading()
            },
            // 点击提交按钮时触发
            handleSubmit() {
                if (this.$refs.FormConfig.validate()) {
                    let formData = this.formConfig.data
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
                let formData = this.formConfig.data
                switch (name) {
                case 'isReplaceDevice':
                    formData.isReplaceCard = false
                    formData.replaceSim = null
                    formData.handlingWay = null
                    break
                case 'isReplaceCard':
                    if (formData.handlingWay !== 0) {
                        formData.handlingWay = null
                    }
                    formData.isReplaceDevice = false
                    formData.replaceImei = null
                    formData.replaceType = null
                    formData.replaceDeviceId = null
                    break
                case 'handlingWay':
                    switch (formData[name]) {
                    case 0:
                        formData.isReplaceDevice = false
                        break
                    case 1:
                    case 2:
                        formData.isReplaceCard = false
                        formData.isReplaceDevice = true
                        break
                    }
                    break
                }
                if (['isReplaceDevice', 'isReplaceCard', 'handlingWay'].includes(name)) {
                    let options = []
                    if (formData.isReplaceDevice) {
                        options = enums.vehicleHandlingWay.filter(v => [1, 2].includes(v.value))
                    } else if (formData.isReplaceCard) {
                        options = enums.vehicleHandlingWay.filter(v => [0].includes(v.value))
                    } else {
                        options = enums.vehicleHandlingWay
                    }
                    this.$set(this.findFormConfigItem(this.formConfig.items, 'handlingWay'), 'options', options)
                }
            },
            // 输入框失去焦点时触发
            handleInputBlur({ name }) {
                let formData = this.formConfig.data
                switch (name) {
                case 'cost':
                case 'labourCost':
                    formData.companyBearCost = rigorous.floatAdd(formData.cost, formData.labourCost)
                    formData.enterpriseBearCost = 0
                    break
                }
            },
            // 点击pickerUrl组件时触发
            handlePickerUrlClick({ name }) {
                let { billId, excludeSim, excludeDevice } = this.extendParams
                let formData = this.formConfig.data
                switch (name) {
                case 'replaceImei':
                    this.navigateToData('/pages/home/repairBills/selectDevice', {
                        title: '选择更换设备',
                        value: formData.replaceDeviceId,
                        excludes: excludeDevice,
                        extendParams: {
                            projectId: formData.projectId,
                            replaceType: formData.replaceType
                        }
                    })
                    break
                case 'replaceSim':
                    this.navigateToData('/pages/common/selectDevice', {
                        title: '选择更换SIM卡',
                        value: formData.replaceSim,
                        viewProp: 'sim',
                        valueProp: 'sim',
                        searchProp: 'sim',
                        extendParams: {
                            repairId: billId,
                            selectSims: excludeSim,
                            productCategory: 'BBB76246-2925-43D8-B81D-D5FF74F1D1D7',
                            warehouses: 'warehousesSpaceTypeSim'
                        },
                        customRequestApi: deviceApi.getSimList
                    })
                    break
                }
            },
            // 选择替换sim卡后触发
            handleReplaceSimUpdate([data]) {
                let formData = this.formConfig.data
                formData.replaceSim = data.sim
            },
            // 选择替换设备后触发
            handleReplaceDeviceUpdate({ data, replaceType }) {
                let formData = this.formConfig.data
                formData.replaceType = replaceType
                formData.replaceImei = data.imei
                formData.replaceDeviceId = data.guidId
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
