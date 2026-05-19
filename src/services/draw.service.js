import api from './api';

export const drawService = {
  getAllDraws: async () => {
    const response = await api.get('/admin/draws');
    return response.data;
  },

  createDraw: async (drawData) => {
    const response = await api.post('/admin/draws', drawData);
    return response.data;
  },

  deleteDraw: async (drawId) => {
    const response = await api.delete(`/admin/draws/${drawId}`);
    return response.data;
  },

  executeManualDraw: async (drawId) => {
    const response = await api.post(`/admin/draws/${drawId}/execute`);
    return response.data;
  },
};
