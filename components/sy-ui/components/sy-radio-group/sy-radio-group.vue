<!--
* @description 单选按钮组
* @author yxs
!-->
<template>
    <view
        v-if="__props.options"
        :class="{ disabled: __props.disabled}"
        :style="style"
        class="sy-radio-group"
    >
        <template v-if="__props.readonly">
            <text v-if="isEmpty(viewValue)" class="input-placeholder">{{ __props.placeholder }}</text>
            <text v-else>{{ viewValue }}</text>
        </template>
        <view v-else class="group">
            <view
                v-for="(item, index) in groupData"
                :key="index"
                class="item"
                @click="handleActive(item)"
            >
                <sy-radio
                    :size="__props.size"
                    :text="item[__props.labelKey]"
                    :color="__props.color"
                    :value="insideValue"
                    :label="item[__props.valueKey]"
                    :button="__props.button"
                    readonly
                />
            </view>
        </view>
    </view>
</template>
<script>

    import props from './props'
    import mixinProps from '../../mixin/props'
    import { objectToCss } from '../../utils'

    export default {
        name: 'SyRadioGroup',
        mixins: [mixinProps],
        props,
        data() {
            return {
                insideValue: null
            }
        },
        computed: {
            style() {
                return objectToCss(this.__props.styles)
            },
            // 只有在value和内部value相同时才能进行交互操作
            canActive() {
                return this.insideValue === this.__props.value
            },
            groupData() {
                return this.__props.options.filter(item => item.visible !== false)
            },
            viewValue() {
                return (this.groupData.find(item => item[this.__props.valueKey] === this.__props.value) || {})[this.__props.labelKey]
            }
        },
        watch: {
            '__props.value': {
                immediate: true,
                handler(value) {
                    this.insideValue = value
                }
            }
        },
        methods: {
            handleActive(data) {
                if (this.__props.readonly) return
                if (this.canActive) {
                    let value = data[this.__props.valueKey]
                    if (data[this.__props.valueKey] === this.__props.value && this.__props.isCancel) {
                        value = null
                    }
                    this.insideValue = value
                    this.$emit('input', value)
                    this.$emit('change', value)
                }
            }
        }
    }
</script>
<style lang="scss" scoped>
.sy-radio-group {
    display: inline-flex;
    flex-wrap: wrap;
    align-items: center;
    &.disabled {
        opacity: .7;
        pointer-events: none;
    }
    .group {
        margin-left: -16rpx;
        .item {
            display: inline-flex;
            padding: 16rpx;
        }
    }
}
</style>

