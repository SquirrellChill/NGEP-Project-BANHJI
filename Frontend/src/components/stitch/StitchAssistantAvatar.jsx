export default function StitchAssistantAvatar({ size = 'md' }) {
  return (
    <div className={`stitch-assistant-avatar ${size}`}>
      <div className="stitch-assistant-inner">
        <div className="stitch-assistant-head">
          <div className="stitch-assistant-face">
            <span />
            <b />
            <span />
          </div>
        </div>
      </div>
    </div>
  );
}
