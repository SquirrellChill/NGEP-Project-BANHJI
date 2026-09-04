const heights = [18, 30, 42, 24, 52, 34, 46, 20, 38, 56, 28, 44, 22, 36, 50, 26, 40, 30, 48, 24];

export default function Waveform({ active = false }) {
  return (
    <div className={`waveform ${active ? 'active' : ''}`} aria-hidden="true">
      {heights.map((height, index) => (
        <span key={index} style={{ height: `${height}px`, animationDelay: `${index * 60}ms` }} />
      ))}
    </div>
  );
}
