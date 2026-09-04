export default function UserAvatar({ size = 'md', initials = 'SB' }) {
  return (
    <div className={`dash-avatar dash-avatar-${size}`} aria-label={`${initials} avatar`}>
      <svg viewBox="0 0 100 100" role="img" aria-hidden="true">
        <circle cx="50" cy="50" r="50" fill="#f43f5e" />
        <path d="M22 65C18 45 28 20 50 20C72 20 82 45 78 65" fill="#1f1815" />
        <path d="M30 45C30 35 38 32 50 32C62 32 70 35 70 45C70 58 62 68 50 68C38 68 30 58 30 45Z" fill="#c68a5c" />
        <path d="M28 40C32 30 40 28 50 28C60 28 68 30 72 40C68 37 62 36 57 37C55 35 45 35 43 37C38 36 32 37 28 40Z" fill="#1f1815" />
        <circle cx="22" cy="50" r="8" fill="#1f1815" />
        <circle cx="78" cy="50" r="8" fill="#1f1815" />
        <circle cx="43" cy="46" r="2.5" fill="#1f1815" />
        <circle cx="57" cy="46" r="2.5" fill="#1f1815" />
        <path d="M46 54C48 57 52 57 54 54" stroke="#1f1815" strokeLinecap="round" strokeWidth="2" />
        <path d="M30 70C30 65 38 64 50 64C62 64 70 65 70 70L76 90H24L30 70Z" fill="#e11d48" />
      </svg>
    </div>
  );
}
