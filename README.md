# EXPY

## Описание

EXPY — это веб-приложение для взаимодействия с образовательными ресурсами в формате викторин и тестов.  
Пользователи могут создавать собственные викторины, проходить тесты по готовым темам и отслеживать свой прогресс.

## Основные возможности

- **Создание и редактирование викторин**  
- **Прохождение тестов** с выводом результатов и статистикой  
- **Профиль пользователя** с историей прохождений   
- **Административная панель** для управления пользователями и контентом

## Стек технологий

- **Frontend:** ReactJS, JavaScript, Redux, CSS  
- **Backend:** Node.js, Express, MySQL, WebSocket   
- **Аутентификация:** JWT, OAuth2 (Google, GitHub)  

## Требования

- Node.js ≥ 16.0  
- npm ≥ 8.0 или yarn ≥ 1.22  
- MySQL

## Установка и запуск

1. Клонировать репозиторий и перейти в корень проекта:
   ```bash
   git clone https://github.com/Alekseikorosov/EXPY-App.git
   cd EXPY
   
2. Установить зависимости для фронтенда:
   cd frontend
   npm install
   или
   yarn install
   
3. Установить зависимости для бэкенда:
   cd ../backend
   npm install
   или
   yarn install

4. Настроить переменные окружения в обоих сервисах:
   # .env в frontend
   REACT_APP_API_URL=http://localhost:3000/api
   
   # .env в backend
   DB_HOST=localhost
   DB_USER="user"
   DB_PASS="password"
   DB_NAME="database_name"
   DB_PORT=3306
   
   ACCESS_TOKEN_SECRET="your secret"
   REFRESH_TOKEN_SECRET="your secret"
   
   EMAIL_USER=example@mail.com
   EMAIL_PASS="your emal app code"
   
   MYSQL_URI=mysql://root:@localhost:3306/database_name

5. Запустить фронтенд и бэкенд в режиме разработки:
   # В одном терминале
   cd frontend
   npm start
   
   # В другом терминале
   cd backend
   npm run dev
   
6. Открыть приложение в браузере:
   http://localhost:3000
   
## Тестирование

### Запуск юнит-тестов фронтенда:
   cd frontend
   npm test
   
### Запуск тестов бэкенда:
   cd backend
   npm test

## Развёртывание

1. Собрать фронтенд:
   cd frontend
   npm run build
   
3. Создать Docker-композиторий:
   docker-compose up --build -d
   
