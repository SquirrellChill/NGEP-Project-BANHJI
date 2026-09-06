import { X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { formatLocalDate } from '../../utils/sales';

export default function DatePickerModal({ selectedDate = new Date(), onSelect, onClose }) {
  const { t } = useLanguage();
  const selected = selectedDate instanceof Date ? selectedDate : new Date(selectedDate);
  const current = Number.isNaN(selected.getTime()) ? new Date() : selected;
  const year = current.getFullYear();
  const month = current.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = Array.from({ length: daysInMonth }, (_, index) => index + 1);

  return (
    <div className="modal-scrim" role="dialog" aria-modal="true" aria-label={t('selectDate')}>
      <div className="date-picker-panel">
        <div className="modal-title-row">
          <h2>{t('selectDate')}</h2>
          <button className="plain-icon-button" type="button" onClick={onClose} aria-label={t('selectDate')}>
            <X size={19} />
          </button>
        </div>
        <input
          className="native-date-input"
          type="date"
          value={formatLocalDate(current)}
          onChange={(event) => onSelect(new Date(`${event.target.value}T00:00:00`))}
        />
        <div className="calendar-month">
          {current.toLocaleString('en-US', { month: 'long', year: 'numeric' })}
        </div>
        <div className="calendar-grid">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <span className="calendar-weekday" key={`${day}-${index}`}>{day}</span>
          ))}
          {Array.from({ length: firstDay }, (_, index) => (
            <span className="calendar-empty-day" key={`empty-${index}`} />
          ))}
          {days.map((day) => {
            const date = new Date(year, month, day);
            const selectedClass = formatLocalDate(date) === formatLocalDate(current) ? 'selected' : '';
            return (
              <button className={selectedClass} type="button" key={day} onClick={() => onSelect(date)}>
                {day}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
