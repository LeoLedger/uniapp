<!--
* @description 标记点
* @author yc
!-->
<template>
    <view
        :style="styles_"
        class="calendar-marker"
    >
        {{ config.text || '' }}
    </view>
</template>
<script>

    import { objectToCss } from '../../utils'

    export default {
        name: 'CalendarMarker',
        props: {
            config: Object
        },
        computed: {
            styles_() {
                return objectToCss(this.config.styles)
            }
        }
    }
</script>
<style lang="scss" scoped>
.calendar-marker {
    position: absolute;
}
</style>

