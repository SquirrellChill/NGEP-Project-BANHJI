import { ArrowUpRight, Mic, TrendingUp } from 'lucide-react';
import Waveform from '../dashboard/Waveform';

export default function StitchShowcase() {
  return (
    <section className="stitch-showcase" aria-label="Product preview">
      <div className="showcase-profile-row">
        <div>
          <span>Today's Revenue</span>
          <strong>42,000 KHR</strong>
          <small>Equivalent: $10.25</small>
        </div>
        <TrendingUp size={26} />
      </div>
      <div className="showcase-voice-card">
        <span>
          <Mic size={24} />
        </span>
        <div>
          <strong>Voice-to-sales</strong>
          <small>speak transaction, AI does the match</small>
        </div>
        <ArrowUpRight size={20} />
      </div>
      <Waveform active />
      <div className="showcase-list">
        <p><b>Iced coffee x2</b><span>4,000 KHR</span></p>
        <p><b>Croissant x1</b><span>6,000 KHR</span></p>
      </div>
    </section>
  );
}
