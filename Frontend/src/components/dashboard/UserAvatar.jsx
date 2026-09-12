import React from 'react';
import { useAuth } from '../../context/AuthContext';

const DEFAULT_AVATAR = '/avatars/avatar-1.png';

export default function UserAvatar({ size = 'md', initials = 'SB', src = null }) {
  const { user } = useAuth();
  const avatarSrc = src || user?.profile_picture || DEFAULT_AVATAR;

  return (
    <div className={`dash-avatar dash-avatar-${size}`} aria-label={`${initials} avatar`}>
      <img
        src={avatarSrc}
        alt={`${initials} avatar`}
        className="dash-avatar-image"
      />
    </div>
  );
}