import './Button.css';

export default function Button({ children, loading, variant = 'primary', className = '', ...props }) {
  return (
    <button className={`btn btn-${variant} ${className}`} disabled={loading} {...props}>
      {loading ? 'Please wait…' : children}
    </button>
  );
}