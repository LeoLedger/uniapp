// 全局混入

import { getDictProp, checkFeature } from '@/utils'

export default {
    filters: {
        getDictProp,
        checkFeature
    },
    methods: {
        getDictProp,
        checkFeature,
        // 跳转页面
        handleGoto(e) {
            let url = e.currentTarget.dataset.url
            if (url) {
                uni.navigateTo({ url })
            } else {
                this.handleDeveloping()
            }
        },
        // 开发中提示
        handleDeveloping() {
            if (process.env.NODE_ENV === 'development') {
                this.showToast('功能开发中...')
            }
        },
        // 设置自定义底部栏选中项
        setCustomTabBar(index) {
            let page = this.$mp.page
            if (typeof page.getTabBar === 'function' && page.getTabBar()) {
                page.getTabBar().setData({
                    selected: index
                })
            }
        }
    }
}
