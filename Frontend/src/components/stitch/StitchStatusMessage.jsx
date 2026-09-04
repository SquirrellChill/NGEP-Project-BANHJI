export default function StitchStatusMessage({ type = 'info', children }) {
  if (!children) return null;
  return <div className={`stitch-status ${type}`}>{children}</div>;
}
