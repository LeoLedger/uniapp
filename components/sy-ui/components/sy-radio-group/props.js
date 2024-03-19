
import radioProps from '../sy-radio/props'
import { getProps } from '../../mixin/props'

export default {
    ...getProps({
        data: radioProps,
        props: ['size', 'color', 'button', 'isCancel', 'readonly', 'disabled']
    }),
    value: null,
    styles: Object,
    options: Array, // 配置项
    labelKey: { type: String, default: 'label' }, // 指定label为数据源的某个属性
    valueKey: { type: String, default: 'value' }, // 指定value为数据源的某个属性
    placeholder: String // 没有值时的占位符
}
