
export default {
    data() {
        return {
            dataId: '',
            loading: false,
            jsonData: null,
            loadIndex: 0,
            canHandle: false,
            canApproval: false,
            processIndex: 0,
            disabledStep: [],
            extendParams: null
        }
    },
    watch: {
        loadIndex(value) {
            if (value >= 2) {
                this.updateTabelConfig()
            }
        }
    },
    mounted() {
        this.updateTabelConfig()
    },
    onLoad(params) {
        if (params.jsonData) {
            params = JSON.parse(params.jsonData)
            this.dataId = params.dataId
            this.canHandle = params.canHandle
        }
        this.formData = {}
        this.queryBaseInfo()
    },
    methods: {
        updateData(formData) {
            this.formData = formData
            this.canApproval = formData.approvalStatus === 0 && this.canHandle
            this.extendParams = {
                jsonData: this.jsonData ? JSON.stringify(this.jsonData) : void 0,
                approvalId: formData.approvalId || formData.guidId,
                approvalType: this.approvalType,
                wfInstId: formData.wfInstId,
                wfActivityInstId: formData.wfActivityInstId
            }
            this.loadIndex++
        },
        updateTabelConfig() {},
        // 流程更新时触发
        handleProcessUpdate(index) {
            this.processIndex = index
            this.loadIndex++
        }
    }
}
