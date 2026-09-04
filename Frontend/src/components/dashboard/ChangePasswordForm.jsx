import { Eye } from 'lucide-react';

export default function ChangePasswordForm() {
  return (
    <form className="profile-form password-form">
      {['Current Password', 'New Password', 'Confirm Password'].map((label) => (
        <label className="dash-field password-input-field" key={label}>
          <span>{label}</span>
          <div>
            <input type="password" placeholder="••••••••" />
            <button type="button" aria-label={`Toggle ${label.toLowerCase()} visibility`}>
              <Eye size={18} />
            </button>
          </div>
        </label>
      ))}
      <button className="primary-action full-width-action" type="button">Change Password</button>
    </form>
  );
}
