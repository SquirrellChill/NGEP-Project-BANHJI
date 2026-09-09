import { useEffect, useState } from 'react';

const TELEGRAM_SDK_URL = 'https://oauth.telegram.org/js/telegram-login.js?6';

export default function TelegramLoginButton({ onAuth, onError }) {
  const [loading, setLoading] = useState(false);
  const [sdkReady, setSdkReady] = useState(Boolean(window.Telegram?.Login));

  useEffect(() => {
    if (window.Telegram?.Login) {
      setSdkReady(true);
      return undefined;
    }

    let script = document.querySelector('script[data-kotchomnol-telegram-sdk]');
    if (!script) {
      script = document.createElement('script');
      script.src = TELEGRAM_SDK_URL;
      script.async = true;
      script.dataset.kotchomnolTelegramSdk = 'true';
      document.body.appendChild(script);
    }

    const handleLoad = () => setSdkReady(true);
    const handleError = () => onError?.('Telegram login could not be loaded. Please try again.');
    script.addEventListener('load', handleLoad);
    script.addEventListener('error', handleError);

    return () => {
      script.removeEventListener('load', handleLoad);
      script.removeEventListener('error', handleError);
    };
  }, [onError]);

  const handleClick = () => {
    const clientId = Number(import.meta.env.VITE_TELEGRAM_CLIENT_ID);
    if (!Number.isSafeInteger(clientId) || clientId <= 0) {
      onError?.('Telegram login is not configured correctly.');
      return;
    }
    if (!sdkReady || !window.Telegram?.Login) {
      onError?.('Telegram login is still loading. Please try again in a moment.');
      return;
    }

    setLoading(true);
    try {
      window.Telegram.Login.auth(
        { client_id: clientId, scope: ['profile', 'write'] },
        (result) => {
          setLoading(false);
          if (result?.error) {
            onError?.(result.error);
            return;
          }
          if (!result?.id_token) {
            onError?.('Telegram login was cancelled.');
            return;
          }
          onAuth({ id_token: result.id_token });
        }
      );
    } catch {
      setLoading(false);
      onError?.('Telegram login could not be started. Please try again.');
    }
  };

  return (
    <button
      type="button"
      className="telegram-login-btn"
      onClick={handleClick}
      disabled={loading}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
        <path d="M21.94 4.63c.26-1.1-.83-1.98-1.86-1.56L2.4 10.36c-1.1.44-1.09 2 .02 2.42l4.4 1.67 1.7 5.46c.2.63 1 .82 1.46.34l2.55-2.66 4.62 3.4c.86.63 2.1.16 2.33-.88l3.46-15.48ZM8.53 13.3l9.1-6.72c.3-.22.63.17.37.43l-7.5 7.2c-.3.28-.48.66-.53 1.06l-.2 1.72-1.24-3.7Z" />
      </svg>
      <span>{loading ? 'កំពុងភ្ជាប់...' : '​បន្តជាមួយ Telegram'}</span>
    </button>
  );
}
