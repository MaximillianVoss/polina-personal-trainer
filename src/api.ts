import { cleanCustomer, customerFields, customerName, validateCustomer, validTrainingDate } from './domain';
import type { Customer, CustomerInput, DataStore, Repository, Training, TrainingInput } from './types';

export const DEFAULT_API_BASE = 'https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/';
type JsonObject = Record<string, unknown>;
type Fetcher = typeof fetch;
const object = (value: unknown): JsonObject => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Неожиданный формат ответа API.');
  return value as JsonObject;
};
const string = (value: unknown): string => {
  if (typeof value !== 'string') throw new Error('Неожиданный формат строки в API.');
  return value;
};
const idString = (value: unknown): string => {
  if ((typeof value !== 'number' && typeof value !== 'string') || !/^\d+$/.test(String(value))) throw new Error('Неожиданный идентификатор API.');
  return String(value);
};

export function apiBase(value: string): string {
  const url = new URL(value);
  if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error('Некорректный адрес API.');
  return `${url.origin}${url.pathname.replace(/\/$/, '')}/`;
}

export function safeResourceUrl(value: string, base: string, resource: 'customers' | 'trainings'): string {
  const allowed = new URL(apiBase(base));
  const url = new URL(value, allowed);
  const prefix = `${allowed.pathname}${resource}/`;
  if (url.origin !== allowed.origin || url.username || url.password || url.search || url.hash || !url.pathname.startsWith(prefix) || !/^\d+$/.test(url.pathname.slice(prefix.length))) {
    throw new Error('API вернул недоверенную ссылку на ресурс.');
  }
  return url.href;
}

function resourceUrl(base: string, resource: 'customers' | 'trainings', id: string): string {
  return safeResourceUrl(`${apiBase(base)}${resource}/${idString(id)}`, base, resource);
}
function selfLink(record: JsonObject): string {
  return string(object(object(record._links).self).href);
}
function halItems(value: unknown, key: 'customers' | 'trainings'): unknown[] {
  const list = object(object(value)._embedded)[key];
  if (!Array.isArray(list)) throw new Error(`В API отсутствует HAL-список ${key}.`);
  return list;
}

export function normalizeCustomers(value: unknown, base: string): Customer[] {
  return halItems(value, 'customers').map(item => {
    const record = object(item);
    const url = safeResourceUrl(selfLink(record), base, 'customers');
    const fields = Object.fromEntries(customerFields.map(field => [field, string(record[field])])) as unknown as CustomerInput;
    return { ...fields, id: url.slice(url.lastIndexOf('/') + 1), url };
  });
}

function trainingFields(record: JsonObject): Pick<Training, 'date' | 'activity' | 'duration'> {
  const date = string(record.date);
  const activity = string(record.activity);
  const duration = typeof record.duration === 'number' ? record.duration : typeof record.duration === 'string' && /^\d+$/.test(record.duration) ? Number(record.duration) : NaN;
  if (!validTrainingDate(date) || !Number.isInteger(duration) || duration < 1 || duration > 1440) throw new Error('API вернул неверную дату или длительность тренировки.');
  return { date, activity, duration };
}

export function normalizeJoinedTrainings(value: unknown, base: string): Training[] {
  if (!Array.isArray(value)) throw new Error('Ожидался массив /gettrainings.');
  return value.map(item => {
    const record = object(item);
    const id = idString(record.id);
    const related = record.customer == null ? null : object(record.customer);
    return {
      ...trainingFields(record), id, url: resourceUrl(base, 'trainings', id),
      customerId: related ? idString(related.id) : null,
      customerName: related ? customerName({ firstname: string(related.firstname), lastname: string(related.lastname) }) : undefined,
    };
  });
}

export function normalizeHalTrainings(value: unknown, base: string): Training[] {
  return halItems(value, 'trainings').map(item => {
    const record = object(item);
    const url = safeResourceUrl(selfLink(record), base, 'trainings');
    // /trainings/{id}/customer — связь, а не URI /customers/{id}.
    // Без отдельного ответа этой связи идентификатор клиента неизвестен.
    return { ...trainingFields(record), id: url.slice(url.lastIndexOf('/') + 1), url, customerId: null };
  });
}

