import request from './request'
// 操作日志API
export const getOperationLogs = (params) => request.get('/operation-logs/detailed', { params })
export const getOperationLogDetail = (id) => request.get(`/operation-logs/${id}`)
export const getRecentLogs = () => request.get('/operation-logs/recent')
