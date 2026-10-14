import { calendarDays, customerName, dateKey } from './domain';
import type { CalendarView, Customer, Training } from './types';

export function Calendar({ anchor, view, customers, trainings, onAnchor, onView, onSelect }: { anchor: Date; view: CalendarView; customers: Customer[]; trainings: Training[]; onAnchor: (date: Date) => void; onView: (view: CalendarView) => void; onSelect: (training: Training) => void }) {
  const days = calendarDays(anchor, view);
  const label = view === 'month' ? new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' }).format(anchor) : `${days[0].toLocaleDateString('ru-RU')} — ${days[6].toLocaleDateString('ru-RU')}`;
  const customerMap = new Map(customers.map(customer => [customer.id, customerName(customer)]));
  function move(direction: number) {
    onAnchor(view === 'month' ? new Date(anchor.getFullYear(), anchor.getMonth() + direction, 1) : new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate() + direction * 7));
  }
  return <section className="panel calendar-panel" aria-label="Календарь тренировок">
    <div className="calendar-toolbar"><div className="calendar-pagination"><button className="icon-button" onClick={() => move(-1)} aria-label="Предыдущий период">‹</button><h2 aria-live="polite">{label}</h2><button className="icon-button" onClick={() => move(1)} aria-label="Следующий период">›</button><button className="button secondary small" onClick={() => onAnchor(new Date())}>Сегодня</button></div>
      <div className="segments" role="group" aria-label="Вид календаря"><button aria-pressed={view === 'month'} onClick={() => onView('month')}>Месяц</button><button aria-pressed={view === 'week'} onClick={() => onView('week')}>Неделя</button></div>
    </div>
    <p className="calendar-note">Местное время браузера · нажмите тренировку, чтобы увидеть подробности</p>
    <div className="calendar-scroll" tabIndex={0} aria-label="Прокручиваемая сетка календаря"><div className={`calendar-grid ${view}`}>
      {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => <div className="weekday" key={day}>{day}</div>)}
      {days.map(day => {
        const key = dateKey(day);
        const events = trainings.filter(training => dateKey(new Date(training.date)) === key).sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
        return <div className={`calendar-day ${day.getMonth() !== anchor.getMonth() && view === 'month' ? 'outside' : ''} ${key === dateKey(new Date()) ? 'today' : ''}`} key={key} aria-label={day.toLocaleDateString('ru-RU', { dateStyle: 'full' })}>
          <span className="day-number">{day.getDate()}</span>
          {events.map(training => {
            const name = customerMap.get(training.customerId ?? '') ?? training.customerName ?? 'Клиент не указан';
            const time = new Date(training.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
            return <button className="calendar-event" key={training.id} onClick={() => onSelect(training)} aria-label={`${training.activity}, ${name}, ${day.toLocaleDateString('ru-RU')} ${time}`}><span><b>{time}</b> · {training.duration} мин</span><strong>{training.activity}</strong><small>{name}</small></button>;
          })}
        </div>;
      })}
    </div></div>
  </section>;
}
