
import { getToken } from '@/utils/storage'
import { uploadFileUrl, previewImgSrc, baseDownSrc } from '@/utils'

export default {
    name: 'file',
    fileIdKey: 'fileId',
    quality: 0.6,
    fileType: 'jpg',
    action: uploadFileUrl,
    originalUrl: baseDownSrc,
    thumbnailUrl: previewImgSrc,
    mediaType: ['image'],
    sourceType: ['camera', 'album'],
    headers: {
        token: (getToken() || {}).access_token
    },
    fixResponse: function(response) {
        if (response.success) {
            return response.data
        } else {
            uni.showToast({
                icon: 'none',
                title: response.message || '网络错误！',
                duration: 2000
            })
            return
        }
    }
}
