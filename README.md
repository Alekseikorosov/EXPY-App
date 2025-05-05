# EXPY

## Description

EXPY is a web application for quizzes and tests. Users can create their own quizzes, take tests on predefined topics, and track their progress.

## Contributions

List of actions performed by each team member.

**Juri Degtjarjov**

* Designed the web application layout
* Developed the main page of the web application
* Created the password recovery page
* Implemented user login functionality (backend structure)
* Built the user profile page
* Designed and created the database for the web application
* Developed the user quiz history component
* Created the quiz creation page
* Enabled saving favorite quizzes for users
* Implemented game session creation
* Configured email service for sending messages
* Built the admin panel
* Tested the web application
* Deployed the application to the server

**Aleksei Korosov**

* Designed the web application layout
* Created the password recovery page
* Designed and created the database for the web application
* Configured email service for sending messages
* Implemented user name, email, and password update functionality
* Integrated two-factor authentication (authenticator app, recovery code, email confirmation)
* Tested the web application

**Oleg Koik**

* Designed all project icons and logo
* Designed the web application layout
* Developed the user registration form
* Developed the login form
* Wrote styles for all pages, modal windows, and responsive design
* Tested the web application

## Key Features

* Quiz creation and editing
* Taking tests with result display and statistics
* User registration and login
* Password recovery via email links
* Two-factor authentication (TOTP via authenticator apps, recovery codes, email confirmation)
* User profile management (viewing and updating name, email, password)
* Quiz history tracking with progress visualization
* Saving and accessing favorite quizzes
* Game session management for quizzes
* Configurable email notifications for key user actions
* Admin panel for managing users, quizzes
* Responsive design for desktop and mobile with styled modals and pages
* Robust database schema using MySQL and Sequelize ORM.

## Technology Stack

### Frontend

* **react** — library for building declarative UI components
* **react-dom** — package for working with the browser DOM
* **react-scripts** — scripts and configuration from Create React App
* **antd** — UI framework with ready-made React components
* **react-router-dom** — declarative routing
* **axios** — HTTP client for making requests to the server
* **jwt-decode** — utility for decoding JWT tokens on the client
* **react-toastify** — library for toast notifications

### Backend

* **express** — web framework for routing and middleware
* **sequelize** — ORM for working with a MySQL database using models
* **mysql2** — MySQL driver
* **dotenv** — loading configuration from `.env`
* **bcrypt** — password hashing for secure storage
* **jsonwebtoken** — creating and verifying JWT tokens
* **jwt-decode** — parsing JWT tokens
* **speakeasy** — TOTP two-factor authentication implementation
* **body-parser** and **cors** — middleware for request body parsing and CORS
* **nodemailer** — sending emails from Node.js
* **qrcode** — generating QR codes for 2FA
* **For developers:**
  * **node-cron** — scheduling background tasks
  * **nodemon** — automatic server restart on code changes

## Requirements

* Node.js ≥ 16.0
* npm ≥ 8.0 or yarn ≥ 1.22
* MySQL, XAMPP

## Installation and Setup

### 1. Clone the repository and navigate to the project root:

```bash
git clone https://github.com/Alekseikorosov/EXPY-App.git
```

### 2. Install frontend dependencies:

```bash
cd frontend
npm install # or yarn install
```

### 3. Install backend dependencies:

```bash
cd ../backend
npm install # or yarn install
```

### 4. Set up SMTP service for email:

1. Install Nodemailer:

```bash
npm install nodemailer dotenv
```

2. Create a `.env` file in the project root:

```ini
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your.email@gmail.com
SMTP_PASS=your_password_or_app_password
```

3. Configure the mailer (`mailer.js`):

```js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: +process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

export const sendMail = ({ to, subject, html }) =>
  transporter.sendMail({
    from: `"EXPY" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html
  });
```

4. Send a test email:

```js
import { sendMail } from './mailer.js';

await sendMail({
  to: user.email,
  subject: 'Password Recovery',
  html: `<p>Click <a href="${resetLink}">here</a> to reset your password</p>`
});
```

### 5. Configure environment variables for both services:

Create a `.env` file in the `backend` directory:

```ini
DB_HOST=localhost
DB_USER=user
DB_PASS=password
DB_NAME=database_name
DB_PORT=3306
ACCESS_TOKEN_SECRET=your_secret
REFRESH_TOKEN_SECRET=your_secret
EMAIL_USER=example@mail.com
EMAIL_PASS=your_email_app_password
```

### 6. Run frontend and backend in development mode:

* In one terminal:

```bash
cd frontend
npm start
```

* In another terminal:

```bash
cd backend
npm run dev
```

### 7. Open the application in your browser:

[http://localhost:3000](http://localhost:3000)

## Testing

* **Frontend unit tests:**

```bash
cd frontend
npm test
```

* **Backend tests:**

```bash
cd backend
npm test
```
