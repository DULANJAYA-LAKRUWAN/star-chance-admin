import api from './api';

export const paymentService = {
  getPendingSessions: async () => {
    const response = await api.get('/admin/payments/pending');
    return response.data;
  },

  resolvePendingSession: async (orderId, action) => {
    const response = await api.post(`/admin/payments/pending/${orderId}/resolve`, { action });
    return response.data;
  },

  getWalletLedger: async ({ userId, page = 1, limit = 50 } = {}) => {
    const response = await api.get('/admin/wallet/ledger', {
      params: { userId, page, limit },
    });
    return response.data;
  },
};
