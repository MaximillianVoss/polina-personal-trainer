import { describe, expect, it } from 'vitest';
import { DemoRepository, STORAGE_KEY, createSeed } from '../src/demo';

describe('локальная база', () => {
  it('даёт независимый детерминированный seed', () => {
    const first = createSeed();
    const second = createSeed();
    first.customers.pop();
    expect(second.customers).toHaveLength(4);
    expect(second.trainings).toHaveLength(6);
  });
  it('сохраняет добавление и редактирование клиента после перезагрузки', async () => {
    const repo = new DemoRepository(localStorage);
    await repo.saveCustomer({ ...createSeed().customers[0], firstname: 'Новый' });
    let data = await new DemoRepository(localStorage).list();
    const added = data.customers.find(customer => customer.firstname === 'Новый')!;
    expect(added.id).not.toBe('c1');
    await repo.saveCustomer({ ...added, city: 'Turku' }, added.id);
    data = await new DemoRepository(localStorage).list();
    expect(data.customers.find(customer => customer.id === added.id)?.city).toBe('Turku');
  });
  it('создаёт/удаляет тренировку; удаление клиента удаляет его тренировки', async () => {
    const repo = new DemoRepository(localStorage);
    await repo.addTraining({ customerId: 'c1', date: '2026-10-08T10:00:00Z', activity: 'Test', duration: 40 });
    let data = await repo.list();
    const added = data.trainings.find(training => training.activity === 'Test')!;
    await repo.deleteTraining(added.id);
    expect((await repo.list()).trainings).toHaveLength(6);
    await repo.deleteCustomer('c1');
    data = await repo.list();
    expect(data.customers).toHaveLength(3);
    expect(data.trainings.some(training => training.customerId === 'c1')).toBe(false);
  });
  it('не изменяет базу при неверном вводе', async () => {
    const repo = new DemoRepository(localStorage);
    await expect(repo.addTraining({ customerId: 'missing', date: 'bad', activity: '', duration: 0 })).rejects.toThrow();
    expect((await repo.list()).trainings).toHaveLength(6);
  });
  it('обнаруживает испорченные данные без тихого удаления; reset восстанавливает seed', async () => {
    localStorage.setItem(STORAGE_KEY, '{"customers":[]}');
    const repo = new DemoRepository(localStorage);
    await expect(repo.list()).rejects.toThrow(/повреждены/i);
    await repo.reset();
    expect((await repo.list()).customers).toHaveLength(4);
  });
});
