import { describe, expect, it, vi } from 'vitest';
import { ApiRepository, normalizeCustomers, normalizeJoinedTrainings, normalizeHalTrainings, requestJson, safeResourceUrl } from '../src/api';

const base = 'https://trainer.example/api/';
const customer = { firstname: 'A', lastname: 'B', email: 'a@example.test', phone: '123', streetaddress: 'Road', postcode: '00100', city: 'City', _links: { self: { href: `${base}customers/42` } } };

describe('контракт API', () => {
  it('разбирает HAL клиентов и использует реальный self URL', () => {
    expect(normalizeCustomers({ _embedded: { customers: [customer] } }, base)[0]).toMatchObject({ id: '42', url: `${base}customers/42` });
    expect(normalizeCustomers({ _embedded: { customers: [] } }, base)).toEqual([]);
    expect(() => normalizeCustomers({ customers: [] }, base)).toThrow();
  });
  it('разбирает /gettrainings со вложенным клиентом и отсутствующей связью', () => {
    const items = normalizeJoinedTrainings([{ id: 10, date: '2026-10-05T10:00:00Z', duration: 60, activity: 'Gym', customer: { ...customer, id: 42 } }, { id: 11, date: '2026-10-05T11:00:00Z', duration: 20, activity: 'Run', customer: null }], base);
    expect(items[0]).toMatchObject({ id: '10', customerId: '42', customerName: 'A B' });
    expect(items[1].customerId).toBeNull();
    expect(() => normalizeJoinedTrainings({ _embedded: { trainings: [] } }, base)).toThrow();
  });
  it('различает HAL тренировок и связь /trainings/{id}/customer', () => {
    const items = normalizeHalTrainings({ _embedded: { trainings: [{ date: '2026-10-05T10:00:00Z', duration: 45, activity: 'Run', _links: { self: { href: `${base}trainings/10` }, customer: { href: `${base}trainings/10/customer` } } }] } }, base);
    expect(items[0]).toMatchObject({ id: '10', customerId: null });
    expect(() => normalizeJoinedTrainings([{ id: 1, date: 'bad', duration: 10, activity: 'Run' }], base)).toThrow();
  });
  it.each(['https://evil.example/api/customers/42', 'javascript:alert(1)', `${base}customers/42?reset=1`, `${base}customers/../trainings/42`, `${base}customers/42#other`])('отвергает недоверенную ссылку %s', url => {
    expect(() => safeResourceUrl(url, base, 'customers')).toThrow();
  });
  it('не читает JSON для 204 и пустого 201', async () => {
    const fetcher = vi.fn().mockResolvedValueOnce(new Response(null, { status: 204 })).mockResolvedValueOnce(new Response('', { status: 201 }));
    expect(await requestJson(base, {}, fetcher)).toBeUndefined();
    expect(await requestJson(base, {}, fetcher)).toBeUndefined();
  });
  it('сообщает HTTP-ошибку и повреждённый JSON', async () => {
    await expect(requestJson(base, {}, vi.fn().mockResolvedValue(new Response('secret body', { status: 500 })))).rejects.toThrow('HTTP 500');
    await expect(requestJson(base, {}, vi.fn().mockResolvedValue(new Response('wrong', { status: 200 })))).rejects.toThrow(/JSON/);
  });
  it('запись тренировки отправляет ссылку клиента и ISO, DELETE принимает 204', async () => {
    const fetcher = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    const repo = new ApiRepository(base, fetcher);
    await repo.addTraining({ customerId: '42', activity: 'Run', duration: 30, date: '2026-10-05T10:00:00Z' });
    expect(fetcher.mock.calls[0][0]).toBe(`${base}trainings`);
    expect(JSON.parse(fetcher.mock.calls[0][1].body)).toMatchObject({ customer: `${base}customers/42`, duration: 30 });
    await repo.deleteTraining('10');
    expect(fetcher.mock.calls[1][1].method).toBe('DELETE');
    expect(fetcher.mock.calls[1][1].redirect).toBe('error');
  });
  it('догружает HAL pagination и не следует внешней next-ссылке', async () => {
    const fetcher = vi.fn().mockImplementation((url: string) => {
      if (url.endsWith('gettrainings')) return Promise.resolve(new Response('[]'));
      if (url.includes('page=1')) return Promise.resolve(new Response(JSON.stringify({ _embedded: { customers: [] } })));
      return Promise.resolve(new Response(JSON.stringify({ _embedded: { customers: [customer] }, _links: { next: { href: `${base}customers?page=1` } } })));
    });
    expect((await new ApiRepository(base, fetcher).list()).customers).toHaveLength(1);
    expect(fetcher).toHaveBeenCalledTimes(3);
    const bad = vi.fn().mockImplementation((url: string) => Promise.resolve(new Response(url.endsWith('gettrainings') ? '[]' : JSON.stringify({ _embedded: { customers: [] }, _links: { next: { href: 'https://evil.example/api/customers' } } }))));
    await expect(new ApiRepository(base, bad).list()).rejects.toThrow(/ссылк/i);
    expect(bad.mock.calls.every(call => call[0].startsWith(base))).toBe(true);
  });
});
