import { useEffect, useRef } from 'react';

export default function TelegramLoginButton({ onAuth, onError }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const clientId = Number(import.meta.env.VITE_TELEGRAM_CLIENT_ID);
    if (!Number.isSafeInteger(clientId) || clientId <= 0) {
      onError?.('Telegram login is not configured correctly.');
      return;
    }

    // Define the global auth callback expected by the Telegram widget
    window.onTelegramAuth = (data) => {
      if (data?.id_token) {
        onAuth({ id_token: data.id_token });
      } else {
        onError?.('Telegram login failed or was cancelled.');
      }
    };

    // Clean previous widget if any
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    // Create and attach the Telegram official widget script
    const script = document.createElement('script');
    script.src = 'https://oauth.telegram.org/js/telegram-login.js?6';
    script.async = true;
    script.setAttribute('data-client-id', String(clientId));
    script.setAttribute('data-onauth', 'onTelegramAuth(data)');
    script.setAttribute('data-request-access', 'write');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '12');

    script.onerror = () => {
      onError?.('Failed to load Telegram widget.');
    };

    containerRef.current?.appendChild(script);

    return () => {
      delete window.onTelegramAuth;
    };
  }, [onAuth, onError]);

  return (
    <div
      ref={containerRef}
      style={{
        display: 'flex',
        justifyContent: 'center',
        margin: '12px 0',
        minHeight: '44px',
      }}
    />
  );
}