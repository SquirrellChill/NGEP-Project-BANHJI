import { useEffect, useRef, useState } from 'react';

/**
 * A fully custom-styled Telegram login button.
 *
 * Telegram's auto-rendered widget is a cross-origin <iframe> — nothing
 * inside it (text, color, icon) can be styled with our CSS. So instead
 * of embedding that iframe, we load the same script WITHOUT a
 * data-telegram-login target (which makes it render nothing), which
 * exposes `window.Telegram.Login.auth(...)` — a JS function we call
 * ourselves from a plain <button> we fully control the markup/CSS of.
 *
 * Needs VITE_TELEGRAM_BOT_ID (the numeric part of the bot token, before
 * the colon — NOT the token itself, and NOT secret; it's public info
 * Telegram itself expects client-side). Get it from whichever bot token
 * you're currently using, e.g. token "8643306892:AAFa..." → bot id is
 * "8643306892".
 */
export default function TelegramLoginButton({ onAuth, onError }) {
  const scriptLoaded = useRef(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (scriptLoaded.current) return;
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.async = true;
    document.body.appendChild(script);
    scriptLoaded.current = true;
  }, []);
console.log('bot id:', import.meta.env.VITE_TELEGRAM_BOT_ID);
  const handleClick = () => {
    const botId = import.meta.env.VITE_TELEGRAM_BOT_ID;
    if (!botId) {
      onError?.('VITE_TELEGRAM_BOT_ID is not set in the frontend .env');
      return;
    }
    if (!window.Telegram?.Login) {
      onError?.('Telegram login script has not finished loading yet — try again in a moment.');
      return;
    }

    setLoading(true);
    window.Telegram.Login.auth(
      { bot_id: botId, request_access: 'write' },
      (user) => {
        setLoading(false);
        if (!user) {
          onError?.('Telegram login was cancelled.');
          return;
        }
        onAuth(user);
      }
    );
  };

  return (
    <button
      type="button"
      className="telegram-login-btn"
      onClick={handleClick}
      disabled={loading}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true">
        <path d="M21.94 4.63c.26-1.1-.83-1.98-1.86-1.56L2.4 10.36c-1.1.44-1.09 2 .02 2.42l4.4 1.67 1.7 5.46c.2.63 1 .82 1.46.34l2.55-2.66 4.62 3.4c.86.63 2.1.16 2.33-.88l3.46-15.48ZM8.53 13.3l9.1-6.72c.3-.22.63.17.37.43l-7.5 7.2c-.3.28-.48.66-.53 1.06l-.2 1.72-1.24-3.7Z"/>
      </svg>
      <span>{loading ? 'កំពុងភ្ជាប់...' : '​បន្តជាមួយ Telegram'}</span>
    </button>
  );
}