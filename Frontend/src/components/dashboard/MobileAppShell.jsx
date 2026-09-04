import BottomTabNav from './BottomTabNav';

export default function MobileAppShell({ children, activeTab, showBottomNav = true, className = '' }) {
  return (
    <div className={`mobile-page-bg ${className}`}>
      <div className="mobile-app-shell">
        <main className="mobile-app-content">{children}</main>
        {showBottomNav && <BottomTabNav activeTab={activeTab} />}
      </div>
    </div>
  );
}
