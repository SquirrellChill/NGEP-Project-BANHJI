import { nodeApi } from './api';

export const loginWithTelegram = (telegramAuth) =>
  nodeApi.post('/auth/telegram/login', telegramAuth);
