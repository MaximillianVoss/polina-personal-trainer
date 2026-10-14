import { cleanCustomer, customerFields, validateCustomer, validateTraining, validTrainingDate } from './domain';
import type { CustomerInput, DataStore, Repository, TrainingInput } from './types';

export const STORAGE_KEY = 'personal-trainer-demo-v1';
export const DEMO_DATE = '2026-10-05T09:00:00';

export function createSeed(): DataStore {
  return {
    customers: [
      { id: 'c1', firstname: 'Алина', lastname: 'Морозова', email: 'alina@example.test', phone: '+358 40 111 2233', streetaddress: 'Puistokatu 12', postcode: '00100', city: 'Helsinki' },
      { id: 'c2', firstname: 'Марк', lastname: 'Лаине', email: 'mark@example.test', phone: '+358 40 222 3344', streetaddress: 'Keskuskatu 4', postcode: '02100', city: 'Espoo' },
      { id: 'c3', firstname: 'София', lastname: 'Ким', email: 'sofia@example.test', phone: '+358 40 333 4455', streetaddress: 'Rantatie 7', postcode: '00150', city: 'Helsinki' },
      { id: 'c4', firstname: 'Даниэль', lastname: 'Хейккинен', email: 'daniel@example.test', phone: '+358 40 444 5566', streetaddress: 'Asematie 21', postcode: '01300', city: 'Vantaa' },
    ],
    trainings: [
      { id: 't1', customerId: 'c1', date: '2026-10-05T09:00:00', activity: 'Силовая тренировка', duration: 60 },
      { id: 't2', customerId: 'c2', date: '2026-10-05T11:30:00', activity: 'Бег', duration: 45 },
      { id: 't3', customerId: 'c3', date: '2026-10-06T10:00:00', activity: 'Йога', duration: 50 },
      { id: 't4', customerId: 'c4', date: '2026-10-07T16:00:00', activity: 'Силовая тренировка', duration: 60 },
      { id: 't5', customerId: 'c1', date: '2026-10-09T09:00:00', activity: 'Пилатес', duration: 40 },
      { id: 't6', customerId: 'c3', date: '2026-10-12T12:00:00', activity: 'Йога', duration: 50 },
    ],
  };
}

function checkStore(value: unknown): value is DataStore {
  if (!value || typeof value !== 'object') return false;
  const store = value as DataStore;
  if (!Array.isArray(store.customers) || !Array.isArray(store.trainings)) return false;
  const ids = new Set<string>();
  for (const customer of store.customers) {
    if (!customer || typeof customer.id !== 'string' || !customer.id || ids.has(customer.id) || !customerFields.every(field => typeof customer[field] === 'string')) return false;
    ids.add(customer.id);
  }
  const trainingIds = new Set<string>();
  for (const training of store.trainings) {
    if (!training || typeof training.id !== 'string' || !training.id || trainingIds.has(training.id) || typeof training.activity !== 'string' || typeof training.date !== 'string' || !validTrainingDate(training.date) || !Number.isInteger(training.duration) || training.duration < 1 || training.duration > 1440 || (training.customerId !== null && !ids.has(training.customerId))) return false;
    trainingIds.add(training.id);
  }
  return true;
}

export class DemoRepository implements Repository {
  constructor(private readonly storage: Pick<Storage, 'getItem' | 'setItem'>) {}

  async list(): Promise<DataStore> {
    const saved = this.storage.getItem(STORAGE_KEY);
    if (!saved) return createSeed();
    let value: unknown;
    try { value = JSON.parse(saved); } catch { throw new Error('Локальные данные повреждены. Используйте «Сбросить демо» для восстановления.'); }
    if (!checkStore(value)) throw new Error('Локальные данные повреждены. Используйте «Сбросить демо» для восстановления.');
    return value;
  }

  private persist(store: DataStore): void {
    try { this.storage.setItem(STORAGE_KEY, JSON.stringify(store)); }
    catch { throw new Error('Браузер не смог сохранить данные. Проверьте доступ к локальному хранилищу.'); }
  }

  async reset(): Promise<void> { this.persist(createSeed()); }

  async saveCustomer(input: CustomerInput, id?: string): Promise<void> {
    const cleaned = cleanCustomer(input);
    if (Object.keys(validateCustomer(cleaned)).length) throw new Error('Проверьте поля клиента.');
    const store = await this.list();
    if (id && !store.customers.some(customer => customer.id === id)) throw new Error('Клиент больше не существует.');
    const customer = { ...cleaned, id: id ?? `c-${crypto.randomUUID()}` };
    store.customers = id ? store.customers.map(item => item.id === id ? customer : item) : [...store.customers, customer];
    this.persist(store);
  }

  async deleteCustomer(id: string): Promise<void> {
    const store = await this.list();
    if (!store.customers.some(customer => customer.id === id)) throw new Error('Клиент больше не существует.');
    store.customers = store.customers.filter(customer => customer.id !== id);
    store.trainings = store.trainings.filter(training => training.customerId !== id);
    this.persist(store);
  }

  async addTraining(input: TrainingInput): Promise<void> {
    const store = await this.list();
    if (Object.keys(validateTraining(input, store.customers)).length) throw new Error('Проверьте поля тренировки.');
    store.trainings.push({ ...input, activity: input.activity.trim(), id: `t-${crypto.randomUUID()}` });
    this.persist(store);
  }

  async deleteTraining(id: string): Promise<void> {
    const store = await this.list();
    if (!store.trainings.some(training => training.id === id)) throw new Error('Тренировка больше не существует.');
    store.trainings = store.trainings.filter(training => training.id !== id);
    this.persist(store);
  }
}
