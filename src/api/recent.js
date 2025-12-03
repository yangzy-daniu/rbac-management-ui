import request from './request'

/**
 * 获取最近访问记录
 */
export function getRecentAccess() {
    return request({
        url: '/recent-access',
        method: 'get'
    })
}

/**
 * 记录访问
 * @param {Object} data - 访问信息
 * @param {string} data.menuName - 菜单名称
 * @param {string} data.menuPath - 菜单路径
 * @param {string} data.menuIcon - 菜单图标
 */
export function recordAccess(data) {
    return request({
        url: '/recent-access/record',
        method: 'post',
        data
    })
}

/**
 * 清除最近访问记录
 */
export function clearRecentAccess() {
    return request({
        url: '/recent-access',
        method: 'delete'
    })
}
