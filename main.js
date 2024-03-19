import Vue from 'vue'
import App from './App'
import store from './store'
import { globalEventName } from '@/utils/enum'

import '@/components/sy-ui'
// 图标字体
import './static/styles/iconfont.css'
// 公用样式
import './static/styles/common.scss'
import './static/styles/public.scss'

// 全局混入
import mixin from '@/mixin'
Vue.mixin(mixin)

/** 查看log 数据
 * @param content
 * @param title
 * @param background
 */
function consoleLog(content = 'content', title = 'title', background = '#1475b2') {
    content = typeof content === 'object' ? JSON.stringify(content) : content
    console.log.apply(null, [`%c ${title}： %c ${content} `, 'padding: 1px; border-radius: 10px; color: #fff; background: #9159B2;', `padding: 1px; border-radius: 10px; color: #fff; background: ${background};`])
}
/** 全局 打log
 *  eg:
 *      <template>{{$log('data', 'title')}}</template>
 *      $log('data', 'title')
 */
// 在vue上挂载全局变量
Vue.prototype = Object.assign(Vue.prototype, {
    $log: consoleLog,
    $store: store,
    $globalEventName: globalEventName,
    findFormConfigItem: (list, name) => {
        let config
        list.find(group => {
            config = group.find(v => v.name === name)
            return !!config
        })
        return config
    }
})

Vue.config.productionTip = false

App.mpType = 'app'

const app = new Vue({
    ...App
})
app.$mount()
