Component({
    data: {
        selected: 0,
        color: '#999',
        selectedColor: '#0001ae',
        list: [
            {
                'pagePath': '/pages/tabBar/home',
                'iconPath': '/static/image/tabBar/home.png',
                'selectedIconPath': '/static/image/tabBar/home-on.png',
                'text': '首页'
            },
            {
                'custom': true,
                'pagePath': 'custom',
                'iconPath': '/static/image/tabBar/button.png'
            },
            {
                'pagePath': '/pages/tabBar/user',
                'iconPath': '/static/image/tabBar/user.png',
                'selectedIconPath': '/static/image/tabBar/user-on.png',
                'text': '我的'
            }
        ]
    },
    attached() {
    },
    methods: {
        switchTab(e) {
            const data = e.currentTarget.dataset
            const url = data.path
            if (data.path === 'custom') {
                // todo
            } else {
                wx.switchTab({ url })
                this.setData({
                    selected: data.index
                })
            }
        }
    }
})
