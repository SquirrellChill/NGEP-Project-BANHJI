import { nodeApi } from './api';

export const createSale = (payload) => nodeApi.post('/transactions', payload);

export const updateSale = (saleId, payload) => nodeApi.put(`/transactions/${saleId}`, payload);

export const deleteSale = (saleId) => nodeApi.delete(`/transactions/${saleId}`);

export const getSale = (saleId) => nodeApi.get(`/transactions/${saleId}`);

export const getSales = ({ startDate, endDate, limit = 50, offset = 0 } = {}) =>
  nodeApi.get('/transactions', {
    params: {
      start_date: startDate,
      end_date: endDate,
      limit,
      offset,
    },
  });

export const getSummary = ({ period = 'daily', anchor } = {}) =>
  nodeApi.get('/transactions/summary', {
    params: { period, anchor },
  });
