import type { CalendarView, Customer, CustomerInput, CustomerSort, FieldErrors, Training, TrainingInput } from './types';

export const customerFields: (keyof CustomerInput)[] = ['firstname', 'lastname', 'email', 'phone', 'streetaddress', 'postcode', 'city'];
export const customerLabels: Record<keyof CustomerInput, string> = {
  firstname: 'Имя', lastname: 'Фамилия', email: 'Email', phone: 'Телефон',
  streetaddress: 'Улица и дом', postcode: 'Почтовый индекс', city: 'Город',
};
export const customerName = (customer: Pick<Customer, 'firstname' | 'lastname'>): string => `${customer.firstname} ${customer.lastname}`.trim();

export function cleanCustomer(input: CustomerInput): CustomerInput {
  return Object.fromEntries(customerFields.map(key => [key, input[key].trim()])) as unknown as CustomerInput;
}

export function validateCustomer(input: CustomerInput): FieldErrors {
  const errors: FieldErrors = {};
  for (const field of customerFields) {
    const value = input[field].trim();
    if (!value) errors[field] = 'Заполните поле.';
    else if (value.length > (field === 'postcode' ? 20 : field === 'phone' ? 40 : 120)) errors[field] = 'Слишком длинное значение.';
  }
  if (input.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email.trim())) errors.email = 'Введите корректный email.';
  if (input.phone.trim() && !/^[+()\d\s.-]{3,40}$/.test(input.phone.trim())) errors.phone = 'Используйте цифры, +, пробелы или скобки.';
  return errors;
}

export function validateTraining(input: TrainingInput, customers: Customer[]): FieldErrors {
  const errors: FieldErrors = {};
  if (!customers.some(customer => customer.id === input.customerId)) errors.customerId = 'Выберите существующего клиента.';
  if (!input.activity.trim() || input.activity.trim().length > 80) errors.activity = 'Введите активность от 1 до 80 символов.';
  if (!Number.isInteger(input.duration) || input.duration < 1 || input.duration > 1440) errors.duration = 'Введите целое число от 1 до 1440 минут.';
  if (!validTrainingDate(input.date)) errors.date = 'Укажите корректную дату и время.';
  return errors;
}

export function validTrainingDate(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?$/.exec(value);
  if (!match) return false;
  const [year, month, day, hours, minutes, seconds = 0] = match.slice(1).map(value => value === undefined ? 0 : Number(value));
  return year >= 100 && month >= 1 && month <= 12 && day >= 1 && day <= new Date(year, month, 0).getDate() && hours <= 23 && minutes <= 59 && seconds <= 59 && Number.isFinite(Date.parse(value));
}

export function localDateTimeToIso(value: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value);
  if (!match) throw new Error('Укажите корректную дату и время.');
  const [year, month, day, hours, minutes] = match.slice(1).map(Number);
  const date = new Date(year, month - 1, day, hours, minutes);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day || date.getHours() !== hours || date.getMinutes() !== minutes) {
    throw new Error('Такого местного времени не существует.');
  }
  return date.toISOString();
}

export function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export const localDateTimeValue = (date: Date): string => `${dateKey(date)}T${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
export const formatDate = (value: string): string => new Intl.DateTimeFormat('ru-RU', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value));

export function calendarDays(anchor: Date, view: CalendarView): Date[] {
  const start = view === 'month' ? new Date(anchor.getFullYear(), anchor.getMonth(), 1) : new Date(anchor.getFullYear(), anchor.getMonth(), anchor.getDate());
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  return Array.from({ length: view === 'month' ? 42 : 7 }, (_, index) => new Date(start.getFullYear(), start.getMonth(), start.getDate() + index));
}

export function filterCustomers(customers: Customer[], search: string, sort: CustomerSort, direction: 'asc' | 'desc'): Customer[] {
  const query = search.trim().toLocaleLowerCase('ru-RU');
  const value = (customer: Customer) => sort === 'name' ? customerName(customer) : customer[sort];
  return customers.filter(customer => Object.values(cleanCustomer(customer)).some(field => field.toLocaleLowerCase('ru-RU').includes(query)))
    .sort((a, b) => (direction === 'asc' ? 1 : -1) * value(a).localeCompare(value(b), 'ru', { sensitivity: 'base' }));
}

export function activityTotals(trainings: Training[]): { activity: string; minutes: number; sessions: number }[] {
  const groups = new Map<string, { activity: string; minutes: number; sessions: number }>();
  for (const training of trainings) {
    const total = groups.get(training.activity) ?? { activity: training.activity, minutes: 0, sessions: 0 };
    total.minutes += training.duration;
    total.sessions += 1;
    groups.set(training.activity, total);
  }
  return [...groups.values()].sort((a, b) => b.minutes - a.minutes || a.activity.localeCompare(b.activity, 'ru'));
}

export function csvCell(value: unknown): string {
  let text = String(value ?? '');
  if (/^[\s]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}
export function customersCsv(customers: Customer[]): string {
  const rows = [customerFields.map(field => customerLabels[field]), ...customers.map(customer => customerFields.map(field => customer[field]))];
  return `\uFEFF${rows.map(row => row.map(csvCell).join(',')).join('\r\n')}`;
}
export function downloadCsv(customers: Customer[]): void {
  const url = URL.createObjectURL(new Blob([customersCsv(customers)], { type: 'text/csv;charset=utf-8;' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'personal-trainer-customers.csv';
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
