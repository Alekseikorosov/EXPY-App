import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosInstance';
import '../styles/LoginPage.css';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    try {
      const response = await api.post('/auth/login', {
        email,
        password
      });
      const { accessToken, refreshToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      navigate('/');
    } catch (error) {
      console.error('Ошибка при входе:', error);
      if (error.response && error.response.data && error.response.data.error) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('Неверные учетные данные или ошибка сервера');
      }
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">Login</h2>

        {errorMessage && (
          <p className="login-error">{errorMessage}</p>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="login-input-group">
            <label htmlFor="email">Email</label>
            <input 
              id="email" 
              type="text" 
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="login-input-group">
            <label htmlFor="password">Password</label>
            <input 
              id="password" 
              type="password" 
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="reset-link">
            <button 
              type="button" 
              className="link-button"
              onClick={() => {
                navigate('/resetpass');
              }}
            >
              Reset password
            </button>
          </div>

          <button 
            type="submit" 
            className="login-button"
          >
            Sign In
          </button>
        </form>

        <div className="signup-link">
        <p>Don&apos;t have an account?</p>
          <button 
            type="button" 
            className="link-button"
            onClick={() => {
              navigate('/register');
            }}
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
