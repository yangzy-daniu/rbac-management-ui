import request from './request'

// 菜单管理API
export const getMenus = () => request.get('/menus/all')
export const getMenuTree = () => request.get('/menus/tree')
export const getMenuById = (id) => request.get(`/menus/${id}`)
export const createMenu = (data) => request.post('/menus', data)
export const updateMenu = (id, data) => request.put(`/menus/${id}`, data)
export const deleteMenu = (id) => request.delete(`/menus/${id}`)
export const batchDeleteMenus = (ids) => request.post('/menus/batch-delete', ids)
