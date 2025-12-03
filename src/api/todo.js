import request from './request'

// 待办事项API
export const getTodos = (params) => request.get('/todos', { params })
export const getTodayTodos = () => request.get('/todos/today')
export const getTodoStats = () => request.get('/todos/stats')
export const createTodo = (data) => request.post('/todos', data)
export const updateTodoStatus = (id, completed) => request.put(`/todos/${id}/status`, null, { params: { completed } })
export const deleteTodoById = (id) => request.delete(`/todos/${id}`)
