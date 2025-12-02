import request from './request'

export const userApi = {
    // 获取用户信息
    getProfile() {
        return request.get('/profile/userInfo')
    },

    // 更新个人资料
    updateProfile(data) {
        return request.put('/profile/userInfo', data)
    },

    // 修改密码
    changePassword(data) {
        return request.post('/profile/change-password', data)
    },

    // 更新头像
    updateAvatar(avatarUrl) {
        return request.post('/profile/avatar', { avatarUrl })
    },

    // 获取用户统计
    getUserStats() {
        return request.get('/profile/stats')
    }
}
