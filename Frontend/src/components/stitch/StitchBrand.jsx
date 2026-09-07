import { AudioLines } from 'lucide-react';

export default function StitchBrand({ compact = false }) {
  return (
    <div className={`stitch-brand ${compact ? 'compact' : ''}`}>
      <span className="stitch-brand-mark">
        <AudioLines size={compact ? 16 : 20} strokeWidth={2.4} />
      </span>
      <span>KOTCHOMNOL</span>
    </div>
  );
}
