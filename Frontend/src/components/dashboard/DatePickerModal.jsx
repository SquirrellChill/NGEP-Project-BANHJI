import { X } from 'lucide-react';

const days = Array.from({ length: 31 }, (_, index) => index + 1);

export default function DatePickerModal({ onClose }) {
  return (
    <div className="modal-scrim" role="dialog" aria-modal="true" aria-label="Select date">
      <div className="date-picker-panel">
        <div className="modal-title-row">
          <h2>Select Date</h2>
          <button className="plain-icon-button" type="button" onClick={onClose} aria-label="Close date picker">
            <X size={19} />
          </button>
        </div>
        <div className="calendar-month">March 2026</div>
        <div className="calendar-grid">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <span className="calendar-weekday" key={`${day}-${index}`}>{day}</span>
          ))}
          {days.map((day) => (
            <button className={day === 15 ? 'selected' : ''} type="button" key={day} onClick={onClose}>
              {day}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
