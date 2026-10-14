# React — Personal Trainer, итоговый проект

CRUD клиентов/тренировок, календарь, CSV и статистика. Официальные Part 1–4 отсутствуют; не объявлять собственные этапы их точным восстановлением.

Маршрут: прочитать условия → установить зависимости → запустить → пройти проверки → подготовить к сдаче.

## Условия

- [final-frontend-personal-trainer.md](docs/materials/homework-2026-10-03/assignments/final-frontend-personal-trainer.md)

## Запуск из чистой копии

Нужны Node.js (>=22.12.0) и npm. Откройте терминал в корне этого репозитория рядом с package.json.

~~~bash
node --version
npm --version
npm ci
npm run dev
~~~

Откройте локальный адрес, показанный Vite в терминале. Остановка: Ctrl+C.

Если нужен внешний сервис, скопируйте .env.example в .env и заполните параметры по руководству. Настоящий .env не включён. Для demo используйте параметры исходного руководства.

## Проверка

~~~bash
npm run typecheck
npm test
npm run build
~~~

В этой упаковке установки и проверки не выполнялись. Сборка, браузер, macOS и реальное устройство имеют отдельный статус; наличие файлов не означает готовность к сдаче.

## Разбор и материалы

- [Исходное руководство приложения](docs/PROJECT-README.md)


## Зависимости и открытые проверки

- Внешний API, доступ к сети или настройки сервиса могут требоваться по исходному руководству. Доступность сервиса сейчас не проверялась.

## Объективные пробелы

- Personal Trainer official Part 1–4 отсутствуют в исходных материалах.


## Единый запуск

```bash
bash ./build-and-run.sh --list
bash ./build-and-run.sh
```

[Запуск и перенос в свой GitHub](docs/CLIENT-HANDOFF.md).

<!-- upstream-tools:start -->
## Скачать независимую копию

В папке `delivery-tools` находятся скрипт, Python companion и каталог всех 24 проектов.
Нужны Git, Python 3.9+ и Bash 3.2+ (macOS/Linux или Windows через WSL/Git Bash).

```bash
mkdir -p "$HOME/Projects"
bash delivery-tools/export-project.sh --catalog delivery-tools/projects.tsv --project web-trainer --dest "$HOME/Projects/polina-personal-trainer" --init-git
```

Результат: отдельная папка с новым Git без исходной истории и remote. Без
`--init-git` Git metadata отсутствует. [Все параметры](delivery-tools/README.md).
Отмеченный downloader и этот блок удаляются из чистой копии автоматически.
<!-- upstream-tools:end -->
