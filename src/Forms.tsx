import { useState } from 'react';
import { cleanCustomer, customerFields, customerLabels, customerName, localDateTimeToIso, validateCustomer, validateTraining } from './domain';
import type { Customer, CustomerInput, FieldErrors, TrainingInput } from './types';

const emptyCustomer: CustomerInput = { firstname: '', lastname: '', email: '', phone: '', streetaddress: '', postcode: '', city: '' };

export function CustomerForm({ initial, onSubmit, onCancel, busy }: { initial?: Customer; onSubmit: (input: CustomerInput) => void; onCancel: () => void; busy: boolean }) {
  const [values, setValues] = useState<CustomerInput>(initial ?? emptyCustomer);
  const [errors, setErrors] = useState<FieldErrors>({});
  return <form aria-label="Форма клиента" noValidate onSubmit={event => {
    event.preventDefault();
    const cleaned = cleanCustomer(values);
    const nextErrors = validateCustomer(cleaned);
    setErrors(nextErrors);
    if (!Object.keys(nextErrors).length) onSubmit(cleaned);
  }}>
    <p className="form-note">Все поля обязательны. Адрес и контакты будут доступны в списке и CSV.</p>
    <div className="form-grid">{customerFields.map(field => <label key={field} className={field === 'streetaddress' ? 'full-width' : ''}>
      <span id={`label-${field}`}>{customerLabels[field]}</span>
      <input id={`customer-${field}`} aria-labelledby={`label-${field}`} type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'} value={values[field]} disabled={busy} autoComplete={field === 'email' ? 'email' : field === 'phone' ? 'tel' : field === 'firstname' ? 'given-name' : field === 'lastname' ? 'family-name' : field === 'streetaddress' ? 'street-address' : field === 'postcode' ? 'postal-code' : 'address-level2'} maxLength={field === 'postcode' ? 20 : field === 'phone' ? 40 : 120} aria-invalid={Boolean(errors[field])} aria-describedby={errors[field] ? `error-${field}` : undefined} onChange={event => setValues({ ...values, [field]: event.target.value })} />
      {errors[field] && <small className="field-error" id={`error-${field}`}>{errors[field]}</small>}
    </label>)}</div>
    <div className="dialog-actions"><button type="button" className="button secondary" disabled={busy} onClick={onCancel}>Отмена</button><button type="submit" className="button primary" disabled={busy}>{busy ? 'Сохраняем…' : 'Сохранить клиента'}</button></div>
  </form>;
}

export function TrainingForm({ customers, customerId, defaultDate, onSubmit, onCancel, busy }: { customers: Customer[]; customerId?: string; defaultDate: string; onSubmit: (input: TrainingInput) => void; onCancel: () => void; busy: boolean }) {
  const [values, setValues] = useState({ customerId: customerId ?? '', date: defaultDate, activity: '', duration: '60' });
  const [errors, setErrors] = useState<FieldErrors>({});
  return <form aria-label="Форма тренировки" noValidate onSubmit={event => {
    event.preventDefault();
    let date = '';
    try { date = localDateTimeToIso(values.date); } catch { /* Validation below displays the date error. */ }
    const input: TrainingInput = { customerId: values.customerId, date, activity: values.activity.trim(), duration: Number(values.duration) };
    const nextErrors = validateTraining(input, customers);
    setErrors(nextErrors);
    if (!Object.keys(nextErrors).length) onSubmit(input);
  }}>
    <p className="form-note">Дата и время указаны в часовом поясе вашего браузера. Длительность — в минутах.</p>
    <div className="form-grid">
      <label className="full-width"><span id="label-training-customer">Клиент</span><select aria-labelledby="label-training-customer" value={values.customerId} disabled={busy} aria-invalid={Boolean(errors.customerId)} aria-describedby={errors.customerId ? 'training-customer-error' : undefined} onChange={event => setValues({ ...values, customerId: event.target.value })}>
        <option value="">Выберите клиента</option>{[...customers].sort((a, b) => customerName(a).localeCompare(customerName(b), 'ru')).map(customer => <option key={customer.id} value={customer.id}>{customerName(customer)} · {customer.email}</option>)}
      </select>{errors.customerId && <small className="field-error" id="training-customer-error">{errors.customerId}</small>}</label>
      <label className="full-width"><span id="label-training-activity">Активность</span><input aria-labelledby="label-training-activity" value={values.activity} list="activities" maxLength={80} disabled={busy} placeholder="Например, силовая тренировка" aria-invalid={Boolean(errors.activity)} aria-describedby={errors.activity ? 'training-activity-error' : undefined} onChange={event => setValues({ ...values, activity: event.target.value })} />
        <datalist id="activities">{['Силовая тренировка', 'Бег', 'Йога', 'Пилатес', 'Плавание'].map(activity => <option key={activity} value={activity} />)}</datalist>{errors.activity && <small className="field-error" id="training-activity-error">{errors.activity}</small>}</label>
      <label><span id="label-training-date">Дата и время</span><input aria-labelledby="label-training-date" type="datetime-local" value={values.date} disabled={busy} aria-invalid={Boolean(errors.date)} aria-describedby={errors.date ? 'training-date-error' : undefined} onChange={event => setValues({ ...values, date: event.target.value })} />{errors.date && <small className="field-error" id="training-date-error">{errors.date}</small>}</label>
      <label><span id="label-training-duration">Длительность, мин</span><input aria-labelledby="label-training-duration" type="number" min="1" max="1440" step="1" value={values.duration} disabled={busy} aria-invalid={Boolean(errors.duration)} aria-describedby={errors.duration ? 'training-duration-error' : undefined} onChange={event => setValues({ ...values, duration: event.target.value })} />{errors.duration && <small className="field-error" id="training-duration-error">{errors.duration}</small>}</label>
    </div><div className="dialog-actions"><button type="button" className="button secondary" disabled={busy} onClick={onCancel}>Отмена</button><button type="submit" className="button primary" disabled={busy}>{busy ? 'Сохраняем…' : 'Добавить тренировку'}</button></div>
  </form>;
}
