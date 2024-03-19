<template>
    <view class="content">
        <sy-form-config
            ref="FormConfig"
            @inputBlur="handleInputBlur"
        >
            <view v-if="formConfig.data._isCreate" slot="imei:append" class="append-wrap">
                <view v-if="isEdit" class="iconfont iconsaoma" @tap="handleScanCode('imei')"/>
                <view v-else class="text" @tap="handleEdit">编辑</view>
            </view>
            <view v-if="formConfig.data._isCreate" slot="psn:append" class="append-wrap">
                <view v-if="isEdit" class="iconfont iconsaoma" @tap="handleScanCode('psn')"/>
            </view>
            <view v-if="!formConfig.data._isCreate" slot="carNumber:append" class="append-wrap">
                <view class="text" @tap="handleUpdateRecord">修改记录</view>
            </view>
            <view v-if="!isEmpty(formConfig.data.deviceId)" slot="sim:append" class="append-wrap">
                <sy-button
                    :styles="{
                        height: '46rpx',
                        minWidth: '100rpx',
                        fontSize: '26rpx'
                    }"
                    text="更换"
                    type="primary"
                    @click="handleUpdateSim"
                />
            </view>
        </sy-form-config>
        <template v-if="showButton">
            <view style="height: 128rpx" />
            <view class="foot-wrap">
                <sy-button :text="isEdit ? '保存' : '更新'" type="primary" @click="handleSubmit" />
            </view>
        </template>
        <sy-popover
            :visible="updateRecordDialog.visible"
            :styles="{zIndex: 500}"
            position="center"
            mask-color="rgba(0,0,0,.4)"
        >
            <view class="update-record">
                <view class="title sy-ui-border-bottom">车牌号修改记录</view>
                <view class="body">
                    <sy-table-config
                        v-if="updateRecordDialog.loadType === 'hide'"
                        provide-key="updateRecordDialog.table"
                    />
                </view>
                <sy-load-more :type="updateRecordDialog.loadType"/>
                <view
                    class="button sy-ui-border-top"
                    @tap="updateRecordDialog.visible = false"
                >关闭</view>
            </view>
        </sy-popover>
    </view>
</template>

