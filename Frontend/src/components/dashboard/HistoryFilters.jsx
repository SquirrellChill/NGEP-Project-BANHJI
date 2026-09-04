import { Calendar, ChevronDown } from 'lucide-react';

export default function HistoryFilters({ activeFilter, onChange, onPickDate }) {
  const filters = [
    ['today', 'Today'],
    ['week', 'This Week'],
    ['month', 'This Month'],
  ];

  return (
    <nav className="history-filter-bar" aria-label="Time period range">
      {filters.map(([value, label]) => (
        <button key={value} className={activeFilter === value ? 'active' : ''} type="button" onClick={() => onChange(value)}>
          {label}
        </button>
      ))}
      <button className="date-filter-button" type="button" onClick={onPickDate} aria-label="Custom date range">
        <Calendar size={16} />
        <ChevronDown size={14} />
      </button>
    </nav>
  );
}
