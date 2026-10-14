# Personal Trainer: от пустой папки до готового React-приложения

Комплект рассчитан на ученицу, которая уже видела компоненты React, `useState`, простые события и `fetch`, но ещё учится разделять интерфейс и логику. Если эти темы новы, сначала выполнить этап A на локальных данных, затем формы и API. Итог — объяснимое приложение и собственная проверка основных сценариев.

## Что требуется и какой получится результат

В доступном задании нужна React-страница компании Personal Trainer для клиентов и связанных тренировок. Точные Part 1–4 отсутствуют. Пользователь разрешил дополнить их самостоятельно; наше решение включает списки, поиск/сортировку, CRUD клиентов, создание/удаление тренировок, календарь, CSV и статистику. Эти возможности реализованы как предложенные этапы A–D; мы не приписываем их официальным частям и не обещаем оценку.

| Источник требования | Что известно | Как отражено в решении |
|---|---|---|
| Доступный PDF | React, клиенты/тренировки, предоставленный REST API | React + TypeScript, два вида сущностей, отдельный API-адаптер |
| Доступный PDF | Модульность, имена и удобный интерфейс | Модели, чистая логика, репозитории, формы и календарь разделены |
| Решение пользователя | Разрешено дополнить отсутствующие условия | Предложенные этапы A–D ниже |
| Part 1–4 | Описания отсутствуют | Сопоставление оставлено неизвестным |
| Официальная сдача | Точный срок/канал неизвестны | Не придуманы; GitHub не создаётся автоматически |

Полное [исходное доступное условие](materials/homework-2026-10-03/assignments/final-frontend-personal-trainer.md) и [задания без ответов](ASSIGNMENT.md) сохранены отдельно.

Маршрут: новая папка на Mac → конфигурация и модели → тестируемая логика → два источника данных → таблицы и формы → календарь → CSV и статистика → проверки → сверка с официальными частями, когда появятся.

## 1. Быстрый запуск готового проекта на Mac

Скопируйте готовую папку `personal-trainer` в:

```text
<локальный-путь>
```

Откройте Terminal и выполните:

```bash
cd <папка-этого-репозитория>
node --version
npm --version
npm ci
npm run dev
```

Node должен быть не ниже 22.12.0; проверка комплекта выполнялась на Node 24.21.0. `.nvmrc` выбирает ветку Node 24, если уже используется nvm: выполните `nvm install` и `nvm use` в папке проекта. Если nvm отсутствует, эти команды пропустите и используйте установленный подходящий Node. Первая установка `npm ci` требует доступа к npm registry. После установки деморежим не зависит от внешнего API.

Откройте адрес, напечатанный Vite, обычно `http://127.0.0.1:5173`. Не открывайте HTML как локальный файл. Страница должна показать 4 клиентов, 6 тренировок, 305 минут и 4 активности. Остановить сервер можно `Ctrl+C` в его терминале.

Для production-версии:

```bash
npm run build
npm run preview
```

Обычно preview использует `http://127.0.0.1:4173`. Vite может выбрать другой порт; ориентируйтесь на его вывод. Если нужен конкретный свободный порт, например:

```bash
npm run dev -- --port 5186 --strictPort
```

`localStorage` привязан к origin. У `localhost`, `127.0.0.1` и разных портов отдельные данные. Это объясняет, почему на новом URL снова виден начальный набор. Демо-изменения не передаются серверу.

## 2. Создание с нуля, а не только копирование

Для этого пути папка `personal-trainer` должна быть новой. Если там уже есть другая работа, сохраните её отдельно и используйте другое имя новой папки; не перезаписывайте существующие исходники.

В Finder создайте папку `HW.React/HW.Group-2/personal-trainer` на рабочем столе. Либо в Terminal из новой, свободной папки:

```bash
mkdir -p "<локальный-путь>"
cd <папка-этого-репозитория>
mkdir src tests docs scripts public
```

Ниже в разделе «Полный код» приведено полное содержание всех наших исходников, конфигураций, тестов и генератора мануала. Создавайте файлы в редакторе с точно такими именами; `src/App.tsx` должен быть файлом внутри `src`, а не текстовым файлом `App.tsx.txt`.

1. Создайте `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `.gitignore`, `.nvmrc`, `.env.example` и `public/icon.svg`.
2. Создайте `tests/setup.ts`, `tests/domain.test.ts`, `tests/demo.test.ts`, `tests/api.test.ts`. До появления исходников тесты закономерно не смогут импортировать модули — это исходное красное состояние.
3. Установите фиксированные зависимости через `npm install`. Эта команда создаст `package-lock.json`. При воспроизведении уже готового комплекта сохраняйте его исходный lockfile и используйте `npm ci`; это даёт точные транзитивные версии.
4. Добавьте `src/types.ts`, `domain.ts`, `demo.ts`, `api.ts`. Проверьте основную логику: `npm test` и `npm run typecheck`.
5. Добавьте `Dialog.tsx`, `Forms.tsx`, `Calendar.tsx`, `App.tsx`, `main.tsx`, `styles.css`, затем `tests/App.test.tsx`.
6. Запустите `npm run dev`. Проверьте операции ниже. Выполните `npm test` и `npm run build`.
7. Сохраните README и документы из комплекта. Для актуального кода в мануале предусмотрен генератор `scripts/build-manual.mjs`. Его учебный префикс — `docs/MANUAL-INTRO.md`; можно получить этот префикс из начала данного файла до маркера `<!-- SOURCE_APPENDIX -->`.

Использовать `npm create vite@latest` здесь не требуется: оно может создать другую версию шаблона. В комплекте конфигурация уже закреплена и соответствует указанным версиям.

## 3. Предложенные этапы A–D

| Этап | Действия ученицы | Проверяемый результат |
|---|---|---|
| A. Прочитать и показать | Модели, демобаза, репозитории, список клиентов/тренировок, поиск, сортировка, loading/error/empty | Списки понятны; неверный ответ не выглядит пустой успешной загрузкой |
| B. Создать и изменить | Формы, проверка ввода, CRUD клиентов, создание/удаление тренировок, подтверждения | Связи сохраняются; новая запись остаётся после перезагрузки; удаление клиента каскадное |
| C. Расписание | Даты, сетка с понедельника, месяц/неделя, навигация, карточки | Каждая тренировка стоит на своём местном дне; переходы месяцев/лет корректны |
| D. Выгрузить и проверить | CSV, группировка минут, тесты и production-сборка | CSV открывается как текстовые контакты, суммы объяснимы, проверки проходят |

Это учебная последовательность одного конечного проекта, а не четыре отдельных Git-коммита или готовые снимки программы. История Git за ученицу не создавалась. Официальные Part 1–4 пока не сопоставлены ни с одним этапом.

## 4. Теория: данные, состояния и архитектура

`CustomerInput` содержит семь полей клиента. `Customer` добавляет устойчивый `id` и, для API, URL ресурса. `TrainingInput` содержит активность, дату, минуты и `customerId`; у прочитанной тренировки связь может отсутствовать, тогда `customerId = null`, а интерфейс сообщает «Клиент не указан».

`Repository` — общий договор для обоих источников. Компонент не должен знать, где хранятся клиенты. У демо этот договор выполняет `DemoRepository`, у сети — `ApiRepository`. Поэтому формы, поиск, календарь и статистика работают с одинаковыми моделями.

```text
Форма / кнопка пользователя
          ↓
App: состояние, подтверждение и сообщение
          ↓
Repository
   ├─ DemoRepository → localStorage этого origin
   └─ ApiRepository  → документированный REST API
          ↓
