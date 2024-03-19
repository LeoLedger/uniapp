
<template>
    <view class="form-view">
        <template
            v-for="config in formConfig"
        >
            <view
                v-if="config.visible !== false"
                :key="config.prop"
                class="item slenderBorderTop"
            >
                <view v-if="!isEmpty(config.label)" class="label">{{ config.label }}：</view>
                <view class="value">
                    <template v-if="config.type === 'dateRange'">
                        {{ formData[config.minKey] | dateFormat(config.format) }} 至 {{ formData[config.maxKey] | dateFormat(config.format) }}
                    </template>
                    <template v-else-if="config.type === 'file'">
                        <sy-upload
                            :file-list="formData[config.prop]"
                            round
                            readonly
                            none-text="暂无附件"
                        />
                    </template>
                    <template v-else-if="isEmpty(formData[config.prop])">
                        <text class="not-text">{{ '- -' }}</text>
                    </template>
                    <template v-else-if="config.type === 'dict'">
                        {{ formData[config.prop] | getDictProp(config.dictName) }}
                    </template>
                    <template v-else-if="config.type === 'date'">
                        {{ formData[config.prop] | dateFormat(config.format) }}
                    </template>
                    <template v-else-if="config.type === 'money'">
                        {{ formData[config.prop] | moneyFormat(config.digit) }}
                    </template>
                    <template v-else>
                        {{ formData[config.prop] }}
                    </template>
                </view>
            </view>
        </template>
    </view>
</template>

<script>
    export default {
        props: {
            model: Object,
            config: Array
        },
        data() {
            return {
                formData: {},
                formConfig: []
            }
        },
        computed: {

        },
        watch: {
            model: {
                deep: true,
                handler(formData) {
                    this.setConfig({ formData })
                }
            },
            config: {
                deep: true,
                handler(formConfig) {
                    this.setConfig({ formConfig })
                }
            }
        },
        mounted() {
            this.setConfig({
                formData: this.model,
                formConfig: this.config
            })
        },
        methods: {
            // 设置配置选项
            setConfig(config) {
                if (!this.isEmpty(config)) {
                    Object.keys(config).forEach(key => {
                        if (!this.isEmpty(config[key]) && typeof config[key] === typeof this[key]) {
                            this[key] = config[key]
                        }
                    })
                }
            }
        }
    }
</script>
<style lang="scss" scoped>
.form-view {
    .item {
        display: flex;
        line-height: 40rpx;
        padding: 16rpx 0;
        &:first-child {
            &::before {
                display: none;
            }
        }
        .value {
            flex: 1;
            margin-left: 12rpx;
            word-break: break-all;
        }
    }
    .not-text {
        color: #999;
    }
}
</style>
