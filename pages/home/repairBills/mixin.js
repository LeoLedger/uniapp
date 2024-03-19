
export default {
    data() {
        return {
            formData: {},
            viewList: [],
            dataList: [],
            tabsData: [
                { label: '全部', value: 0, list: [] },
                { label: '已维修', value: 0, list: [] },
                { label: '待维修', value: 0, list: [] }
            ],
            tabActive: 0,
            loadType: 'loading',
            isSubmit: false,
            isScrollTop: true,
            isExpandInfo: false,
            activeRowData: null,
            filterPopover: {
                content: false,
                visible: false
            }
        }
    },
    onUnload() {
        uni.$off(this.$globalEventName['维修单设备更新'], this.handleDeviceUpdate)
    },
    onLoad(params) {
        if (params.id) {
            this.filterConfig.data.id = params.id
            this.queryBaseData()
        }
        uni.$on(this.$globalEventName['维修单设备更新'], this.handleDeviceUpdate)
    },
    onPageScroll(e) {
        this.isExpandInfo = false
        this.isScrollTop = e.scrollTop < 1
    },
    methods: {
        // 点击扫码按钮时触发
        async handleScanCode() {
            let data = await scanCode()
            this.filterConfig.data.imei = data
            this.filterData()
        },
        // 选项卡切换时触发
        handleTabsChange(index) {
            this.tabActive = index
            this.isExpandInfo = false
            this.filterData()
        },
        // 设备更新时触发
        handleDeviceUpdate(data) {
            Object.keys(data).forEach(key => {
                this.activeRowData[key] = data[key]
            })
            this.filterData()
        },
        // 点击筛选弹出框按钮时触发
        handleFilterButton(name) {
            if (name === 'submit') {
                this.filterData()
            }
            this.filterPopover.visible = false
        }
    }
}
