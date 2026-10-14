import { useEffect, useMemo, useState } from 'react';
import { ApiRepository, DEFAULT_API_BASE, apiBase } from './api';
import { Calendar } from './Calendar';
import { DemoRepository, DEMO_DATE } from './demo';
import { Dialog } from './Dialog';
import { CustomerForm, TrainingForm } from './Forms';
import { activityTotals, customerName, downloadCsv, filterCustomers, formatDate, localDateTimeValue } from './domain';
import type { CalendarView, Customer, CustomerSort, DataStore, Repository, Training } from './types';

type Page = 'customers' | 'trainings' | 'calendar' | 'statistics';
type Modal = { kind: 'customer'; customer?: Customer } | { kind: 'training'; customerId?: string } | { kind: 'deleteCustomer'; customer: Customer } | { kind: 'deleteTraining' | 'detail'; training: Training };
const pages: { id: Page; name: string; icon: string }[] = [
  { id: 'customers', name: 'Клиенты', icon: '◎' }, { id: 'trainings', name: 'Тренировки', icon: '↗' },
  { id: 'calendar', name: 'Календарь', icon: '▦' }, { id: 'statistics', name: 'Статистика', icon: '▥' },
];
const pageInfo: Record<Page, { title: string; description: string }> = {
  customers: { title: 'Люди, которых вы тренируете', description: 'Контакты, планы и следующий шаг — в одном пространстве.' },
  trainings: { title: 'Каждая тренировка имеет значение', description: 'Планируйте занятия и связывайте их с конкретными клиентами.' },
  calendar: { title: 'Ваш ритм на неделю и месяц', description: 'Расписание помогает видеть нагрузку и находить свободное время.' },
  statistics: { title: 'Время, вложенное в движение', description: 'Общая длительность по активности для всех сохранённых тренировок.' },
};
const errorMessage = (error: unknown): string => error instanceof Error ? error.message : 'Не удалось выполнить действие.';

