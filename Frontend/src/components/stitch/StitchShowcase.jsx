import { ArrowUpRight, AudioLines, TrendingUp } from 'lucide-react';
import Waveform from '../dashboard/Waveform';

export default function StitchShowcase() {
  return (
    <section className="stitch-showcase" aria-label="Product preview">
      <div className="showcase-profile-row">
        <div>
          <span className="showcase-label">Today's Revenue</span>
          <strong className="showcase-amount">42,000 KHR</strong>
          <small className="showcase-sub">$10.25 USD</small>
        </div>
        <div className="showcase-trend-icon">
          <TrendingUp size={22} />
        </div>
      </div>

      <div className="showcase-voice-card">
        <span className="showcase-mic-badge">
          <AudioLines size={20} />
        </span>
        <div className="showcase-voice-info">
          <strong>Voice-to-Sales</strong>
          <small>Speak transaction, AI does the rest</small>
        </div>
        <ArrowUpRight size={18} className="showcase-arrow" />
      </div>

      <div className="showcase-waveform-box">
        <Waveform active />
      </div>

      <div className="showcase-list">
        <div className="showcase-item">
          <span>Iced Coffee × 2</span>
          <strong>4,000 KHR</strong>
        </div>
        <div className="showcase-item">
          <span>Croissant × 1</span>
          <strong>6,000 KHR</strong>
        </div>
      </div>
    </section>
  );
}