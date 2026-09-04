import { Bell } from 'lucide-react';
import UserAvatar from './UserAvatar';

export default function AppHeader({ profile }) {
  return (
    <header className="app-profile-header">
      <div className="app-profile-left">
        <UserAvatar />
        <div>
          <h1>{profile.name}</h1>
          <p>{profile.businessName}</p>
        </div>
      </div>
      <button className="notification-button" type="button" aria-label="Notifications">
        <Bell size={24} strokeWidth={1.8} />
        <span aria-hidden="true" />
      </button>
    </header>
  );
}
