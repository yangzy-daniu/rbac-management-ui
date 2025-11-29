import request from './request'

// 订单管理API
export const listOrderByPage = (params) => request.get('/orders/getOrdersByPage', { params })
export const getOrderDetail = (id) => request.get(`/orders/getOrderDetail/${id}`)
export const createOrder = (data) => request.post('/orders/createOrder', data)
export const deleteOrder = (id) => request.delete(`/orders/${id}`)
export const updateOrder = (id, data) => request.put(`/orders/${id}`, data)
export const updateOrderStatus = (id, status, operator) => request.put(`/orders/${id}/status`, null, {
    params: { status, operator }
})
