import { describe, expect, it } from 'vitest';
import { activityTotals, calendarDays, csvCell, customersCsv, filterCustomers, localDateTimeToIso, validateCustomer, validateTraining, validTrainingDate } from '../src/domain';
import { createSeed } from '../src/demo';

describe('проверка пользовательских данных', () => {
  it('проверяет все поля клиента, email и пробелы', () => {
    const customer = createSeed().customers[0];
    expect(validateCustomer(customer)).toEqual({});
    expect(validateCustomer({ ...customer, firstname: '  ', email: 'wrong' })).toEqual({ firstname: 'Заполните поле.', email: 'Введите корректный email.' });
  });
  it('не разрешает неизвестного клиента и отрицательную длительность', () => {
    expect(validateTraining({ customerId: 'missing', activity: '', duration: -5, date: 'bad' }, createSeed().customers)).toHaveProperty('customerId');
    expect(validateTraining({ customerId: 'c1', activity: 'Yoga', duration: 0.5, date: '2026-10-05T10:00:00Z' }, createSeed().customers)).toHaveProperty('duration');
    expect(validateTraining({ customerId: 'c1', activity: 'Yoga', duration: 60, date: '2026-10-05T10:00:00Z' }, createSeed().customers)).toEqual({});
  });
  it('переводит местную дату в ISO, сохраняя местные часы', () => {
    const iso = localDateTimeToIso('2026-10-05T09:30');
    const date = new Date(iso);
    expect([date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes()]).toEqual([2026, 9, 5, 9, 30]);
  });
  it.each(['', '2026-02-30T12:00', '2026-13-01T09:00', '2026-10-05T25:00'])('отвергает недействительную дату %s', value => {
    expect(() => localDateTimeToIso(value)).toThrow();
  });
  it('не допускает автоматический перенос 30 февраля и учитывает високосный год', () => {
    expect(validTrainingDate('2026-02-30T12:00:00Z')).toBe(false);
    expect(validTrainingDate('2026-02-29T12:00:00Z')).toBe(false);
    expect(validTrainingDate('2028-02-29T12:00:00+02:00')).toBe(true);
  });
});

describe('поиск, календарь и статистика', () => {
  it('ищет без регистра и сортирует данные без изменения исходника', () => {
    const customers = createSeed().customers;
    const before = customers.map(customer => customer.id);
    expect(filterCustomers(customers, 'АЛИНА', 'name', 'asc')).toHaveLength(1);
    expect(filterCustomers(customers, 'helsinki', 'city', 'asc')).toHaveLength(2);
    expect(customers.map(customer => customer.id)).toEqual(before);
  });
  it('даёт месяц с 42 днями с понедельника и переходом года', () => {
    const days = calendarDays(new Date(2026, 0, 1), 'month');
    expect(days).toHaveLength(42);
    expect(days[0].getDay()).toBe(1);
    expect(days[0].getFullYear()).toBe(2025);
    expect(new Set(days.map(day => day.toDateString())).size).toBe(42);
  });
  it('даёт семь дней текущей недели для воскресенья', () => {
    const days = calendarDays(new Date(2026, 9, 11), 'week');
    expect(days).toHaveLength(7);
    expect(days[0].getDate()).toBe(5);
    expect(days[6].getDate()).toBe(11);
  });
  it('суммирует минуты по виду активности, пустой набор = пустой список', () => {
    const seed = createSeed();
    const totals = activityTotals(seed.trainings);
    expect(totals.reduce((sum, total) => sum + total.minutes, 0)).toBe(seed.trainings.reduce((sum, training) => sum + training.duration, 0));
    expect(totals.find(item => item.activity === 'Силовая тренировка')).toMatchObject({ minutes: 120, sessions: 2 });
    expect(activityTotals([])).toEqual([]);
  });
});

describe('CSV', () => {
  it('экранирует кавычки, разделители и переносы', () => { expect(csvCell('A,"B"\nC')).toBe('"A,""B""\nC"'); });
  it.each(['=1+1', '+SUM(A1)', '-2+3', '@cmd', '  =1', '\tcmd'])('не позволяет формуле выполняться: %s', value => {
    expect(csvCell(value)).toMatch(/^"'/);
  });
  it('добавляет UTF-8 BOM, заголовки и все контакты', () => {
    const csv = customersCsv(createSeed().customers);
    expect(csv.startsWith('\uFEFF')).toBe(true);
    expect(csv).toContain('"Email"');
    expect(csv).toContain('alina@example.test');
    expect(csv.split('\r\n')).toHaveLength(5);
  });
});
