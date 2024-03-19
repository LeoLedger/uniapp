<!--
* @description 按钮组
* @author yxs
!-->
<template>
    <view
        v-if="__props.options"
        :class="{column: __props.column}"
        class="sy-button-group"
    >
        <sy-button
            v-for="(item, index) in __props.options"
            :key="index"
            :props="item"
            @click="handleActive(item, index)"
        />
    </view>
</template>
<script>
    import props from './props'
    import mixinProps from '../../mixin/props'
    export default {
        name: 'SyButtonGroup',
        mixins: [mixinProps],
        props,
        methods: {
            handleActive(data, index) {
                let params = { data, index }
                if (data.name) {
                    this.$emit(data.name, params)
                }
                this.$emit('click', params)
            }
        }
    }
</script>
<style lang="scss" scoped>
.sy-button-group{
    display: flex;
    align-items: center;
    &.column{
        align-items: initial;
        flex-direction: column;
    }
}
/* #ifdef MP-WEIXIN */
/deep/{
    sy-button{
        flex: 1;
        &  + sy-button {
            margin-left: 30rpx;
        }
    }
}
.column{
    /deep/{
        sy-button + sy-button{
            margin-top: 30rpx;
            margin-left: 0;
        }
    }
}
/* #endif */
/* #ifndef MP-WEIXIN */
/deep/{
    .sy-button{
        flex: 1;
        &  + .sy-button{
            margin-left: 30rpx;
        }
    }
}
.column{
    align-items: initial;
    flex-direction: column;
    /deep/{
        .sy-button{
            flex: initial;
        }
        .sy-button + .sy-button{
            margin-top: 30rpx;
            margin-left: 0;
        }
    }
}
/* #endif */
</style>

