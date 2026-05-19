import api from './api';

export const userService = {
  getUsers: async (search = '') => {
    const response = await api.get('/admin/users', { params: { search } });
    return response.data;
  },

  getUserDetails: async (userId) => {
    const response = await api.get(`/admin/users/${userId}`);
    return response.data;
  },

  updateBalance: async (userId, amount) => {
    const response = await api.post(`/admin/users/${userId}/balance`, { amount });
    return response.data;
  }
};
