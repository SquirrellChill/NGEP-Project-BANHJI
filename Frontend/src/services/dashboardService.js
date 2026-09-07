import { nodeApi } from './api';

export const getDashboardSummary = ({ targetDate } = {}) =>
  nodeApi.get('/dashboard/summary', {
    params: { target_date: targetDate },
  });

export const getRecentDashboardTransactions = ({ limit = 5 } = {}) =>
  nodeApi.get('/dashboard/recent-transactions', {
    params: { limit },
  });