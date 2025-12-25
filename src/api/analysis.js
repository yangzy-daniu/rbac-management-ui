import request from './request'

// 统计分析API
export const getRecentActions = () => request.get('/analysis/recent-actions')

export const getQuickStats = () => request.get('/analysis/quick-stats')

export function getAnalysisStats(timeRange = '7d') {
    return request({
        url: '/analysis/stats',
        method: 'get',
        params: { timeRange }
    })
}

export function getTrendData(timeRange = '7d') {
    return request({
        url: '/analysis/trend',
        method: 'get',
        params: { timeRange }
    })
}

export function getBehaviorData(timeRange = '7d') {
    return request({
        url: '/analysis/behavior',
        method: 'get',
        params: { timeRange }
    })
}

export function getRetentionData(timeRange = '7d') {
    return request({
        url: '/analysis/retention',
        method: 'get',
        params: { timeRange }
    })
}
