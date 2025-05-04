import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosInstance';
import '../styles/RegisterPage.css';

function RegisterPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
  const usernameRegex = /^(?=.{4,13}$)[a-zA-Z0-9_.-]+$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('Пароли не совпадают');
      return;
    }

    if (!passwordRegex.test(password)) {
      setErrorMessage(
        'Пароль должен быть не короче 8 символов, ' +
        'содержать хотя бы одну цифру, одну заглавную букву, ' +
        'одну строчную букву и спецсимвол из !@#$%^&*.'
      );
      return;
    }

    if (!usernameRegex.test(username)) {
      setErrorMessage(
        'Недопустимый username. Минимум 4 символа, лат. буквы, цифры, _, ., -.'
      );
      return;
    }

    try {
      const response = await api.post('/auth/register', {
        username,
        email,
        telephone: phoneNumber,
        password
      });
      setSuccessMessage(response.data.message || 'Регистрация прошла успешно');

      setTimeout(() => {
        navigate('/login');
      }, 2000);

    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('Ошибка регистрации. Попробуйте еще раз.');
      }
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Регистрация</h2>

        {errorMessage && <p className="register-error">{errorMessage}</p>}
        {successMessage && <p className="register-success">{successMessage}</p>}

        <form onSubmit={handleSubmit}>
          <div className="register-input-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Введите username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="register-input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Введите email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="register-input-group">
            <label htmlFor="phoneNumber">Номер телефона</label>
            <input
              id="phoneNumber"
              type="tel"
              placeholder="Введите номер телефона"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
            />
          </div>

          <div className="register-input-group">
            <label htmlFor="password">Пароль</label>
            <input
              id="password"
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="register-input-group">
            <label htmlFor="confirmPassword">Подтвердите пароль</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Подтвердите пароль"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="register-button">
            Зарегистрироваться
          </button>
        </form>
      </div>
    </div>
  );
}

export default RegisterPage;