export async function requestJson(url: string, init: RequestInit = {}, fetcher: Fetcher = fetch): Promise<unknown> {
  const headers = new Headers(init.headers);
  headers.set('Accept', 'application/json');
  let response: Response;
  try { response = await fetcher(url, { ...init, headers, redirect: 'error', credentials: 'omit' }); }
  catch (error) {
    if (init.signal?.aborted) throw error;
    throw new Error('Сервис недоступен. Проверьте сеть, адрес API и разрешение CORS.');
  }
  if (!response.ok) throw new Error(`Ошибка API: HTTP ${response.status}. Изменения не подтверждены.`);
  if (response.status === 204 || response.status === 205) return undefined;
  const text = await response.text();
  if (!text.trim()) return undefined;
  try { return JSON.parse(text); } catch { throw new Error('API вернул неверный JSON.'); }
}

export class ApiRepository implements Repository {
  private readonly base: string;
  constructor(base = DEFAULT_API_BASE, private readonly fetcher: Fetcher = fetch) { this.base = apiBase(base); }

  private async customers(signal?: AbortSignal): Promise<Customer[]> {
    let next: string | undefined = `${this.base}customers`;
    const seen = new Set<string>();
    const customers = new Map<string, Customer>();
    while (next) {
      if (seen.has(next) || seen.size >= 100) throw new Error('Не удалось завершить загрузку страниц клиентов.');
      seen.add(next);
      const result = await requestJson(next, { signal }, this.fetcher);
      for (const customer of normalizeCustomers(result, this.base)) customers.set(customer.id, customer);
      const links = object(result)._links;
      const nextLink = links && object(links).next;
      next = nextLink ? string(object(nextLink).href) : undefined;
      if (next) {
        const url = new URL(next, this.base);
        const allowed = new URL(this.base);
        if (url.origin !== allowed.origin || url.username || url.password || url.hash || url.pathname !== `${allowed.pathname}customers` || [...url.searchParams.keys()].some(key => !['page', 'size', 'sort'].includes(key))) throw new Error('API вернул недоверенную ссылку следующей страницы.');
        next = url.href;
      }
    }
    return [...customers.values()];
  }

  async list(signal?: AbortSignal): Promise<DataStore> {
    const [customers, trainings] = await Promise.all([this.customers(signal), requestJson(`${this.base}gettrainings`, { signal }, this.fetcher)]);
    return { customers, trainings: normalizeJoinedTrainings(trainings, this.base) };
  }

  async saveCustomer(input: CustomerInput, id?: string): Promise<void> {
    const data = cleanCustomer(input);
    if (Object.keys(validateCustomer(data)).length) throw new Error('Проверьте поля клиента.');
    await requestJson(id ? resourceUrl(this.base, 'customers', id) : `${this.base}customers`, {
      method: id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data),
    }, this.fetcher);
  }
  async deleteCustomer(id: string): Promise<void> {
    await requestJson(resourceUrl(this.base, 'customers', id), { method: 'DELETE' }, this.fetcher);
  }
  async addTraining(input: TrainingInput): Promise<void> {
    if (!Number.isInteger(input.duration) || input.duration < 1 || input.duration > 1440 || !input.activity.trim() || input.activity.trim().length > 80 || !validTrainingDate(input.date)) throw new Error('Проверьте поля тренировки.');
    await requestJson(`${this.base}trainings`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: new Date(input.date).toISOString(), activity: input.activity.trim(), duration: input.duration, customer: resourceUrl(this.base, 'customers', input.customerId) }),
    }, this.fetcher);
  }
  async deleteTraining(id: string): Promise<void> {
    await requestJson(resourceUrl(this.base, 'trainings', id), { method: 'DELETE' }, this.fetcher);
  }
}
