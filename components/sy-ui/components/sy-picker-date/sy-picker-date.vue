<!--
* @description 日期选择器
* @author yxs
!-->
<template>
    <view class="sy-picker-date">
        <sy-picker-input
            :props="pickerInputProps"
            @click="show"
            @clear="handleClear"
        />
        <sy-popover
            v-model="popover.content"
            :visible="popover.visible"
            position="bottom"
            @masktap="handleCancel"
        >
            <view v-if="popover.content" class="popover-wrap">
                <view class="body-wrap">
                    <sy-calendar
                        :value="inputValue"
                        :mode="__props.mode"
                        :type="__props.type"
                        :default-time="__props.defaultTime"
                        :value-format="__props.valueFormat"
                        :first-day-of-week="__props.firstDayOfWeek"
                        @input="handleInput"
                    />
                </view>
                <view class="foot-wrap sy-ui-border-top">
                    <view class="button-wrap">
                        <sy-button-group
                            :options="[
                                {text: '取消', name: 'cancel'},
                                {type: 'primary', text: '确定', name: 'confirm'},
                            ]"
                            @cancel="handleCancel"
                            @confirm="handleConfirm"
                        />
                    </view>
                </view>
            </view>
        </sy-popover>
    </view>
</template>
<script>

    import props from './props'
    import mixinProps, { assignProps } from '../../mixin/props'
    import dateTools from '../../utils/dateTools'

    export default {
        name: 'SyPickerDate',
        mixins: [mixinProps],
        props,
        data() {
            return {
                popover: {
                    content: false,
                    visible: false
                },
                viewValue: '',
                inputValue: ''
            }
        },
        computed: {
            pickerInputProps() {
                return assignProps('SyPickerInput', {
                    ...this.__props,
                    value: this.viewValue
                })
            }
        },
        watch: {
            'mode': 'init',
            '__props.value': 'init'
        },
        mounted() {
            this.init()
        },
        methods: {
            show() {
                if (this.__props.readonly || this.__props.loading || this.__props.disabled) return
                this.popover.visible = true
            },
            hide() {
                this.popover.visible = false
            },
            init() {
                this.inputValue = this.__props.value
                this.updateViewValue()
            },
            // 更新视图value
            updateViewValue() {
                let label = ''
                let value = this.inputValue
                if (!this.isEmpty(value)) {
                    if (this.__props.type === 'week') {
                        if (Array.isArray(value) && value.length) {
                            label = dateTools.format(value[0], this.__props.format)
                        } else {
                            value = null
                        }
                    } else {
                        switch (this.__props.mode) {
                        case 'range':
                            if (Array.isArray(value) && value.length > 1) {
                                label = [value[0], value.slice(-1)[0]].map(item => dateTools.format(item, this.__props.format)).join(this.__props.separator)
                            } else {
                                value = null
                            }
                            break
                        case 'multiple':
                            if (Array.isArray(value)) {
                                label = value[0]
                                if (value.length > 1) {
                                    label += ` 【+${value.length - 1}项】`
                                }
                            } else {
                                value = null
                            }
                            break
                        case 'radio':
                        default:
                            if (typeof value === 'string') {
                                label = dateTools.format(value, this.__props.format)
                            } else {
                                value = null
                            }
                            break
                        }
                    }
                }
                this.viewValue = label
                this.inputValue = value
            },
            // 点击清空按钮时触发
            handleClear() {
                this.handleInput('')
                this.$emit('clear')
                this.$emit('input', '')
                this.$emit('change', '')
            },
            // 选中值改变时触发
            handleInput(value) {
                this.inputValue = value
            },
            // 点击取消按钮时触发
            handleCancel() {
                this.inputValue = this.__props.value
                this.hide()
                this.$emit('cancel')
            },
            // 点击确定按钮时触发
            handleConfirm() {
                if (this.isEmpty(this.inputValue)) {
                    return this.showToast('请选择一个日期')
                }
                switch (this.__props.mode) {
                case 'range':
                    if (!Array.isArray(this.inputValue) || !this.inputValue.length) {
                        return this.showToast('请选择一个日期范围')
                    }
                    break
                case 'multiple':
                    if (!Array.isArray(this.inputValue) || !this.inputValue.length) {
                        return this.showToast('请至少选择一个日期')
                    }
                    break
                }
                this.hide()
                this.updateViewValue()
                this.$emit('input', this.inputValue)
                this.$emit('change', this.inputValue)
            }
        }
    }
</script>
<style lang="scss" scoped>
.popover-wrap{
    background: #fff;
    border-radius: 30rpx 30rpx 0 0;
    .foot-wrap {
        .button-wrap {
            padding: 30rpx;
            background: #fff;
        }
    }
}
</style>

