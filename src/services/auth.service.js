import api from './api';

export const authService = {
  login: async (email, password) => {
    const response = await api.post('/auth/signin', { email, password });
    return response.data;
  },
  
  // Note: Registration/Logout implementations can go here as needed.
  logout: async () => {
    // Optionally call backend to blacklist the token
    // await api.post('/auth/logout');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  }
};