Новый DataStore → таблицы / календарь / статистика
```

`useState` хранит изменяемую информацию: выбранную страницу, режим, данные, поисковую строку, диалог, загрузку, ошибку. Производные значения — отфильтрованные клиенты, отсортированные тренировки, суммы — вычисляются из данных. Их не нужно хранить вторым независимым состоянием: иначе таблица и диаграмма могут разойтись.

`useMemo` удерживает выбранный репозиторий между рендерами. `useEffect` загружает исходные данные и создаёт `AbortController`. При уходе/смене источника прежняя загрузка отменяется, а её запоздалый результат не подменяет новый экран. Функция `mutate` выполняет запись после пользовательского действия и затем читает свежий список; успех записи и ошибка обновления списка различаются.

Демо seed фиксирован: даты 5–12 октября 2026, вымышленные имена и контакты на зарезервированном домене `.test`. Идентификаторы новых записей создаются через `crypto.randomUUID()`, а не номер строки. Текущий браузер хранит сериализованный набор под ключом `personal-trainer-demo-v1`. Повреждённые данные обнаруживаются, восстановление происходит только после явного «Сбросить демо».

## 5. API: проверенный договор и включение

Использованы официальные страницы [General](https://juhahinkula.github.io/personaltrainerdocs/), [Customers](https://juhahinkula.github.io/personaltrainerdocs/customers/), [Trainings](https://juhahinkula.github.io/personaltrainerdocs/trainings/). На 05.10.2026 выполнены только GET-проверки структуры живого сервиса: 16 клиентов, 10 тренировок в каждом представлении. Количество временное, его нельзя зашивать в тесты API.

| Метод и путь | Для чего использует проект |
|---|---|
| GET `/customers` | HAL `_embedded.customers`, ссылки self и при наличии следующая страница |
| GET `/gettrainings` | Массив с `id`, датой, минутами и вложенным клиентом |
| POST `/customers`, PUT `/customers/{id}` | Клиентская форма; отправляются очищенные семь полей |
| DELETE `/customers/{id}` | Подтверждённое каскадное удаление |
| POST `/trainings` | ISO-дата, активность, минуты и URI клиента |
| DELETE `/trainings/{id}` | Подтверждённое удаление занятия |

`normalizeHalTrainings` отдельно разбирает HAL `/trainings`; основной экран использует `/gettrainings`. Ссылка `/trainings/{id}/customer` обозначает связь, поэтому из неё нельзя выводить ID клиента. В HAL-клиентах ID извлекается из проверенной реальной ссылки `self`; в массиве тренировок ID явно предоставлен сервером.

Для успешного HTTP-ответа с пустым телом, включая 204, `requestJson` не вызывает JSON-парсер. Для неуспешного статуса показывается HTTP-код; текст тела не выводится. Неверный JSON и недоступная сеть тоже дают понятную ошибку. При чтении HAL-страниц ограничены число переходов и повторяющиеся next-ссылки. Ссылки ресурсов и страниц должны оставаться на origin и пути настроенного API; сетевые редиректы запрещены.

В старых примерах документации встречается иной хост. Наш код использует текущий base URL и отклоняет чужой origin; не копируйте демонстрационные URL с чужими ID.

Демо не требует настройки. Для осознанного включения API на Mac:

```bash
cp .env.example .env.local
```

В редакторе измените `.env.local`:

```dotenv
VITE_ENABLE_LIVE_API=true
VITE_API_BASE_URL=https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/
```

Остановите Vite и снова запустите `npm run dev`. Кнопка «API» становится видимой. Стартовый режим всё равно демо. При переключении подтвердите чтение общей базы; перед каждой записью появится ещё одно предупреждение. Отмена означает, что POST/PUT/DELETE не отправляется.

База общая для студентов: записи и удаления влияют на других людей. Учебные CRUD-сценарии ниже выполняйте в демо. Нельзя запускать reset ради обычной проверки интерфейса. В приложении reset API отсутствует. Если API пустой, страница показывает пустое состояние; дальнейшие действия с общим сервисом согласовываются отдельно. Переменные `VITE_*` публичны и не подходят для секретов.

Сетевые записи реализованы и проверены с моками. Реальные POST/PUT/DELETE и поведение CORS в браузере на машине ученицы этим не подтверждены. Такой предел проверки указан в [VERIFICATION.md](VERIFICATION.md).

## 6. Формы и даты: почему нужны проверки

Все семь полей клиента обязательны в нашем интерфейсе. Пробелы по краям удаляются, email проходит проверку формы, номер телефона допускает цифры, `+`, скобки, пробелы, точку и дефис. Почтовый индекс — строка: начальные нули и международный формат должны сохраняться. Ограничения длины и максимальные 1440 минут — предложенные ограничения данного учебного решения, а не восстановленные официальные Part 1–4.

Для тренировки нужны существующий клиент, активность 1–80 символов, целая длительность 1–1440 минут и действительная дата. Нельзя просто довериться `Date.parse`: JavaScript может перенести 30 февраля на март. Проверка отдельно сверяет календарный день, часы и високосный год.

Поле `datetime-local` содержит местное время без timezone. `localDateTimeToIso` создаёт местный `Date`, проверяет обратное совпадение его компонентов и возвращает UTC ISO. Например, если браузер находится в UTC+3, местное `09:30` отправляется как `06:30Z`, но на странице снова показывается `09:30`. Сетка календаря группирует занятия по местному дню. Время, которого не существует при переводе часов, отвергается.

Месячная сетка содержит 42 последовательных дня с понедельника, включая соседние месяцы. Неделя содержит 7 дней. При смене месяца используется его первый день: так 31 января не переносится ошибочно в март.

Диалог получает начальный фокус, удерживает Tab внутри, закрывается Escape и возвращает фокус к исходной кнопке. Основной экран при открытом окне имеет `inert`. Ошибка поля имеет отдельное описание `aria-describedby`, поэтому её текст не меняет имя поля.

## 7. CSV и статистика

CSV выгружает текущий список клиентов после поиска и сортировки. В каждой ячейке стоят кавычки, внутренние кавычки удваиваются, строки разделяются CRLF, а UTF-8 BOM помогает табличным программам увидеть русские буквы. Если Excel не разделил колонки, импортируйте файл как UTF-8 с разделителем «запятая».

Строки, начинающиеся с `=`, `+`, `-`, `@`, опасного пробела перед формулой либо табуляции/переноса, получают ведущий апостроф. Это препятствует выполнению формулы при открытии таблицы. Телефон с `+` тоже сохраняется как текст. CSV содержит контакты клиентов; используйте демоданные для учебной отправки.

Статистика вычисляется по всем сохранённым тренировкам, независимо от поиска списка и даты. `Map` объединяет занятия с одинаковой строкой активности, суммирует минуты и считает занятия. Исходный seed: силовая — 120 минут, йога — 100, бег — 45, пилатес — 40; всего 305 = 5 ч 5 мин. Написания активностей группируются точно: «Бег» и «бег» — разные группы. В форме предложен datalist, но можно вводить свою активность.

## 8. Карта функций: что сделано и зачем

| Файл / функция | Что выполняет | Почему это нужно |
|---|---|---|
| `types.ts`: интерфейсы и `Repository` | Фиксирует поля и договор источника | TypeScript проверяет совместимость demo и API |
| `domain.ts`: `cleanCustomer`, `validateCustomer` | Убирает пробелы, проверяет контакты | Форма и репозиторий применяют одинаковые правила |
| `validateTraining`, `validTrainingDate` | Проверяет связь, длительность и календарную дату | Неправильная дата не превращается в другую |
| `localDateTimeToIso`, `localDateTimeValue` | Переход между полем формы и временем | Правильно сохраняет местные часы и ISO |
| `dateKey`, `calendarDays` | Создаёт ключ дня и сетку | Календарь привязан к местному дню и понедельнику |
| `filterCustomers` | Поиск и копия отсортированного списка | Не меняет исходные данные |
| `activityTotals` | Группирует минуты и занятия | Статистика повторяемая и проверяема |
| `csvCell`, `customersCsv`, `downloadCsv` | Защищает, формирует и скачивает CSV | Корректные кавычки, кириллица и текст вместо формул |
| `demo.ts`: `createSeed`, `checkStore` | Начальные данные и проверка сохранённого набора | Демо воспроизводится; повреждение не скрывается |
| `DemoRepository.list`, `persist`, `reset` | Чтение/запись/явный сброс в браузере | Учебные операции не зависят от сети |
| `DemoRepository.saveCustomer/deleteCustomer` | Создание/изменение и каскадное удаление | Сохраняет связь клиента с тренировками |
| `DemoRepository.addTraining/deleteTraining` | Добавление и удаление занятия | Обновляет календарь и итоговую сумму |
| `api.ts`: `apiBase`, `safeResourceUrl`, `resourceUrl` | Проверяет адрес и ID | Чужие ссылки не становятся целью запроса |
| `object`, `string`, `idString`, `halItems` | Проверяет фактический JSON | TypeScript сам не проверяет JSON из сети |
| `normalizeCustomers` | HAL → модель клиента | Использует реальные ссылки, а не индекс строки |
| `normalizeJoinedTrainings`, `normalizeHalTrainings` | Разбирает два разных ответа | Не смешивает массив `/gettrainings` и HAL |
| `requestJson` | HTTP, пустое тело, JSON и ошибки | 204 не вызывает ошибку парсера |
| `ApiRepository.customers/list` | Загружает страницы и оба списка | Не теряет страницы клиентов; поддерживает отмену |
| Методы записи `ApiRepository` | POST/PUT/DELETE с правильными полями | Формы используют общий договор с демо |
| `Forms.tsx`: `CustomerForm`, `TrainingForm` | Управляемые поля и сообщения | Проверяет ввод до отправки |
| `Dialog.tsx`: `handleKey` и эффект | Фокус, Escape, Tab и scroll | Диалог доступен клавиатурой |
| `Calendar.tsx`: `move`, компонент `Calendar` | Периоды и события | Не нужна большая библиотека календаря |
| `App.tsx`: `useEffect`, `mutate`, `switchMode` | Загрузка, действия и выбор источника | Ошибки видны, записи подтверждаются |
| `main.tsx`, `styles.css` | Монтирование React и responsive-оформление | Одна точка входа; таблицы/сетка прокручиваются на узком экране |
| `public/icon.svg` | Вкладка браузера использует собственную иконку | Не нужен внешний файл или запрос favicon.ico |
| `tests/*` | Проверяет сценарии и граничные случаи | Помогает отличать работающий код от предположения |
| `scripts/build-manual.mjs` | Собирает полный код в мануал и проверяет актуальность | В документации не остаётся старых листингов |
| `scripts/check-docs.mjs` | Проверяет файлы и внутренние якоря ссылок Markdown | Ссылки на задания, решения и результаты не обрываются |
| `scripts/render-doc-preview.mjs` | Создаёт временный HTML мануала с переданным Markdown-парсером | Помогает проверить отображение документов; для запуска приложения не нужен |

## 9. Проверка руками: от клиента до статистики

1. Запустите демо. Видны 4 клиента, 6 тренировок и 305 минут. Во вкладке клиентов поищите «Алина», затем «Helsinki»; второй запрос даёт двух клиентов.
2. Создайте клиента: Тест Студент, `student@example.test`, `+358 401234567`, `Test street 1`, `00100`, `Turku`. Измените город на `Tampere`. Перезагрузите страницу: изменения остаются.
3. В его строке нажмите «+ Занятие». Создайте «Учебная тренировка», 35 минут, 8 октября 2026 09:00. Нельзя добавить тренировку без клиента или с длительностью 0.
4. Откройте «Тренировки», найдите новую активность. Откройте «Календарь», октябрь 2026: занятие видно 8 числа. Нажмите событие и проверьте клиента, 09:00 и 35 минут. Переключитесь на неделю и следующий период.
5. В «Статистике» после добавления будет 340 минут. Удалите это занятие через карточку и подтверждение: снова 305 минут.
6. В «Клиентах» установите поиск «Helsinki», выгрузите CSV: в файле две записи и строка заголовка. Проверьте русские буквы, адреса и индексы.
7. Начните удаление Алины, нажмите «Отмена»: клиент и две её тренировки остаются. Подтвердите удаление: клиента нет, её две тренировки тоже исчезают. Учебные действия выполняются только в локальном демо.
8. «Сбросить демо» внизу после подтверждения восстанавливает ровно 4 клиента и 6 тренировок. Кнопка касается только localStorage и не вызывает reset сервера.

<a id="solutions-1-8"></a>

## Решения заданий 1–8

Номера соответствуют [заданиям без ответов](ASSIGNMENT.md#3-задания-ученице-без-ответов). Для занятия можно дать ученице только `ASSIGNMENT.md`, а этот мануал оставить преподавателю до разбора.

1. `package.json` описывает команды и прямые зависимости. `package-lock.json` фиксирует точное дерево, поэтому готовый проект устанавливается через `npm ci`. `npm run dev` запускает сервер, а не сборку приложения для публикации. На странице четыре раздела: клиенты, тренировки, календарь, статистика. При отсутствии Node нужны его установка/выбор версии; отсутствие API не мешает демо.
2. Поля клиента перечислены в `CustomerInput`; у тренировки дата, активность, минуты и ссылка через ID клиента. Индекс строки меняется при поиске/сортировке, поэтому привязка по нему сломается. HAL содержит `_embedded.customers` и ссылки, а `/gettrainings` непосредственно возвращает массив с вложенным клиентом. Разные адаптеры переводят их в одни модели.
3. Поиск «Алина» на seed даёт Алину Морозову; «Helsinki» — Алину и Софию. `filterCustomers` проверяет все семь очищенных полей и затем сортирует копию. CSV использует уже полученный список `customers`, поэтому сохраняет и фильтр, и порядок.
4. Сначала клиент проходит `cleanCustomer`/`validateCustomer`; затем `saveCustomer` формирует UUID и вызывает `persist`. После изменения ID остаётся прежним. Перезагрузка читает JSON из localStorage. Пустая форма показывает ошибки для семи полей; `wrong` в email вызывает «Введите корректный email». Ошибки не отправляют данные в репозиторий.
5. В строке нового клиента `customerId` предвыбран. Поле местного времени преобразуется в ISO, целые 35 минут проходят проверку. `mutate` добавляет запись и перечитывает набор, поэтому список и календарь получают одну тренировку. При 0 появляется ошибка длительности; без клиента — ошибка связи. Удаление по устойчивому ID убирает запись из всех представлений.
6. `calendarDays` начинает месяц с первого дня и отступает к понедельнику. Для недели отступает от выбранного дня. `move` меняет месяц от первого числа или неделю на 7 суток, поэтому границы года естественно обрабатывает `Date`. UTC ISO и местные часы различаются на timezone; `formatDate` и `dateKey` снова работают по местному времени браузера.
7. 60 + 60 = 120 для силовой, 50 + 50 = 100 для йоги, 45 для бега и 40 для пилатеса; 120 + 100 + 45 + 40 = 305. CSV удваивает `"`, ставит всю ячейку в кавычки, сохраняет запятую/перенос внутри и добавляет апостроф перед `=...`. Тесты проверяют содержимое файла, а диаграмма вычисляет ширину относительно максимального значения, не подменяя минуты высотой столбца.
8. Первое окно удаления сообщает о каскаде; отмена закрывает окно без вызова репозитория. Подтверждение демо удаляет клиента и фильтрует связанные тренировки. Запустите `npm run typecheck`, `npm test`, `npm run build`, `npm run docs:check`. Моки подтверждают наш разбор JSON, HTTP-ошибки, payload и отмену записи; они не подтверждают реальную доступность сервера, CORS и разрешение на общую базу.

## 10. Проверки, ограничения и поиск проблем

```bash
npm run typecheck
npm test
npm run build
npm run docs:check
```

Проверяются валидация, существование клиента, сохранение/каскадное удаление демо, дата и високосный год, начало недели, суммы минут, CSV, формы и повторная загрузка. API-моки проверяют HAL и массив, 204/пустое тело, HTTP/JSON-ошибку, недоверенную ссылку, пагинацию и предупреждение перед записью. [Точный журнал проверки](VERIFICATION.md) отдельно отличает автоматическую проверку от реального запуска на Mac.

Если Terminal сообщает `ENOENT ... package.json`, выполните `pwd` и убедитесь, что открыта папка проекта. Если порт занят, используйте другой порт с `--strictPort`, не завершайте произвольные Node-процессы. Если демо повреждено, кнопка «Сбросить демо» восстановит seed после подтверждения. Если API недоступен, выберите демо и проверьте адрес/сеть; reset общей базы не является исправлением сети.

Если настройка `.env.local` не сработала, перезапустите Vite: переменные читаются при старте. Ученический Mac физически не проверялся в ходе Windows-подготовки. Официальные Part 1–4, дата сдачи и публикация остаются отдельными неизвестными.

## 11. Как показывать работу и фиксировать этапы

Показать демо CRUD, календарь и статистику; затем объяснить контракт API, показать тесты и честно указать границу сетевой проверки. Для официальной сдачи получить отсутствующие Part 1–4 и сверить каждый пункт. Не выдавать предложенные A–D за официальную шкалу оценивания.

Если преподаватель требует Git, сначала уточнить существующий репозиторий/ветку и правила сдачи. В новой отдельной папке проекта можно самостоятельно создать локальную историю по мере реальной работы, без remote и публикации:

```bash
git init
git status
git add .gitignore .nvmrc .env.example package.json package-lock.json tsconfig.json vite.config.ts index.html public src tests docs scripts README.md
git diff --cached --stat
git commit -m "Implement Personal Trainer learning app"
```

Это пример одного реального коммита готового решения, а не выдуманная история этапов. Содержимое `.env.local`, `node_modules`, `dist` и клиентские данные не добавляются. Команды не нужно выполнять внутри общего индексного репозитория заказов. Для удалённого GitHub правила проверяются отдельно; комплект не создаёт репозиторий и не отправляет работу.

## Полный код

Все листинги ниже добавлены из фактических файлов проекта. Это полные файлы, без многоточий вместо важных частей. `package-lock.json` приложен в исходной папке; сгенерированное дерево сторонних зависимостей не дублируется в учебном тексте. Учебные документы и README находятся отдельными файлами, а не считаются исходниками приложения.

<!-- SOURCE_APPENDIX -->

### package.json

```json
{
  "name": "personal-trainer",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "engines": { "node": ">=22.12.0" },
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "typecheck": "tsc --noEmit",
    "build": "npm run typecheck && vite build",
    "preview": "vite preview --host 127.0.0.1",
    "test": "vitest run",
    "test:watch": "vitest",
    "docs:manual": "node scripts/build-manual.mjs",
    "docs:check": "node scripts/build-manual.mjs --check && node scripts/check-docs.mjs"
  },
  "dependencies": { "react": "19.2.7", "react-dom": "19.2.7" },
  "devDependencies": {
    "@testing-library/jest-dom": "6.9.1",
    "@testing-library/react": "16.3.0",
    "@testing-library/user-event": "14.6.1",
    "@types/node": "24.13.2",
    "@types/react": "19.2.17",
    "@types/react-dom": "19.2.3",
    "@vitejs/plugin-react": "6.0.2",
    "jsdom": "27.4.0",
    "typescript": "6.0.2",
    "vite": "8.1.0",
    "vitest": "4.1.0"
  }
}
```

### tsconfig.json

```json
{
  "compilerOptions": {
    "target": "ES2022", "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext", "moduleResolution": "Bundler", "jsx": "react-jsx",
    "strict": true, "noEmit": true, "skipLibCheck": true,
    "allowImportingTsExtensions": true, "verbatimModuleSyntax": true,
    "types": ["vite/client", "vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src", "tests", "vite.config.ts"]
}
```

### vite.config.ts

```typescript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: { environment: 'jsdom', setupFiles: ['./tests/setup.ts'], clearMocks: true },
});
```

### index.html

```html
<!doctype html>
<html lang="ru">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#214b41" />
    <link rel="icon" type="image/svg+xml" href="/icon.svg" />
    <meta name="description" content="Учебное рабочее пространство Personal Trainer: клиенты, тренировки и расписание." />
    <title>Personal Trainer — план тренировок</title>
  </head>
  <body><div id="root"></div><script type="module" src="/src/main.tsx"></script></body>
</html>
```

### .gitignore

```text
node_modules/
dist/
.env
.env.local
.env.*.local
coverage/
output/
.playwright-cli/
.DS_Store
*.tsbuildinfo
```

### .nvmrc

```text
24
```

### .env.example

```text
# Демо запускается без .env. true только показывает выбор живого API.
VITE_ENABLE_LIVE_API=false
VITE_API_BASE_URL=https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/
```

### public/icon.svg

```xml
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="18" fill="#214b41" />
  <text x="11" y="44" fill="white" font-family="Arial,sans-serif" font-size="39" font-weight="bold" letter-spacing="-4">pt</text>
  <circle cx="51" cy="24" r="4" fill="#d3e8b5" />
</svg>
```

### src/types.ts

```typescript
export interface CustomerInput {
  firstname: string;
  lastname: string;
  streetaddress: string;
  postcode: string;
  city: string;
  email: string;
  phone: string;
}

export interface Customer extends CustomerInput { id: string; url?: string }
export interface TrainingInput { customerId: string; date: string; activity: string; duration: number }
export interface Training extends Omit<TrainingInput, 'customerId'> {
  id: string;
  customerId: string | null;
  customerName?: string;
  url?: string;
}
export interface DataStore { customers: Customer[]; trainings: Training[] }
export type FieldErrors = Record<string, string>;
export type CustomerSort = 'name' | 'city' | 'email';
export type CalendarView = 'month' | 'week';
export interface Repository {
  list(signal?: AbortSignal): Promise<DataStore>;
  saveCustomer(input: CustomerInput, id?: string): Promise<void>;
  deleteCustomer(id: string): Promise<void>;
  addTraining(input: TrainingInput): Promise<void>;
  deleteTraining(id: string): Promise<void>;
}
```

### src/domain.ts

```typescript
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
```

### src/demo.ts

```typescript
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
```

### src/api.ts

```typescript
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
```

### src/Dialog.tsx

```tsx
import { useEffect, useId, useRef } from 'react';
import type { ReactNode } from 'react';

export function Dialog({ title, children, onClose, busy = false }: { title: string; children: ReactNode; onClose: () => void; busy?: boolean }) {
  const titleId = useId();
  const ref = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);
  const busyRef = useRef(busy);
  closeRef.current = onClose;
  busyRef.current = busy;

  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const scroll = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const first = ref.current?.querySelector<HTMLElement>('input, select') ?? ref.current?.querySelector<HTMLElement>('button');
    first?.focus();
    function handleKey(event: KeyboardEvent) {
      if (event.key === 'Escape' && !busyRef.current) closeRef.current();
      if (event.key !== 'Tab') return;
      const fields = [...(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), [tabindex="0"]') ?? [])];
      const first = fields[0];
      const last = fields[fields.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    document.addEventListener('keydown', handleKey);
    return () => { document.removeEventListener('keydown', handleKey); document.body.style.overflow = scroll; previous?.focus(); };
  }, []);

  return <div className="dialog-backdrop" onClick={event => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <div className="dialog" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={ref}>
      <div className="dialog-heading"><div><p className="eyebrow">PERSONAL TRAINER</p><h2 id={titleId}>{title}</h2></div><button className="icon-button" onClick={onClose} disabled={busy} aria-label="Закрыть окно">×</button></div>
      {children}
    </div>
  </div>;
}
```

### src/Forms.tsx

```tsx
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
```

### src/Calendar.tsx

```tsx
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
```

### src/App.tsx

```tsx
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
```

### src/main.tsx

```tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles.css';

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);
```

### src/styles.css

```css
:root { font-family: Inter, "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif; color: #26372f; background: #f6f5ef; font-synthesis: none; text-rendering: optimizeLegibility; --green: #214b41; --muted: #727d75; --border: #e3e7df; --cream: #f6f5ef; }
* { box-sizing: border-box; }
body { margin: 0; min-width: 320px; }
button, input, select { font: inherit; }
button { cursor: pointer; }
button:disabled { cursor: not-allowed; opacity: .55; }
button, a, input, select { -webkit-tap-highlight-color: transparent; }
button:focus-visible, a:focus-visible, input:focus-visible, select:focus-visible, [tabindex]:focus-visible { outline: 3px solid #dd9d52; outline-offset: 3px; }
a { color: var(--green); }
h1, h2, h3, p { margin: 0; }
.app-shell { max-width: 1440px; margin: 0 auto; padding: 0 44px; }
.site-header { display: flex; justify-content: space-between; align-items: center; gap: 22px; padding: 28px 0 25px; }
.brand { display: flex; gap: 13px; align-items: center; text-decoration: none; font-size: 18px; font-weight: 700; letter-spacing: -.6px; }
.brand small { display: block; font-size: 10px; font-weight: 500; letter-spacing: .6px; margin-top: 4px; color: var(--muted); }
.brand-mark { width: 49px; height: 49px; display: grid; place-content: center; position: relative; border-radius: 15px; color: #fff; background: var(--green); font-size: 30px; letter-spacing: -2px; }
.brand-mark span { color: #d3e8b5; position: absolute; right: 6px; top: 10px; font-size: 20px; }
.header-meta, .actions { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
.mode-badge { display: inline-flex; gap: 7px; align-items: center; padding: 7px 11px; border: 1px solid #d8e1d2; background: #edf2e8; border-radius: 50px; font-size: 11px; font-weight: 700; white-space: nowrap; }
.mode-badge i { width: 6px; height: 6px; border-radius: 50%; background: #548157; }
.mode-badge.api { background: #fff0dc; border-color: #f0c78f; color: #814e17; }
.mode-badge.api i { background: #b96a2a; }
.page-nav { display: flex; gap: 30px; border-bottom: 1px solid var(--border); }
.page-nav button { border: 0; border-bottom: 3px solid transparent; background: transparent; padding: 13px 1px 16px; font-size: 13px; font-weight: 600; color: #718074; display: flex; align-items: center; gap: 8px; }
.page-nav button span { font-size: 19px; line-height: 1; }
.page-nav button[aria-current] { color: var(--green); border-color: var(--green); }
main { padding-top: 33px; }
.intro { display: flex; justify-content: space-between; gap: 25px; align-items: center; margin-bottom: 24px; }
.eyebrow { font-size: 9px; letter-spacing: 1.8px; font-weight: 800; color: #738172; margin-bottom: 12px; }
h1 { font-size: clamp(24px, 3vw, 35px); letter-spacing: -1.15px; line-height: 1.15; font-weight: 650; }
.intro p:not(.eyebrow) { font-size: 13px; line-height: 1.6; margin-top: 12px; color: var(--muted); }
.intro-emblem { flex-shrink: 0; display: flex; align-items: center; gap: 11px; color: var(--green); font-size: 55px; }
.intro-emblem span { font-size: 8px; letter-spacing: 1px; line-height: 1.6; font-weight: 800; }
.mode-note { display: flex; align-items: center; gap: 11px; border: 1px solid #e0e6d8; background: #eff2e7; color: #526342; padding: 11px 15px; border-radius: 10px; font-size: 11px; line-height: 1.6; margin-bottom: 22px; }
.mode-note > span { font-size: 18px; }
.mode-note.api { background: #fff2de; border-color: #f0c78f; color: #71461d; }
.summary-grid { display: grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap: 14px; margin-bottom: 26px; }
.summary-card { border: 1px solid var(--border); border-radius: 12px; padding: 19px 21px; background: white; }
.summary-card > span { display: block; font-size: 11px; color: var(--muted); margin-bottom: 13px; }
.summary-card > strong { font-size: 33px; letter-spacing: -1px; line-height: 1; font-weight: 600; }
.summary-card small { font-size: 10px; color: var(--muted); font-weight: 400; letter-spacing: 0; }
.summary-card.accent { background: var(--green); border-color: var(--green); color: #f8fbf5; }
.summary-card.accent span, .summary-card.accent small { color: #bdd3c4; }
.panel { background: #fff; border: 1px solid var(--border); border-radius: 15px; overflow: hidden; }
.panel-heading { padding: 23px 24px; display: flex; justify-content: space-between; gap: 20px; align-items: center; }
h2 { font-size: 18px; line-height: 1.4; letter-spacing: -.3px; font-weight: 650; }
.panel-heading p { color: var(--muted); font-size: 11px; margin-top: 6px; }
.count-pill { display: inline-flex; min-width: 25px; justify-content: center; align-items: center; border-radius: 6px; background: #f0f3ed; padding: 3px 7px; font-size: 11px; color: #566f58; font-weight: 600; vertical-align: middle; margin-left: 5px; }
.button { border: 1px solid transparent; border-radius: 7px; padding: 10px 14px; font-size: 11px; font-weight: 650; line-height: 1.5; white-space: nowrap; transition: background .15s ease; }
.button.primary { background: var(--green); color: #fff; }
.button.primary:hover:not(:disabled) { background: #316353; }
.button.secondary { background: #fff; border-color: #dce3d8; color: #4b6052; }
.button.secondary:hover:not(:disabled) { background: #f4f6f0; }
.button.small { padding: 6px 10px; font-size: 10px; }
.button.destructive { background: #ad4933; color: #fff; }
.button.destructive:hover:not(:disabled) { background: #943d2a; }
.filter-bar { display: flex; align-items: center; gap: 12px; padding: 0 24px 20px; }
.search-field { position: relative; flex: 1; max-width: 520px; min-width: 150px; }
.search-field input { width: 100%; padding-left: 35px; }
.search-field > span:not(.sr-only) { position: absolute; left: 12px; top: 6px; font-size: 23px; color: #8e9a8f; }
input, select { border: 1px solid #dce3d8; border-radius: 7px; background: #fff; color: #314b3c; padding: 10px 11px; min-width: 0; font-size: 12px; }
input::placeholder { color: #89938b; }
.sort-label { display: flex; align-items: center; gap: 9px; font-size: 10px; color: var(--muted); margin-left: auto; white-space: nowrap; }
.sort-label select { padding: 9px; font-size: 11px; }
.sort-direction { padding: 9px; }
.table-scroll { overflow: auto; }
table { width: 100%; border-collapse: collapse; text-align: left; font-size: 12px; }
th { background: #f7f9f4; color: #7d887c; font-size: 9px; text-transform: uppercase; letter-spacing: .8px; font-weight: 700; padding: 13px 17px; border-top: 1px solid #ebeee6; border-bottom: 1px solid #ebeee6; white-space: nowrap; }
th:first-child, td:first-child { padding-left: 24px; }
td { padding: 18px 17px; border-bottom: 1px solid #f0f2eb; vertical-align: middle; }
td small { display: block; font-size: 10px; color: #858e86; margin-top: 5px; line-height: 1.5; }
td a { font-size: 11px; text-decoration: none; }
td a:hover { text-decoration: underline; }
.person { display: flex; gap: 10px; align-items: center; min-width: 170px; }
.person strong { font-weight: 600; }
.avatar { background: #ecf0e4; color: #53734f; width: 34px; height: 34px; border-radius: 50%; display: grid; place-content: center; flex-shrink: 0; font-size: 10px; font-weight: 700; }
tr:nth-child(even) .avatar { background: #f8eee3; color: #a47446; }
.row-actions { display: flex; justify-content: flex-end; gap: 13px; white-space: nowrap; }
.text-button { border: 0; background: transparent; font-size: 10px; color: #537159; padding: 5px 0; font-weight: 600; line-height: 1.5; }
.text-button:hover:not(:disabled) { text-decoration: underline; }
.text-button.danger { color: #a86753; }
.date-link { font-size: 12px; font-weight: 500; white-space: nowrap; }
.panel-foot { padding: 14px 24px; font-size: 10px; color: #889185; line-height: 1.6; }
.activity-tag { display: inline-block; background: #edf3e9; color: #577552; padding: 6px 9px; border-radius: 5px; font-size: 10px; white-space: nowrap; }
.site-footer { display: flex; justify-content: space-between; align-items: center; gap: 15px; flex-wrap: wrap; padding: 27px 0 30px; font-size: 10px; color: #939a8e; }
.site-footer p span { padding: 0 8px; }
.site-footer > span { font-size: 9px; letter-spacing: .5px; }
.message { margin-bottom: 18px; border: 1px solid; border-radius: 9px; padding: 12px 15px; display: flex; align-items: center; justify-content: space-between; gap: 12px; font-size: 12px; line-height: 1.5; }
.message.error { color: #8d3d2d; border-color: #efd2c8; background: #fff4f0; }
.message.success { color: #345a42; border-color: #d6e8d7; background: #edf6ed; }
.empty-state { text-align: center; padding: 52px 24px; color: var(--muted); font-size: 13px; }
.empty-state h3 { color: var(--green); font-size: 18px; margin-bottom: 10px; }
.empty-state p { margin-bottom: 17px; line-height: 1.6; }
.loading-dot { display: inline-block; width: 9px; height: 9px; margin-right: 12px; border-radius: 50%; background: #7c9d69; animation: pulse 1s ease-in-out infinite alternate; }
@keyframes pulse { to { opacity: .2; } }
.segments { display: flex; gap: 2px; border: 1px solid #dce3d8; border-radius: 7px; padding: 3px; background: #fff; }
.segments button { border: 0; padding: 6px 12px; border-radius: 5px; background: transparent; color: #7b857a; font-size: 10px; }
.segments button[aria-pressed="true"] { background: var(--green); color: #fff; }
.section-actions { display: flex; justify-content: space-between; align-items: center; gap: 15px; margin-bottom: 17px; }
.section-actions p { font-size: 12px; color: var(--muted); }
.calendar-toolbar { display: flex; align-items: center; justify-content: space-between; padding: 21px 23px 12px; gap: 15px; }
.calendar-pagination { display: flex; gap: 12px; align-items: center; }
.calendar-pagination h2 { font-size: 16px; min-width: 165px; text-align: center; text-transform: capitalize; }
.icon-button { border: 0; background: transparent; color: #7f8c7e; font-size: 23px; padding: 0 6px; line-height: 1.2; }
.calendar-note { font-size: 10px; color: var(--muted); padding: 0 24px 17px; }
.calendar-scroll { overflow-x: auto; }
.calendar-grid { display: grid; grid-template-columns: repeat(7, minmax(0,1fr)); min-width: 690px; }
.weekday { border-top: 1px solid var(--border); padding: 11px 15px; background: #f7f9f4; font-size: 10px; color: #869181; }
.calendar-day { border-top: 1px solid var(--border); border-right: 1px solid var(--border); min-height: 125px; padding: 10px 8px; }
.calendar-day:nth-child(7n) { border-right: 0; }
.calendar-day.outside { background: #fafbf8; color: #b2b9ac; }
.calendar-day.today .day-number { color: #fff; background: var(--green); border-radius: 50%; }
.day-number { width: 23px; height: 23px; display: grid; place-content: center; font-size: 10px; margin-bottom: 7px; }
.calendar-event { width: 100%; text-align: left; border: 0; border-left: 3px solid #80a474; background: #ecf3e5; color: #4b6746; padding: 7px 6px; border-radius: 4px; margin-bottom: 6px; }
.calendar-event span, .calendar-event small { display: block; font-size: 9px; line-height: 1.5; }
.calendar-event strong { display: block; font-size: 10px; margin: 3px 0; line-height: 1.4; overflow-wrap: anywhere; }
.calendar-event:hover { background: #dfebd3; }
.calendar-grid.week .calendar-day { min-height: 340px; }
.stats-panel { min-height: 350px; }
.stat-total { font-size: 21px; color: var(--green); font-weight: 600; white-space: nowrap; }
.activity-chart { display: grid; gap: 26px; padding: 25px 26px 38px; }
.chart-row { display: grid; grid-template-columns: 185px 1fr 130px; gap: 25px; align-items: center; }
.chart-label strong { display: block; font-size: 12px; font-weight: 600; }
.chart-label span { display: block; font-size: 10px; color: var(--muted); margin-top: 5px; }
.chart-track { height: 21px; background: #f2f4ed; border-radius: 5px; overflow: hidden; }
.chart-bar { height: 100%; border-radius: 5px; background: #749568; }
.chart-bar.color-1 { background: #b2c494; }.chart-bar.color-2 { background: #d7ad81; }.chart-bar.color-3 { background: #819a91; }
.chart-value { font-size: 16px; font-weight: 600; text-align: right; }
.chart-value small { font-size: 10px; font-weight: 400; color: var(--muted); }
.dialog-backdrop { position: fixed; inset: 0; z-index: 20; background: #132c25a8; padding: 22px; display: flex; align-items: center; justify-content: center; overflow: auto; }
.dialog { max-width: 580px; width: 100%; max-height: calc(100dvh - 44px); overflow: auto; background: #fff; border-radius: 15px; padding: 26px; box-shadow: 0 30px 80px #132c253d; }
.dialog-heading { display: flex; justify-content: space-between; align-items: flex-start; gap: 20px; margin-bottom: 20px; }
.dialog-heading .eyebrow { margin-bottom: 5px; font-size: 8px; }
.dialog-heading h2 { font-size: 23px; }
.form-note { color: var(--muted); font-size: 11px; line-height: 1.65; padding: 0 0 18px; }
.panel > .form-note { padding: 0 24px 18px; }
.form-note.api-warning { background: #fff2de; border-radius: 6px; color: #8b5b27; padding: 12px; margin-bottom: 16px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 17px; }
.form-grid label { display: flex; flex-direction: column; gap: 7px; min-width: 0; font-size: 11px; font-weight: 600; }
.form-grid input, .form-grid select { width: 100%; font-weight: 400; }
.full-width { grid-column: 1 / -1; }
[aria-invalid="true"] { border-color: #b9654c; }
.field-error { font-size: 10px; color: #a44931; line-height: 1.5; font-weight: 400; }
.dialog-actions { margin-top: 25px; display: flex; justify-content: flex-end; gap: 10px; flex-wrap: wrap; }
.confirmation-copy { font-size: 13px; line-height: 1.8; color: #6c786f; }
.training-details { margin: 0 0 18px; }
.training-details div { display: flex; justify-content: space-between; gap: 15px; padding: 12px 0; border-bottom: 1px solid var(--border); }
.training-details dt { font-size: 11px; color: var(--muted); }
.training-details dd { font-size: 12px; margin: 0; font-weight: 600; text-align: right; }
.sr-only { position: absolute; left: 0; top: 0; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
@media (max-width: 1100px) { .app-shell { padding: 0 24px; } .row-actions { gap: 8px; } .person { min-width: 145px; } td, th { padding-left: 12px; padding-right: 12px; } }
@media (max-width: 800px) { .site-header { flex-wrap: wrap; } .header-meta { margin-left: auto; } .intro-emblem { display: none; } .summary-grid { gap: 9px; } .summary-card { padding: 17px 14px; } .summary-card small { display: block; margin-top: 9px; } .panel-heading { align-items: flex-start; flex-wrap: wrap; } .filter-bar { flex-wrap: wrap; } .search-field { max-width: none; flex-basis: 100%; } .sort-label { margin-left: 0; } .chart-row { grid-template-columns: 135px 1fr 115px; gap: 13px; } .calendar-toolbar { flex-wrap: wrap; } .calendar-pagination { flex-wrap: wrap; } table { min-width: 740px; } }
@media (max-width: 520px) { .app-shell { padding: 0 16px; } .site-header { padding: 22px 0 15px; gap: 14px; } .header-meta { margin-left: 0; gap: 8px; } .brand { font-size: 17px; } .page-nav { gap: 0; justify-content: space-between; } .page-nav button { font-size: 11px; padding: 14px 2px; gap: 5px; } .page-nav button span { font-size: 16px; } main { padding-top: 27px; } h1 { font-size: 27px; } .intro { margin-bottom: 20px; } .eyebrow { font-size: 8px; letter-spacing: 1.3px; } .summary-grid { grid-template-columns: 1fr 1fr; margin-bottom: 20px; } .summary-card > strong { font-size: 29px; } .mode-note { align-items: flex-start; } .panel-heading, .filter-bar { padding-left: 16px; padding-right: 16px; } .panel-heading { padding-top: 19px; } .actions { width: 100%; } .button { padding: 9px 12px; } .panel-foot { padding: 12px 16px; } .panel-heading h2 { font-size: 17px; } .filter-bar { gap: 8px; } .sort-label { font-size: 9px; } .sort-label select { max-width: 220px; } .site-footer > span { display: none; } .site-footer { align-items: flex-start; font-size: 9px; } .calendar-toolbar { padding: 15px; gap: 13px; } .calendar-pagination { gap: 5px; } .calendar-pagination h2 { font-size: 14px; min-width: 140px; } .calendar-pagination .button { margin-left: 6px; } .calendar-note { padding: 0 15px 14px; line-height: 1.6; } .section-actions { flex-wrap: wrap; } .activity-chart { padding: 10px 17px 27px; gap: 25px; } .chart-row { grid-template-columns: 1fr 110px; gap: 10px; } .chart-track { grid-column: 1 / -1; grid-row: 2; height: 17px; } .stat-total { font-size: 18px; } .dialog-backdrop { padding: 12px; } .dialog { padding: 20px; max-height: calc(100dvh - 24px); } .form-grid { grid-template-columns: 1fr; } .dialog-heading h2 { font-size: 21px; } }
@media (max-width: 360px) { .page-nav { gap: 4px; } .page-nav button { flex: 1; justify-content: center; padding-left: 0; padding-right: 0; } .page-nav button span { display: none; } }
@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }
```

### tests/setup.ts

```typescript
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

afterEach(() => { cleanup(); localStorage.clear(); vi.restoreAllMocks(); });
```

### tests/domain.test.ts

```typescript
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
```

### tests/demo.test.ts

```typescript
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
```

### tests/api.test.ts

```typescript
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
```

### tests/App.test.tsx

```tsx
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import App from '../src/App';
import { createSeed } from '../src/demo';
import type { Repository } from '../src/types';

describe('интерфейс Personal Trainer', () => {
  it('показывает демо, поиск и пустой результат без обращения к сети', async () => {
    const fetcher = vi.spyOn(globalThis, 'fetch');
    render(<App />);
    expect(await screen.findByText('Алина Морозова')).toBeInTheDocument();
    expect(screen.getByText('Демо · локально')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Поиск клиентов'), { target: { value: 'неизвестный' } });
    expect(screen.getByText('Ничего не найдено')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Очистить поиск' }));
    expect(screen.getByText('София Ким')).toBeInTheDocument();
    expect(fetcher).not.toHaveBeenCalled();
    fetcher.mockRestore();
  });
  it('проверяет форму и создаёт, редактирует, удаляет клиента', async () => {
    render(<App />);
    await screen.findByText('Алина Морозова');
    fireEvent.click(screen.getByRole('button', { name: '+ Новый клиент' }));
    expect(screen.getByLabelText('Имя')).toHaveFocus();
    fireEvent.submit(screen.getByRole('form', { name: 'Форма клиента' }));
    expect(screen.getAllByText('Заполните поле.')).toHaveLength(7);
    const fields = { Имя: 'Тест', Фамилия: 'Студент', Email: 'student@example.test', Телефон: '+358 401234567', 'Улица и дом': 'Test street 1', 'Почтовый индекс': '00100', Город: 'Turku' };
    for (const [label, value] of Object.entries(fields)) fireEvent.change(screen.getByLabelText(label), { target: { value } });
    fireEvent.submit(screen.getByRole('form', { name: 'Форма клиента' }));
    await screen.findByText('Тест Студент');
    fireEvent.click(screen.getByRole('button', { name: 'Редактировать Тест Студент' }));
    fireEvent.change(screen.getByLabelText('Город'), { target: { value: 'Tampere' } });
    fireEvent.submit(screen.getByRole('form', { name: 'Форма клиента' }));
    await screen.findByText('Tampere');
    fireEvent.click(screen.getByRole('button', { name: 'Удалить Тест Студент' }));
    fireEvent.click(screen.getByRole('button', { name: 'Удалить клиента и тренировки' }));
    await waitFor(() => expect(screen.queryByText('Тест Студент')).not.toBeInTheDocument());
  });
  it('создаёт занятие, отображает в календаре и удаляет из карточки', async () => {
    render(<App />);
    await screen.findByText('Алина Морозова');
    fireEvent.click(screen.getByRole('button', { name: 'Тренировка для Алина Морозова' }));
    expect(screen.getByLabelText('Клиент')).toHaveValue('c1');
    fireEvent.change(screen.getByLabelText('Активность'), { target: { value: 'Проверка календаря' } });
    fireEvent.change(screen.getByLabelText('Длительность, мин'), { target: { value: '35' } });
    fireEvent.submit(screen.getByRole('form', { name: 'Форма тренировки' }));
    await screen.findByText('Тренировка добавлена в список и календарь.');
    fireEvent.click(screen.getByRole('button', { name: 'Календарь' }));
    const event = screen.getByRole('button', { name: /Проверка календаря, Алина Морозова/ });
    expect(event).toBeInTheDocument();
    fireEvent.click(event);
    const dialog = screen.getByRole('dialog');
    expect(within(dialog).getByText('35 минут')).toBeInTheDocument();
    fireEvent.click(within(dialog).getByRole('button', { name: 'Удалить тренировку' }));
    fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: 'Удалить тренировку' }));
    await waitFor(() => expect(screen.queryByRole('button', { name: /Проверка календаря, Алина Морозова/ })).not.toBeInTheDocument());
  });
  it('отменяет каскадное удаление и закрывает окно клавишей Escape', async () => {
    render(<App />);
    await screen.findByText('Алина Морозова');
    fireEvent.click(screen.getByRole('button', { name: 'Удалить Алина Морозова' }));
    expect(screen.getByText(/вместе со всеми связанными тренировками \(2\)/)).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(screen.getByText('Алина Морозова')).toBeInTheDocument();
  });
  it('переключает календарь, показывает итоги и сортирует тренировки', async () => {
    render(<App />);
    await screen.findByText('Алина Морозова');
    fireEvent.click(screen.getByRole('button', { name: 'Календарь' }));
    fireEvent.click(screen.getByRole('button', { name: 'Неделя' }));
    expect(screen.getByRole('button', { name: 'Неделя' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('heading', { name: '05.10.2026 — 11.10.2026' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Следующий период' }));
    expect(screen.getByRole('heading', { name: '12.10.2026 — 18.10.2026' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Статистика' }));
    expect(screen.getByText('5 ч 5 мин')).toBeInTheDocument();
    expect(screen.getByText(/Итог: 305 минут, 6 тренировок/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Тренировки' }));
    fireEvent.change(screen.getByLabelText('Сортировать тренировки'), { target: { value: 'duration-desc' } });
    const rows = screen.getAllByRole('row');
    expect(within(rows[1]).getByText('60')).toBeInTheDocument();
  });
  it('показывает ошибку и позволяет повторить загрузку', async () => {
    const repository = { list: vi.fn().mockRejectedValueOnce(new Error('HTTP 503')).mockResolvedValue(createSeed()), saveCustomer: vi.fn(), deleteCustomer: vi.fn(), addTraining: vi.fn(), deleteTraining: vi.fn() } as Repository;
    render(<App repository={repository} />);
    expect(await screen.findByRole('alert')).toHaveTextContent('HTTP 503');
    fireEvent.click(screen.getByRole('button', { name: 'Повторить загрузку' }));
    expect(await screen.findByText('Алина Морозова')).toBeInTheDocument();
  });
  it('не включает API без явного выбора и предупреждает перед переключением', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false);
    const fetcher = vi.spyOn(globalThis, 'fetch');
    render(<App enableLive />);
    await screen.findByText('Алина Морозова');
    fireEvent.click(screen.getByRole('button', { name: 'API' }));
    expect(confirm).toHaveBeenCalledWith(expect.stringContaining('общий API'));
    expect(fetcher).not.toHaveBeenCalled();
    expect(screen.getByText('Демо · локально')).toBeInTheDocument();
    confirm.mockRestore(); fetcher.mockRestore();
  });
  it('перед записью в API требует подтверждения, отмена не вызывает POST', async () => {
    const base = 'https://trainer.example/api/';
    const seed = createSeed().customers[0];
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(true).mockReturnValueOnce(false);
    const fetcher = vi.spyOn(globalThis, 'fetch').mockImplementation(async url => new Response(String(url).endsWith('gettrainings') ? '[]' : JSON.stringify({ _embedded: { customers: [{ ...seed, _links: { self: { href: `${base}customers/42` } } }] } })));
    render(<App enableLive apiUrl={base} />);
    await screen.findByText('Алина Морозова');
    fireEvent.click(screen.getByRole('button', { name: 'API' }));
    await waitFor(() => expect(screen.getByText('API · общая база')).toBeInTheDocument());
    await screen.findByRole('button', { name: 'Редактировать Алина Морозова' });
    fireEvent.click(screen.getByRole('button', { name: 'Редактировать Алина Морозова' }));
    fireEvent.change(screen.getByLabelText('Город'), { target: { value: 'Turku' } });
    fireEvent.submit(screen.getByRole('form', { name: 'Форма клиента' }));
    expect(confirm).toHaveBeenLastCalledWith(expect.stringContaining('ОБЩУЮ учебную базу'));
    expect(fetcher.mock.calls.every(call => !call[1]?.method || call[1].method === 'GET')).toBe(true);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
```

### scripts/build-manual.mjs

```javascript
import { readFile, writeFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = [
  'package.json', 'tsconfig.json', 'vite.config.ts', 'index.html', '.gitignore', '.nvmrc', '.env.example', 'public/icon.svg',
  'src/types.ts', 'src/domain.ts', 'src/demo.ts', 'src/api.ts', 'src/Dialog.tsx', 'src/Forms.tsx',
  'src/Calendar.tsx', 'src/App.tsx', 'src/main.tsx', 'src/styles.css',
  'tests/setup.ts', 'tests/domain.test.ts', 'tests/demo.test.ts', 'tests/api.test.ts', 'tests/App.test.tsx',
  'scripts/build-manual.mjs', 'scripts/check-docs.mjs', 'scripts/render-doc-preview.mjs',
];
const intro = (await readFile(path.join(root, 'docs/MANUAL-INTRO.md'), 'utf8')).replaceAll('\r\n', '\n').trimEnd();
const snippets = await Promise.all(files.map(async name => {
  const content = (await readFile(path.join(root, name), 'utf8')).replaceAll('\r\n', '\n').trimEnd();
  const language = name.endsWith('.tsx') ? 'tsx' : name.endsWith('.ts') ? 'typescript' : name.endsWith('.json') ? 'json' : name.endsWith('.html') ? 'html' : name.endsWith('.svg') ? 'xml' : name.endsWith('.css') ? 'css' : name.endsWith('.mjs') ? 'javascript' : 'text';
  const fence = '`'.repeat(Math.max(3, ...[...content.matchAll(/`+/g)].map(match => match[0].length + 1)));
  return `### ${name}\n\n${fence}${language}\n${content}\n${fence}\n`;
}));
const appendix = `${snippets.join('\n')}\n`;
const manual = `${intro}\n\n${appendix}`;
const destinations = [{ name: path.join(root, 'docs/MANUAL.md'), value: manual }];
const guidesDir = path.resolve(root, '../../guides');
if (process.argv.includes('--bundle-guide')) {
  if (!(await stat(path.join(guidesDir, 'final-frontend-personal-trainer.md')).then(value => value.isFile()).catch(() => false))) throw new Error('Параметр --bundle-guide используется только внутри исходного учебного комплекта.');
  const guideIntro = intro.replace(/\]\(([^)]+)\)/g, (match, target) => {
    if (/^(?:[a-z]+:|#)/i.test(target)) return match;
    const [file, fragment] = target.split('#');
    const relative = path.relative(guidesDir, path.resolve(root, 'docs', file)).replaceAll('\\', '/');
    return `](${relative}${fragment ? `#${fragment}` : ''})`;
  });
  destinations.push({ name: path.join(guidesDir, 'final-frontend-personal-trainer.md'), value: `${guideIntro}\n\n${appendix}` });
}
let stale = false;
for (const destination of destinations) {
  if (process.argv.includes('--check')) {
    const saved = await readFile(destination.name, 'utf8').catch(() => '');
    if (saved.replaceAll('\r\n', '\n') !== destination.value) { console.error(`Outdated: ${path.basename(destination.name)}`); stale = true; }
  } else await writeFile(destination.name, destination.value, 'utf8');
}
if (stale) process.exitCode = 1;
else console.log(`${process.argv.includes('--check') ? 'Verified' : 'Generated'} complete source listings: ${files.length} files, ${destinations.length} documents.`);
```

### scripts/check-docs.mjs

```javascript
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const names = ['README.md', 'docs/ASSIGNMENT.md', 'docs/MANUAL-INTRO.md', 'docs/MANUAL.md', 'docs/VERIFICATION.md'];
const guide = path.resolve(root, '../../guides/final-frontend-personal-trainer.md');
if (await stat(guide).then(value => value.isFile()).catch(() => false)) names.push(guide);

function prose(text) {
  let fence = 0;
  return text.split(/\r?\n/).filter(line => {
    const match = /^\s*(`{3,})/.exec(line);
    if (match) { fence = fence ? match[1].length >= fence ? 0 : fence : match[1].length; return false; }
    return !fence;
  }).join('\n');
}
function anchors(text) {
  return new Set([
    ...[...text.matchAll(/<a\s+id="([^"]+)"/g)].map(match => match[1]),
    ...[...text.matchAll(/^#{1,6}\s+(.+)$/gm)].map(match => match[1].toLowerCase().replace(/[^\p{L}\p{N}\s-]/gu, '').replace(/\s+/g, '-')),
  ]);
}

let count = 0;
const failures = [];
for (const name of names) {
  const source = path.resolve(root, name);
  const text = prose(await readFile(source, 'utf8'));
  for (const match of text.matchAll(/\]\(([^)]+)\)/g)) {
    const target = match[1];
    if (/^[a-z]+:/i.test(target)) continue;
    const [file, fragment] = target.split('#');
    const destination = file ? path.resolve(path.dirname(source), file) : source;
    // Cross-kit references are available only in the original bundle.
    if (!destination.startsWith(`${root}${path.sep}`) && !(await stat(path.resolve(root, '../../assignments')).then(value => value.isDirectory()).catch(() => false))) continue;
    try {
      if (!(await stat(destination)).isFile()) throw new Error('not a file');
      if (fragment && !anchors(prose(await readFile(destination, 'utf8'))).has(decodeURIComponent(fragment))) throw new Error('missing anchor');
      count += 1;
    } catch { failures.push(`${path.basename(source)} → ${target}`); }
  }
}
if (failures.length) { console.error(failures.join('\n')); process.exitCode = 1; }
else console.log(`Markdown links verified: ${count}; documents: ${names.length}.`);
```

### scripts/render-doc-preview.mjs

```javascript
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

// Optional verification helper. Pass an already available marked ES module.
// It installs nothing and is not needed by the app or npm ci/test/build.
if (!process.argv[2]) throw new Error('Передайте путь к существующему marked/lib/marked.esm.js.');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const { marked } = await import(pathToFileURL(path.resolve(process.argv[2])).href);
const text = await readFile(path.join(root, 'docs/MANUAL.md'), 'utf8');
const output = path.join(root, 'output/playwright');
await mkdir(output, { recursive: true });
const html = `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" type="image/svg+xml" href="/icon.svg"><title>Personal Trainer — учебный мануал</title><style>
body{margin:0;background:#f6f5ef;color:#26372f;font:16px/1.65 system-ui,sans-serif}main{max-width:1120px;margin:30px auto;padding:38px;background:white;border:1px solid #e3e7df;border-radius:12px}h1{font-size:32px;line-height:1.2}h2{margin-top:38px;padding-top:12px;border-top:1px solid #e3e7df;font-size:23px}h3{font-size:17px;color:#214b41;margin-top:28px}p,li{max-width:95ch}a{color:#21584a}pre{background:#f1f4ee;padding:18px;border-radius:8px;overflow:auto;font-size:12px;line-height:1.6}code{font-family:ui-monospace,monospace}p code,li code,td code{font-size:.85em;background:#f1f4ee;padding:1px 3px}table{border-collapse:collapse;width:100%;font-size:13px;line-height:1.6}th,td{border:1px solid #e3e7df;text-align:left;padding:9px}th{background:#f1f4ee}blockquote{border-left:3px solid #749568;padding-left:16px}@media(max-width:600px){main{margin:12px;padding:18px}h1{font-size:26px}table{font-size:11px}th,td{padding:5px}}
</style></head><body><main>${marked.parse(text)}</main></body></html>`;
await writeFile(path.join(output, 'manual.html'), html, 'utf8');
console.log('Generated output/playwright/manual.html for visual verification.');
```

