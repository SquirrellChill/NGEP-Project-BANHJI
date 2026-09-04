import { LayoutDashboard, LogIn } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import StitchBrand from './StitchBrand';

export default function StitchPublicShell({ children, isAuthenticated = false }) {
  const navigate = useNavigate();

  return (
    <div className="stitch-public-page">
      <header className="stitch-public-header">
        <button className="brand-button" type="button" onClick={() => navigate('/')} aria-label="Go home">
          <StitchBrand compact />
        </button>
        <nav aria-label="Public navigation">
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          {isAuthenticated ? (
            <button className="stitch-primary-small" type="button" onClick={() => navigate('/dashboard')}>
              <LayoutDashboard size={16} />
              Dashboard
            </button>
          ) : (
            <button className="stitch-primary-small" type="button" onClick={() => navigate('/login')}>
              <LogIn size={16} />
              Sign In
            </button>
          )}
        </nav>
      </header>
      {children}
    </div>
  );
}
