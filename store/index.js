
import Vue from 'vue'
import Vuex from 'vuex'

import user from './modules/user'
import rootData from './modules/rootData'

Vue.use(Vuex)

const store = new Vuex.Store({
    modules: {
        user,
        rootData
    },
    getters: {

    }
})

export default store
