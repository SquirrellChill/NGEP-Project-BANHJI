import { nodeApi } from './api';

// `telegramUser` is exactly what Telegram's widget hands back:
// { id, first_name, last_name, username, photo_url, auth_date, hash }
// — matches TelegramAuthRequest in app/schemas/user.py field-for-field,
// so no reshaping is needed before sending it on.
export const loginWithTelegram = (telegramUser) =>
  nodeApi.post('/auth/telegram/login', telegramUser);
