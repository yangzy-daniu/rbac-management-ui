import request from './request'

// 认证API
export const login = (data) => request.post('/auth/login', data)
export const logout = () => request.post('/auth/logout')
export const validateToken = () => request.get('/auth/validate')

// 用户信息API
export const getUserInfo = () => request.get('/user/info')
export const updateUserInfo = (data) => request.put('/user/info', data)


// 用户管理API
export const listUser = () => request.get('/users')
export const addUser = (data) => request.post('/addUser', data)
export const delUser = (id) => request.delete(`/users/${id}`)
