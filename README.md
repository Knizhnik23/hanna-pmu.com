# Hanna · PMU — сайт

Статический сайт (HTML + CSS + JS, без библиотек). Работает на GitHub Pages как есть.

## Структура
```
index.html, impressum.html, datenschutz.html   ← собранные страницы (не править руками)
build.js                                        ← сборка страниц
assets/js/i18n.js    ← ВСЕ тексты: de (основной) и ru
assets/js/config.js  ← телефон WhatsApp, Telegram, Instagram, ссылка на Google
assets/js/main.js    ← интерактив и анимации
assets/css/styles.css← стили, токены из Figma вверху файла
assets/img/          ← изображения (имена = фреймы на странице «Export – Web» в Figma)
assets/fonts/        ← шрифты Manrope и Outfit (локально, без Google Fonts — DSGVO)
```

## Как поменять текст или контакты
1. Править `assets/js/i18n.js` (тексты) или `assets/js/config.js` (контакты).
2. Запустить `node build.js` — пересоберутся `index.html`, `impressum.html`, `datenschutz.html`.
3. Закоммитить и запушить.

## Как заменить фото
Экспортировать из Figma страницу «Export – Web» (выделить всё → Export) и положить файлы в `assets/img/` с теми же именами.

## Публикация на GitHub Pages + свой домен

### 1. Репозиторий
1. github.com → **New repository** → имя, например `hanna-pmu` → **Public** → Create.
2. На странице репозитория: **uploading an existing file** → перетащить ВСЁ содержимое этой папки
   (не саму папку, а файлы и папки внутри: `index.html`, `assets/`, `.nojekyll` …) → **Commit changes**.
   Через терминал то же самое:
   ```
   git init && git add . && git commit -m "Website"
   git branch -M main
   git remote add origin https://github.com/<логин>/hanna-pmu.git
   git push -u origin main
   ```

### 2. Включить Pages
Settings → **Pages** → Source: **Deploy from a branch** → Branch: `main`, папка `/ (root)` → Save.
Через 1–2 минуты сайт откроется по адресу `https://<логин>.github.io/hanna-pmu/`.

### 3. Свой домен (например hanna-pmu.de)
1. Settings → Pages → **Custom domain** → ввести `www.hanna-pmu.de` → Save
   (GitHub сам создаст файл `CNAME` в репозитории).
2. У регистратора домена (IONOS, Strato, Namecheap …) в DNS:
   - `CNAME`  `www`  →  `<логин>.github.io`
   - `A`  `@`  →  `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153` (четыре записи)
   - старые A/CNAME-записи для `@` и `www` удалить.
3. Подождать (от 10 минут до 24 часов), потом в Settings → Pages поставить галочку **Enforce HTTPS**.
4. Проверить IP-адреса в актуальной инструкции GitHub: docs.github.com → «Managing a custom domain for your GitHub Pages site».

### 4. Обновления
Поменяли текст → `node build.js` → загрузить изменённые файлы в репозиторий (или `git add . && git commit -m "…" && git push`). Pages обновится сам.

## Перед запуском (обязательно)
- Заполнить контакты в `config.js`.
- Тексты Impressum и Datenschutz.
- Заменить заглушки «[…]» и «XX» в `i18n.js` (отзывы, ответы FAQ, сроки).
- Настоящие фото вместо заглушек.
