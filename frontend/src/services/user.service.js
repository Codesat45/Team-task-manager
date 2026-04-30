import api from './api'

export const userService = {
  getAll: () => api.get('/users'),
  delete: (id) => api.delete(`/users/${id}`),
}