export default function App({ repository: provided, enableLive = import.meta.env.VITE_ENABLE_LIVE_API === 'true', apiUrl = import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE }: { repository?: Repository; enableLive?: boolean; apiUrl?: string }) {
  const [mode, setMode] = useState<'demo' | 'api'>('demo');
  const [page, setPage] = useState<Page>('customers');
  const [data, setData] = useState<DataStore>({ customers: [], trainings: [] });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [reload, setReload] = useState(0);
  const [modal, setModal] = useState<Modal | null>(null);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<CustomerSort>('name');
  const [direction, setDirection] = useState<'asc' | 'desc'>('asc');
  const [trainingQuery, setTrainingQuery] = useState('');
  const [trainingSort, setTrainingSort] = useState('date-asc');
  const [anchor, setAnchor] = useState(new Date(DEMO_DATE));
  const [calendarView, setCalendarView] = useState<CalendarView>('month');
  const repository = useMemo(() => provided ?? (mode === 'demo' ? new DemoRepository(window.localStorage) : new ApiRepository(apiUrl)), [provided, mode, apiUrl]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true); setError(''); setData({ customers: [], trainings: [] });
    repository.list(controller.signal).then(next => { if (!controller.signal.aborted) setData(next); })
      .catch(error => { if (!controller.signal.aborted) setError(errorMessage(error)); })
      .finally(() => { if (!controller.signal.aborted) setLoading(false); });
    return () => controller.abort();
  }, [repository, reload]);

  const customerMap = new Map(data.customers.map(customer => [customer.id, customer]));
  const trainingCustomer = (training: Training): string => {
    const customer = customerMap.get(training.customerId ?? '');
    return customer ? customerName(customer) : training.customerName ?? 'Клиент не указан';
  };
  const customers = filterCustomers(data.customers, query, sort, direction);
  const trainings = data.trainings.filter(training => `${training.activity} ${trainingCustomer(training)}`.toLocaleLowerCase('ru-RU').includes(trainingQuery.trim().toLocaleLowerCase('ru-RU')))
    .sort((a, b) => trainingSort === 'date-desc' ? Date.parse(b.date) - Date.parse(a.date) : trainingSort === 'duration-desc' ? b.duration - a.duration : trainingSort === 'activity' ? a.activity.localeCompare(b.activity, 'ru') : Date.parse(a.date) - Date.parse(b.date));
  const totals = activityTotals(data.trainings);
  const totalMinutes = data.trainings.reduce((sum, training) => sum + training.duration, 0);
  const disabled = loading || busy;

  async function mutate(action: () => Promise<void>, success: string) {
    if (busy) return;
    if (mode === 'api' && !window.confirm('Это изменит ОБЩУЮ учебную базу преподавателя. Изменения видны другим пользователям. Продолжить только при разрешении на такую запись?')) return;
    setBusy(true); setError(''); setNotice('');
    try {
      await action();
      setModal(null); setNotice(success);
      try { setData(await repository.list()); }
      catch (error) { setError(`Операция выполнена, но список не обновился: ${errorMessage(error)} Нажмите «Обновить».`); }
    } catch (error) { setError(errorMessage(error)); }
    finally { setBusy(false); }
  }

  function switchMode(next: 'demo' | 'api') {
    if (next === mode || disabled) return;
    if (next === 'api') {
      try { apiBase(apiUrl); } catch { setError('Проверьте VITE_API_BASE_URL в .env.local.'); return; }
      if (!window.confirm('Подключить общий API преподавателя? Чтение загрузит его данные. Любая последующая запись требует отдельного подтверждения. Для практики используйте демо.')) return;
    }
    setModal(null); setNotice(''); setQuery(''); setTrainingQuery(''); setAnchor(next === 'demo' ? new Date(DEMO_DATE) : new Date()); setMode(next);
  }

  const title = modal?.kind === 'customer' ? modal.customer ? 'Редактировать клиента' : 'Новый клиент' : modal?.kind === 'training' ? 'Новая тренировка' : modal?.kind === 'deleteCustomer' ? 'Удалить клиента?' : modal?.kind === 'deleteTraining' ? 'Удалить тренировку?' : 'Подробности тренировки';

  return <>
    <div className="app-shell" inert={Boolean(modal)}>
      <header className="site-header"><a className="brand" href="#" onClick={event => { event.preventDefault(); setPage('customers'); }}><span className="brand-mark" aria-hidden="true">pt<span>•</span></span><span>Personal Trainer<small>Пространство для прогресса</small></span></a><div className="header-meta"><span className={`mode-badge ${mode}`}><i />{mode === 'demo' ? 'Демо · локально' : 'API · общая база'}</span>{enableLive && <div className="segments" role="group" aria-label="Источник данных"><button disabled={disabled} aria-pressed={mode === 'demo'} onClick={() => switchMode('demo')}>Демо</button><button disabled={disabled} aria-pressed={mode === 'api'} onClick={() => switchMode('api')}>API</button></div>}<button className="button secondary small" onClick={() => setReload(value => value + 1)} disabled={disabled}>Обновить</button></div></header>
      <nav className="page-nav" aria-label="Разделы приложения">{pages.map(item => <button key={item.id} aria-current={page === item.id ? 'page' : undefined} onClick={() => { setPage(item.id); setNotice(''); }}><span aria-hidden="true">{item.icon}</span>{item.name}</button>)}</nav>
      <main id="main-content">
        <div className="intro"><div><p className="eyebrow">СОБРАННО. ПОНЯТНО. ПО ПЛАНУ.</p><h1>{pageInfo[page].title}</h1><p>{pageInfo[page].description}</p></div><div className="intro-emblem" aria-hidden="true">↗<span>MOVE<br />FORWARD</span></div></div>
        <div className={`mode-note ${mode}`}>{mode === 'demo' ? <><span aria-hidden="true">◉</span><p><strong>Учебный деморежим.</strong> Все изменения сохраняются только в этом браузере. Начальные занятия — 5–12 октября 2026.</p></> : <><span aria-hidden="true">!</span><p><strong>Общая база преподавателя.</strong> Добавление, редактирование и удаление влияют на других пользователей. Удаление клиента удаляет и его тренировки.</p></>}</div>
        {error && <div className="message error" role="alert"><p>{error}</p><button className="button secondary small" onClick={() => setReload(value => value + 1)} disabled={disabled}>Повторить загрузку</button></div>}
        {notice && <div className="message success" role="status">{notice}<button className="icon-button" onClick={() => setNotice('')} aria-label="Скрыть уведомление">×</button></div>}
        <section className="summary-grid" aria-label="Обзор"><div className="summary-card"><span>Клиенты</span><strong>{loading ? '…' : data.customers.length}<small> в работе</small></strong></div><div className="summary-card"><span>Тренировки</span><strong>{loading ? '…' : data.trainings.length}<small> в расписании</small></strong></div><div className="summary-card"><span>Общее время</span><strong>{loading ? '…' : totalMinutes}<small> минут</small></strong></div><div className="summary-card accent"><span>Виды активности</span><strong>{loading ? '…' : totals.length}<small> для движения</small></strong></div></section>
        {loading ? <section className="panel empty-state" role="status"><span className="loading-dot" />Загружаем клиентов и тренировки…</section> : <>
          {page === 'customers' && <section className="panel" aria-label="Список клиентов"><div className="panel-heading"><div><h2>Клиентская база <span className="count-pill">{data.customers.length}</span></h2><p>От первого знакомства до следующей тренировки.</p></div><div className="actions"><button className="button secondary" disabled={busy || !customers.length} onClick={() => { downloadCsv(customers); setNotice(`CSV содержит клиентов: ${customers.length}.`); }}>↓ Экспорт CSV</button><button className="button primary" disabled={busy} onClick={() => setModal({ kind: 'customer' })}>+ Новый клиент</button></div></div>
            <div className="filter-bar"><label className="search-field"><span className="sr-only">Поиск клиентов</span><span aria-hidden="true">⌕</span><input aria-label="Поиск клиентов" type="search" placeholder="Имя, город, адрес или контакт…" value={query} onChange={event => setQuery(event.target.value)} /></label><label className="sort-label">Сортировка<select aria-label="Сортировать клиентов" value={sort} onChange={event => setSort(event.target.value as CustomerSort)}><option value="name">По имени</option><option value="city">По городу</option><option value="email">По email</option></select></label><button className="button secondary sort-direction" aria-label={direction === 'asc' ? 'По возрастанию: изменить' : 'По убыванию: изменить'} onClick={() => setDirection(direction === 'asc' ? 'desc' : 'asc')}>{direction === 'asc' ? 'А → Я' : 'Я → А'}</button></div>
            {!customers.length ? <div className="empty-state"><h3>{data.customers.length ? 'Ничего не найдено' : 'Пока нет клиентов'}</h3><p>{data.customers.length ? 'Попробуйте другой запрос или очистите поиск.' : 'Добавьте первого клиента, чтобы запланировать тренировку.'}</p>{query && <button className="button secondary" onClick={() => setQuery('')}>Очистить поиск</button>}</div> : <div className="table-scroll"><table><thead><tr><th>Клиент</th><th>Контакты</th><th>Адрес</th><th>Тренировки</th><th><span className="sr-only">Действия</span></th></tr></thead><tbody>{customers.map(customer => <tr key={customer.id}><td><div className="person"><span className="avatar" aria-hidden="true">{customer.firstname.slice(0, 1)}{customer.lastname.slice(0, 1)}</span><strong>{customerName(customer)}</strong></div></td><td><a href={`mailto:${customer.email}`}>{customer.email}</a><small>{customer.phone}</small></td><td>{customer.city}<small>{customer.streetaddress}, {customer.postcode}</small></td><td><span className="count-pill">{data.trainings.filter(training => training.customerId === customer.id).length}</span></td><td><div className="row-actions"><button disabled={busy} className="text-button" aria-label={`Тренировка для ${customerName(customer)}`} onClick={() => setModal({ kind: 'training', customerId: customer.id })}>+ Занятие</button><button disabled={busy} className="text-button" aria-label={`Редактировать ${customerName(customer)}`} onClick={() => setModal({ kind: 'customer', customer })}>Править</button><button disabled={busy} className="text-button danger" aria-label={`Удалить ${customerName(customer)}`} onClick={() => setModal({ kind: 'deleteCustomer', customer })}>Удалить</button></div></td></tr>)}</tbody></table></div>}
            <div className="panel-foot">Показано {customers.length} из {data.customers.length}. CSV экспортирует текущий список с учётом поиска и сортировки.</div>
          </section>}
          {page === 'trainings' && <section className="panel" aria-label="Список тренировок"><div className="panel-heading"><div><h2>План тренировок <span className="count-pill">{data.trainings.length}</span></h2><p>Клиент, активность и время каждого занятия.</p></div><button className="button primary" disabled={busy || !data.customers.length} onClick={() => setModal({ kind: 'training' })}>+ Новая тренировка</button></div>
            {!data.customers.length && <p className="form-note">Для новой тренировки сначала добавьте клиента.</p>}
            <div className="filter-bar"><label className="search-field"><span className="sr-only">Поиск тренировок</span><span aria-hidden="true">⌕</span><input aria-label="Поиск тренировок" type="search" placeholder="Активность или имя клиента…" value={trainingQuery} onChange={event => setTrainingQuery(event.target.value)} /></label><label className="sort-label">Сортировка<select aria-label="Сортировать тренировки" value={trainingSort} onChange={event => setTrainingSort(event.target.value)}><option value="date-asc">Дата: по возрастанию</option><option value="date-desc">Дата: по убыванию</option><option value="duration-desc">Длительность: по убыванию</option><option value="activity">По активности</option></select></label></div>
            {!trainings.length ? <div className="empty-state"><h3>{data.trainings.length ? 'Тренировки не найдены' : 'Расписание пока свободно'}</h3><p>{data.trainings.length ? 'Измените поиск, чтобы увидеть другие занятия.' : 'Добавьте занятие — оно появится и в календаре.'}</p>{trainingQuery && <button className="button secondary" onClick={() => setTrainingQuery('')}>Очистить поиск</button>}</div> : <div className="table-scroll"><table><thead><tr><th>Дата и время</th><th>Активность</th><th>Клиент</th><th>Длительность</th><th><span className="sr-only">Действия</span></th></tr></thead><tbody>{trainings.map(training => <tr key={training.id}><td><button className="text-button date-link" onClick={() => setModal({ kind: 'detail', training })}>{formatDate(training.date)}</button></td><td><span className="activity-tag">{training.activity}</span></td><td>{trainingCustomer(training)}</td><td><strong>{training.duration}</strong> мин</td><td><button className="text-button danger" disabled={busy} aria-label={`Удалить тренировку ${training.activity} для ${trainingCustomer(training)}`} onClick={() => setModal({ kind: 'deleteTraining', training })}>Удалить</button></td></tr>)}</tbody></table></div>}
            <div className="panel-foot">Показано {trainings.length} из {data.trainings.length}. Время отображается в часовом поясе браузера.</div>
          </section>}
          {page === 'calendar' && <><div className="section-actions"><p>Все занятия из списка тренировок.</p><button className="button primary" disabled={busy || !data.customers.length} onClick={() => setModal({ kind: 'training' })}>+ Новая тренировка</button></div><Calendar anchor={anchor} view={calendarView} customers={data.customers} trainings={data.trainings} onAnchor={setAnchor} onView={setCalendarView} onSelect={training => setModal({ kind: 'detail', training })} />{!data.trainings.length && <p className="form-note">В календаре пока нет тренировок. Добавьте первую.</p>}</>}
          {page === 'statistics' && <section className="panel stats-panel"><div className="panel-heading"><div><h2>Минуты по видам активности</h2><p>Сумма длительностей, включая прошлые и будущие занятия.</p></div><span className="stat-total">{Math.floor(totalMinutes / 60)} ч {totalMinutes % 60} мин</span></div>{totals.length ? <div className="activity-chart">{totals.map((total, index) => <div className="chart-row" key={total.activity}><div className="chart-label"><strong>{total.activity}</strong><span>{total.sessions} занятий</span></div><div className="chart-track"><div className={`chart-bar color-${index % 4}`} style={{ width: `${total.minutes / totals[0].minutes * 100}%` }} /></div><strong className="chart-value">{total.minutes}<small> мин · {Math.round(total.minutes / totalMinutes * 100)}%</small></strong></div>)}</div> : <div className="empty-state"><h3>Статистика появится после первого занятия</h3><p>Добавьте тренировку в разделе «Тренировки».</p></div>}<div className="panel-foot">Итог: {totalMinutes} минут, {data.trainings.length} тренировок. Проценты округлены и могут суммарно отличаться от 100%.</div></section>}
        </>}
      </main>
      <footer className="site-footer"><p>Personal Trainer <span>·</span> Учебный React-проект</p>{mode === 'demo' && !provided && <button className="text-button" disabled={busy} onClick={() => { if (window.confirm('Сбросить только локальное демо? Все ваши изменения в этом браузере будут заменены начальными данными.')) void mutate(() => new DemoRepository(localStorage).reset(), 'Демо восстановлено: 4 клиента и 6 тренировок.'); }}>Сбросить демо</button>}<span>Планируйте. Двигайтесь. Повторяйте.</span></footer>
    </div>
    {modal && <Dialog title={title} onClose={() => setModal(null)} busy={busy}>
      {mode === 'api' && <p className="form-note api-warning">Запись изменит общую учебную базу. Перед отправкой появится дополнительное подтверждение.</p>}
      {error && <p className="field-error" role="alert">{error}</p>}
      {modal.kind === 'customer' && <CustomerForm initial={modal.customer} busy={busy} onCancel={() => setModal(null)} onSubmit={input => void mutate(() => repository.saveCustomer(input, modal.customer?.id), modal.customer ? 'Данные клиента обновлены.' : 'Клиент добавлен.')} />}
      {modal.kind === 'training' && <TrainingForm customers={data.customers} customerId={modal.customerId} defaultDate={localDateTimeValue(mode === 'demo' ? new Date('2026-10-08T09:00:00') : new Date())} busy={busy} onCancel={() => setModal(null)} onSubmit={input => void mutate(() => repository.addTraining(input), 'Тренировка добавлена в список и календарь.')} />}
      {modal.kind === 'deleteCustomer' && <><p className="confirmation-copy">Клиент <strong>{customerName(modal.customer)}</strong> будет удалён вместе со всеми связанными тренировками ({data.trainings.filter(training => training.customerId === modal.customer.id).length}). Действие нельзя отменить.</p><div className="dialog-actions"><button className="button secondary" disabled={busy} onClick={() => setModal(null)}>Отмена</button><button className="button destructive" disabled={busy} onClick={() => void mutate(() => repository.deleteCustomer(modal.customer.id), 'Клиент и его тренировки удалены.')}>{busy ? 'Удаляем…' : 'Удалить клиента и тренировки'}</button></div></>}
      {modal.kind === 'deleteTraining' && <><p className="confirmation-copy">Удалить <strong>{modal.training.activity}</strong> для {trainingCustomer(modal.training)}, {formatDate(modal.training.date)}? Действие нельзя отменить.</p><div className="dialog-actions"><button className="button secondary" disabled={busy} onClick={() => setModal(null)}>Отмена</button><button className="button destructive" disabled={busy} onClick={() => void mutate(() => repository.deleteTraining(modal.training.id), 'Тренировка удалена.')}>{busy ? 'Удаляем…' : 'Удалить тренировку'}</button></div></>}
      {modal.kind === 'detail' && <><dl className="training-details"><div><dt>Активность</dt><dd>{modal.training.activity}</dd></div><div><dt>Клиент</dt><dd>{trainingCustomer(modal.training)}</dd></div><div><dt>Дата и время</dt><dd>{formatDate(modal.training.date)}</dd></div><div><dt>Длительность</dt><dd>{modal.training.duration} минут</dd></div></dl><p className="form-note">Время в часовом поясе браузера.</p><div className="dialog-actions"><button className="button secondary" onClick={() => setModal(null)}>Закрыть</button><button className="button destructive" disabled={busy} onClick={() => setModal({ kind: 'deleteTraining', training: modal.training })}>Удалить тренировку</button></div></>}
    </Dialog>}
  </>;
}
