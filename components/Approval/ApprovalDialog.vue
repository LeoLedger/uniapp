<!--
* @description 审批表单弹窗
* @author yxs
!-->
<template>
    <div class="approval-dialog">
        <sy-popover
            v-model="popoverContent"
            :visible="visible"
            :styles="{zIndex: 500}"
            position="bottom"
            mask-color="rgba(0,0,0,.4)"
            @masktap="$emit('update:visible', false)"
        >
            <view v-if="popoverContent" class="form-wrap">
                <view class="head-wrap slenderBorderBottom">
                    审批
                </view>
                <view class="body-wrap">
                    <sy-form-config
                        fill
                        @button="handleSubmit"
                        @change="handleFormChange"
                    />
                </view>
            </view>
        </sy-popover>
    </div>
</template>

<script>
    // API
    import workFlowApi from '@/api/workFlow'
    // 方法
    // 组件

    export default {
        name: 'ApprovalDialog',
        props: {
            visible: Boolean,
            extendParams: { type: Object, default: () => ({}) },
            // 是否只允许驳回
            onlyAllowBack: Boolean
        },
        data() {
            let formProps = {
                type: {
                    type: 'radio',
                    name: 'type',
                    align: 'left',
                    column: true,
                    showLabel: false,
                    props: {
                        button: true,
                        options: [
                            { label: '通过', value: 0, visible: true },
                            { label: '驳回', value: 1, visible: true }
                        ]
                    }
                },
                targetActivityIdentifier: {
                    type: 'picker',
                    name: 'targetActivityIdentifier',
                    label: '下一环节',
                    showLabel: true,
                    validate: [
                        { required: true, message: '请选择下一环节' }
                    ],
                    props: {
                        mode: 'selector',
                        options: [],
                        labelKey: 'label',
                        valueKey: 'value',
                        placeholder: '选择下一环节'
                    }
                },
                objectType: {
                    type: 'picker',
                    name: 'objectType',
                    label: '办理对象类型',
                    visible: false,
                    showLabel: true,
                    validate: [
                        { required: true, message: '请选择接收对象' }
                    ],
                    props: {
                        mode: 'selector',
                        options: [],
                        labelKey: 'label',
                        valueKey: 'value',
                        placeholder: '选择接收对象'
                    }
                },
                receiver: {
                    type: 'picker',
                    name: 'receiver',
                    align: 'right',
                    label: '办理对象',
                    visible: false,
                    showLabel: true,
                    validate: [
                        { required: true, message: '请选择办理对象' }
                    ],
                    props: {
                        mode: 'selector',
                        options: [],
                        labelKey: 'receiverName',
                        valueKey: 'receiverId',
                        placeholder: '选择办理对象'
                    }
                },
                content: {
                    type: 'textarea',
                    name: 'content',
                    align: 'left',
                    showLabel: false,
                    props: {
                        fixed: true,
                        placeholder: '请填写审批意见'
                    }
                }
            }
            return {
                formConfig: {
                    data: {
                        type: 0,
                        receiver: null,
                        targetActivityIdentifier: '',
                        content: ''
                    },
                    items: [
                        [
                            formProps.type,
                            formProps.targetActivityIdentifier,
                            formProps.objectType,
                            formProps.receiver,
                            formProps.content
                        ]
                    ],
                    button: [
                        { text: '提交', type: 'primary', name: 'submit' }
                    ]
                },
                stepData: {},
                formProps,
                receiverType: {
                    user: [],
                    role: [],
                    dept: [],
                    other: []
                },
                popoverContent: false
            }
        },
        provide() {
            return {
                provideComponent: this
            }
        },
        computed: {
            formData() {
                return this.formConfig.data
            },
            canApproval() {
                if (this.onlyShow) {
                    return false
                }
                return !!this.extendParams.canHandle
            }
        },
        watch: {
            onlyAllowBack(value) {
                this.formData.type = value ? 1 : 0
                this.handlePassChange(this.formData)
            }
        },
        mounted() {
            this.queryNextActivities(0)
            this.queryNextActivities(1)
        },
        methods: {
            // 获取下一环节
            async queryNextActivities(type = this.formData.type) {
                let { wfActivityInstId } = this.extendParams
                if (wfActivityInstId) {
                    var data = await workFlowApi.getNextActivities({
                        type,
                        activityInstId: wfActivityInstId
                    })
                    this.stepData[type] = data.reverse()
                    this.formProps.type.props.options.find(item => item.value === type).visible = !!data.length

                    if (this.formData.type === type && data.length) {
                        this.handlePassChange(this.formData)
                        this.handleStepChange(this.formData)
                    }
                }
            },
            // 点击提交按钮时触发
            handleSubmit() {
                this.showLoading()
                let { type, content, receiver, targetActivityIdentifier } = this.formData
                let { jsonData, approvalId, approvalType, wfActivityInstId } = this.extendParams
                workFlowApi.send({
                    type,
                    jsonData,
                    approvalId,
                    approvalType,
                    content,
                    receiver: this.formProps.receiver.props.options.find(v => v.receiverId === receiver),
                    wfActivityInstId,
                    targetActivityIdentifier
                }).then(() => {
                    uni.hideLoading()
                    this.$emit('update:visible', false)
                    this.$emit('update')
                })
            },
            // 审批结果改变时触发
            handlePassChange(data) {
                let type = data.type
                if (this.stepData[type]) {
                    let stepOptions = this.stepData[type].map(item => {
                        return {
                            label: item.name,
                            value: item.identifier
                        }
                    })
                    data.content = type ? '不同意' : '同意'
                    data.targetActivityIdentifier = stepOptions[0].value
                    this.handleStepChange(data)
                    this.formProps.targetActivityIdentifier.props.options = stepOptions
                }
            },
            // 下一环节改变时触发
            handleStepChange(data) {
                let stepData = this.stepData[data.type]
                if (stepData.length === 0) return
                let receiverList = stepData.find(item => {
                    return item.identifier === data.targetActivityIdentifier
                }).receiverList || []
                let receiverType = {
                    user: [],
                    role: [],
                    dept: [],
                    other: []
                }
                receiverList.map(item => {
                    switch (item.receiverType) {
                    case 100601:
                        receiverType.user.push(item)
                        break
                    case 100602:
                        receiverType.role.push(item)
                        break
                    case 100603:
                        receiverType.dept.push(item)
                        break
                    case 100604:
                        receiverType.other.push(item)
                        break
                    }
                })
                let options = []
                if (receiverType.user.length) {
                    options.push({ label: '用户', value: 100601 })
                }
                if (receiverType.role.length) {
                    options.push({ label: '角色', value: 100602 })
                }
                if (receiverType.dept.length) {
                    options.push({ label: '部门', value: 100603 })
                }
                switch (options.length) {
                case 1:
                    // 如果只有一个对象类型，选中该类型
                    data.objectType = options[0].value
                    break
                default:
                    data.receiver = ''
                    data.objectType = ''
                    this.formProps.receiver.visible = false
                    break
                }
                this.receiverType = receiverType
                this.formProps.objectType.visible = !!options.length
                this.formProps.objectType.props.options = options

                if (data.objectType) {
                    this.handleReceiverChange(data)
                }
            },
            // 接收对象改变时触发
            handleReceiverChange(data) {
                let options = []
                switch (data.objectType) {
                case 100601:
                    options = this.receiverType.user
                    break
                case 100602:
                    options = this.receiverType.role
                    break
                case 100603:
                    options = this.receiverType.dept
                    break
                }
                switch (options.length) {
                case 0:
                    data.receiver = ''
                    break
                case 1:
                    // 如果只有一个办理对象，选中该对象
                    data.receiver = options[0].receiverId
                    break
                }
                this.formProps.receiver.visible = !!options.length
                this.formProps.receiver.props.options = options
            },
            // 表单组件改变时触发
            handleFormChange({ name }) {
                let data = this.formData
                switch (name) {
                case 'type':
                    if (data.type === 0 && this.onlyAllowBack) {
                        data.type = 1
                        this.showModal('当前环节暂不支持移动端处理，请前往PC端进行操作！', {
                            showCancel: false
                        })
                    } else {
                        this.handlePassChange(data)
                    }
                    break
                case 'targetActivityIdentifier':
                    this.handleStepChange(data)
                    break
                case 'objectType':
                    this.handleReceiverChange(data)
                    break
                }
            }
        }
    }
</script>

<style lang='scss' scoped>
.form-wrap {
    display: flex;
    flex-direction: column;
    max-height: 90vh;
    background: #fff;
    border-radius: 40rpx 40rpx 0 0;
    .head-wrap {
        font-size: 34rpx;
        font-weight: bold;
        line-height: 48rpx;
        color: #3A3A3A;
        padding: 30rpx;
        text-align: center;
    }
    .body-wrap {
        flex: 1;
    }
}
</style>