<script>
    // API
    import deviceApi from '@/api/device'
    import resourceApi from '@/api/resource'
    import installRegisterApi from '@/api/installRegister'
    // 方法
    import { scanCode, getCurAddressData } from '@/utils'
    // 组件

    export default {
        components: {
        },
        data() {
            return {
                searchParam: {
                    id: ''
                },
                formConfig: {
                    data: {
                        _isCreate: true
                    },
                    items: [],
                    button: false
                },
                extendParams: {},
                isEdit: true,
                canEdit: false,
                isCreate: true,
                updateRecordDialog: {
                    table: {
                        list: [],
                        columns: [
                            {
                                prop: 'userName',
                                label: '修改人',
                                width: 160
                            },
                            {
                                prop: 'originalValue',
                                label: '修改前',
                                width: 200
                            },
                            {
                                prop: 'newValue',
                                label: '修改后',
                                width: 200
                            },
                            {
                                type: 'date',
                                prop: 'changedTime',
                                label: '修改日期',
                                width: 300,
                                format: 'YYYY-MM-DD HH:mm:ss'
                            }
                        ]
                    },
                    loaded: false,
                    visible: false,
                    loadType: 'loading'
                }
            }
        },
        provide() {
            return {
                provideComponent: this
            }
        },
        computed: {
            showButton() {
                if (this.isEdit) {
                    return true
                }
                return this.searchParam.id
            }
        },
        watch: {
            'formConfig.data.deviceId'(value) {
                this.findFormConfigItem(this.formConfig.items, 'sim').visible = !this.isEmpty(value)
            }
        },
        onShow() {
        },
        onLoad(params) {
            if (params.datakey) {
                let {
                    data,
                    dataId,
                    isEdit,
                    canEdit,
                    installId,
                    excludes,
                    productId,
                    supplierId,
                    contractId,
                    costCenterId
                } = this.getNavigateData(params.datakey)
                let formData = { ...this.formConfig.data }
                if (dataId) {
                    this.isCreate = false
                    this.searchParam.id = dataId
                    this.queryBaseInfo()
                } else if (data) {
                    formData = Object.assign(formData, data)
                    this.isCreate = false
                } else {
                    formData._isCreate = true
                }
                this.extendParams = {
                    installId,
                    excludes,
                    productId,
                    supplierId,
                    contractId,
                    costCenterId
                }
                this.isEdit = !!isEdit
                this.canEdit = canEdit
                this.formConfig.data = formData
            }
            this.formConfig.items = [
                [
                    {
                        type: 'input',
                        name: 'imei',
                        label: '设备编号',
                        expandProps: {
                            deviceId: 'deviceId'
                        },
                        validate: [
                            { required: true, message: '设备编号不能为空' }
                        ],
                        readonly: !this.isEdit,
                        appendSlot: true
                    },
                    {
                        type: 'input',
                        name: 'psn',
                        label: 'psn号',
                        readonly: !this.isEdit,
                        appendSlot: true
                    },
                    {
                        type: 'input',
                        name: 'sim',
                        label: 'sim卡',
                        visible: false,
                        readonly: true,
                        appendSlot: true
                    },
                    {
                        type: 'pickerDate',
                        name: 'qaStartDate',
                        label: '质保开始日期',
                        validate: [
                            { required: true, message: '请选择质保开始日期' }
                        ],
                        readonly: !this.isEdit
                    },
                    {
                        type: 'input',
                        name: 'carNumber',
                        label: '车牌号',
                        validate: [
                            { required: true, message: '车牌号不能为空' }
                        ],
                        readonly: !this.showButton,
                        appendSlot: true
                    },
                    {
                        type: 'input',
                        name: 'driverName',
                        label: '司机姓名',
                        readonly: !this.showButton
                    },
                    {
                        type: 'input',
                        name: 'driverIdCard',
                        label: '司机身份证号',
                        validate: [
                            { type: 'idcard', message: '身份证号格式不正确' }
                        ],
                        readonly: !this.showButton,
                        props: {
                            type: 'idcard'
                        }
                    },
                    {
                        type: 'input',
                        name: 'engineNum',
                        label: '发动机号',
                        readonly: !this.showButton
                    },
                    {
                        type: 'input',
                        name: 'vin',
                        label: '车架号',
                        readonly: !this.showButton
                    },
                    {
                        type: 'pickerDate',
                        name: 'installTime',
                        label: '安装时间',
                        visible: !this.isEdit,
                        readonly: true
                    },
                    {
                        type: 'input',
                        name: 'installUserName',
                        label: '安装人',
                        visible: !this.isEdit,
                        readonly: true
                    }
                ],
                [
                    {
                        type: 'pickerLocation',
                        name: 'address',
                        label: '安装地点',
                        align: 'left',
                        column: true,
                        readonly: !this.isEdit,
                        expandProps: {
                            latitude: 'latitude',
                            longitude: 'longitude'
                        },
                        props: {
                            placeholder: '请选择安装地点'
                        },
                        // #ifndef H5
                        validate: [
                            { required: true, message: '请选择安装地点' }
                        ]
                        // #endif
                    }
                ],
                [
                    {
                        type: 'upload',
                        name: 'files',
                        label: '现场照片',
                        readonly: !this.showButton,
                        props: {
                            maxFileCount: 16
                        }
                    }
                ]
            ]
            if (this.isCreate) {
                this.queryLocation()
                uni.setNavigationBarTitle({
                    title: this.isEdit ? '登记新安装设备' : '安装设备详情'
                })
            } else {
                uni.setNavigationBarTitle({
                    title: this.isEdit ? '编辑设备信息' : '安装设备详情'
                })
            }
            uni.$on(this.$globalEventName['选择设备'], this.handleSIMChange)
            uni.$on(this.$globalEventName['设备安装-设备信息更新'], this.handleDeviceUpdate)
        },
        onUnload() {
            uni.$off(this.$globalEventName['选择设备'], this.handleSIMChange)
            uni.$off(this.$globalEventName['设备安装-设备信息更新'], this.handleDeviceUpdate)
        },
        methods: {
            // 获取详情
            async queryBaseInfo() {
                this.showLoading()
                var data = await installRegisterApi.detail(this.searchParam.id)
                this.formConfig.data = {
                    ...this.formConfig.data,
                    ...data,
                    _isCreate: false
                }
                uni.hideLoading()
            },
            // 获取当前地址
            async queryLocation() {
                if (this.isCreate) {
                    this.showLoading('定位中')
                    try {
                        var location = await getCurAddressData({
                            latKey: 'latitude',
                            lngKey: 'longitude'
                        })
                        this.formConfig.data = {
                            ...this.formConfig.data,
                            ...location
                        }
                    } catch (e) {
                        console.log(e)
                    }
                    uni.hideLoading()
                }
            },
            // 根据设备信息查找设备
            async queryDeviceInfo(params) {
                this.showLoading()
                var data = await installRegisterApi.findDevice({
                    ...params,
                    ...this.extendParams
                })
                uni.hideLoading()
                if (data) {
                    this.formConfig.data = {
                        ...this.formConfig.data,
                        sim: data.sim,
                        psn: data.psn,
                        imei: data.imei,
                        deviceId: data.guidId,
                        productId: data.productId,
                        productCode: data.productCode,
                        qaStartDate: data.warrantyStartDate
                    }
                } else {
                    this.formConfig.data = {
                        ...this.formConfig.data,
                        sim: '',
                        psn: '',
                        imei: '',
                        deviceId: '',
                        productId: '',
                        productCode: ''
                    }
                    this.showToast('未找到对应的设备信息')
                }
            },
            // 点击编辑按钮时触发
            handleEdit() {
                let { imei } = this.formConfig.data
                this.navigateToData('/pages/home/installRegister/update', {
                    data: this.formConfig.data,
                    isEdit: true,
                    excludes: this.extendParams.excludes.filter(v => v !== imei),
                    ...this.extendParams
                })
            },
            // 点击扫码按钮时触发
            async handleScanCode(name) {
                let data = await scanCode()
                this.formConfig.data[name] = data
                this.handleInputBlur({ name })
            },
            // 点击提交按钮时触发
            handleSubmit() {
                if (this.$refs.FormConfig.validate()) {
                    let { files } = this.formConfig.data
                    let formData = {
                        ...this.formConfig.data,
                        fileNum: files ? files.length : 0
                    }
                    if (this.isEdit) {
                        // 如果是新增或编辑回传给上级页面提交
                        if (formData.deviceId) {
                            formData.installStatus = 0
                            formData.installSelect = 0
                            uni.$emit(this.$globalEventName['设备安装-设备信息更新'], formData)
                            uni.navigateBack()
                        } else {
                            this.showToast('该设备编号不可用，请重新输入')
                        }
                    } else {
                        // 如果是详情页，只能更新部分字段
                        this.showLoading()
                        installRegisterApi.updateDevice(formData).then(() => {
                            uni.hideLoading()
                            this.showToast('更新成功', {
                                mask: true
                            })
                            setTimeout(() => {
                                uni.$emit(this.$globalEventName['设备安装-设备信息更新'], formData)
                                uni.navigateBack()
                            }, 1500)
                        }).catch(() => {
                            uni.hideLoading()
                        })
                    }
                }
            },
            // 输入框失去焦点时触发
            handleInputBlur({ name }) {
                let value = this.formConfig.data[name]
                if (['psn', 'imei'].includes(name) && !this.isEmpty(value)) {
                    switch (name) {
                    case 'psn':
                        this.queryDeviceInfo({ psn: value })
                        break
                    case 'imei':
                        installRegisterApi.list({
                            pageSize: -1,
                            installId: this.extendParams.installId
                        }).then(imeis => {
                            imeis = imeis.records.map(v => v.imei)
                            if (this.extendParams.excludes.includes(value) || imeis.includes(value)) {
                                this.formConfig.data[name] = ''
                                this.showToast('该设备已安装')
                            } else {
                                this.queryDeviceInfo({ imei: value })
                            }
                        })
                        break
                    }
                }
            },
            // 设备列表更新时触发
            handleDeviceUpdate(data) {
                this.formConfig.data = {
                    ...this.formConfig.data,
                    ...data
                }
            },
            // 更新SIM卡号
            handleUpdateSim() {
                let { installId } = this.extendParams
                this.navigateToData('/pages/common/selectDevice', {
                    title: '选择更换SIM卡',
                    value: this.formConfig.data.sim,
                    viewProp: 'sim',
                    valueProp: 'sim',
                    searchProp: 'sim',
                    customRequestApi: deviceApi.getSimList,
                    extendParams: {
                        installId,
                        productCategory: 'BBB76246-2925-43D8-B81D-D5FF74F1D1D7'
                    }
                })
            },
            // 选择SIM卡后触发
            handleSIMChange([data]) {
                setTimeout(() => {
                    this.showLoading('更换SIM中')
                    let { imei, guidId } = this.formConfig.data
                    deviceApi.updateSim({
                        id: guidId,
                        newSim: data.sim,
                        imei
                    }).then(() => {
                        uni.hideLoading()
                        this.formConfig.data = {
                            ...this.formConfig.data,
                            sim: data.sim
                        }
                        this.showToast('更换SIM卡成功！')
                    })
                }, 300)
            },
            // 查看修改记录
            handleUpdateRecord() {
                if (!this.updateRecordDialog.loaded) {
                    resourceApi.entityChanges({
                        entityId: this.formConfig.data.id,
                        entityFullName: 'hw.topevery.basis.device.model.DeviceInstallDetails',
                        propertyName: 'carNumber',
                        pageSize: -1
                    }).then(data => {
                        this.updateRecordDialog.table.list = data.records
                        this.updateRecordDialog.loadType = 'hide'
                    })
                }
                this.updateRecordDialog.visible = true
            }
        }
    }
</script>

<style lang="scss" scoped>
.content {
    padding: 30rpx 0;
    .append-wrap {
        display: flex;
        align-items: center;
        color: #0001AE;
        height: 84rpx;
        margin-left: 26rpx;
        .iconfont {
            font-size: 34rpx;
            text-align: right;
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
.update-record {
    width: 84vw;
    max-height: 80vh;
    display: flex;
    flex-direction: column;
    background: #fff;
    border-radius: 40rpx;
    padding: 0 30rpx;
    .title {
        font-size: 34rpx;
        font-weight: bold;
        text-align: center;
        line-height: 90rpx;
    }
    .body {
        flex: 1;
        overflow: auto;
    }
    .button {
        color: #666;
        text-align: center;
        line-height: 90rpx;
    }
}
</style>
