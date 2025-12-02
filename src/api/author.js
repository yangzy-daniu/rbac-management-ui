import request from './request'

// 认证API
export const login = (data) => request.post('/auth/login', data)
export const logout = () => request.post('/auth/logout')
export const register = (data) => request.post('/auth/register', data)
export const forgotPassword = (data) => request.post('/auth/forgot-password', data)
