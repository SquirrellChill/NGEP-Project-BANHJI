export default function TextField({ label, error, ...props }) {
  return (
    <label className="text-field">
      <span className="text-field-label">{label}</span>
      <input className={`text-field-input ${error ? 'has-error' : ''}`} {...props} />
      {error && <span className="text-field-error">{error}</span>}
    </label>
  );
}