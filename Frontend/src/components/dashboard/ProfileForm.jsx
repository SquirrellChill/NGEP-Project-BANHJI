export default function ProfileForm({ profile }) {
  return (
    <form className="profile-form">
      <label className="dash-field">
        <span>Owner Name</span>
        <input defaultValue={profile.name} />
      </label>
      <label className="dash-field">
        <span>Business Name</span>
        <input defaultValue={profile.businessName} />
      </label>
      <label className="dash-field">
        <span>Phone Number</span>
        <input defaultValue={profile.phone} />
      </label>
      <label className="dash-field">
        <span>Email Address</span>
        <input type="email" defaultValue={profile.email} />
      </label>
      <label className="dash-field">
        <span>Address</span>
        <textarea defaultValue={profile.address} rows={3} />
      </label>
      <section className="screen-actions two-col">
        <button className="outline-action" type="reset">Cancel</button>
        <button className="primary-action" type="button">Save Changes</button>
      </section>
    </form>
  );
}
