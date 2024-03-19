import fly from '@/utils/fly'

export default {
    // 获取系统字典
    getAllDict() {
        return fly.request({
            url: '/namespace/nsAndDict',
            method: 'get'
        })
    },
    // 获取产品常用语
    getProductLanguages: function(params) {
        return fly.request({
            url: '/product-languages',
            method: 'get',
            params
        })
    },
    // 获取部门下的用户
    getDeptUser: function(body) {
        return fly.request({
            url: '/user/listInDept',
            method: 'post',
            body
        })
    },
    // 获取角色下的用户
    getRoleUser: function(body) {
        return fly.request({
            url: '/user/listInRole',
            method: 'post',
            body
        })
    },
    // 获取用户列表
    getPeopleList: function(body) {
        return fly.request({
            url: '/user/list',
            method: 'post',
            body
        })
    },
    // 获取实体修改记录
    entityChanges(params) {
        return fly.request({
            url: '/entity-changes',
            method: 'get',
            params
        })
    }
}
