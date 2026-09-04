import { Mic } from 'lucide-react';

export default function StitchBrand({ compact = false }) {
  return (
    <div className={`stitch-brand ${compact ? 'compact' : ''}`}>
      <span className="stitch-brand-mark">
        <Mic size={compact ? 16 : 20} strokeWidth={2.4} />
      </span>
      <span>KotChomnol</span>
    </div>
  );
}
