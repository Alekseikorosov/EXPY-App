import React, { useState} from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosInstance'; // ваш инстанс с baseURL и интерсепторами
import '../styles/LoginPage.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState(() => localStorage.getItem('loginEmail') || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  // const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss('');

    // очищаем старые токены/данные
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tempUserId');
    localStorage.removeItem('loginEmail'); 

    try {
      const response = await api.post('/auth/login', { email, password });

      // если у пользователя включена 2FA — перенаправляем на экран ввода кода
      if (response.data.twofaRequired) {
        localStorage.setItem('tempUserId',  response.data.tempUserId); // для 2FA-login
        localStorage.setItem('loginEmail',   email);                    // на случай нужды
        navigate('/2fa-login');
      } else {
        // обычный вход: сохраняем оба токена и идём на главную
        const { accessToken, refreshToken } = response.data;
        localStorage.setItem('accessToken',  accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        navigate('/');
      }
    } 
    catch (err) {
        console.error('Error logging in:', err);
        // ⬇️  СТЕЙТЫ email / password НЕ трогаем → поля остаются заполненными
        const msg = err.response?.data?.error || 'Incorrect credentials';
        toast.error(msg);
        }
      };

      const toggleShowPassword = () => setShowPassword(prev => !prev);

  return (
    <div className="login-container">
      <div className="login-card">
        {/* <h2 className="login-title">Sign In</h2> */}

        {/* {errorMessage && <p className="login-error">{errorMessage}</p>} */}

        <form onSubmit={handleSubmit}>
          <div className="login-input-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="text"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="login-input-group">
            <label htmlFor="password">Password</label>
            <div className="password-wrapper">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
              />

              <button
                type="button"
                className="eye-button"
                onClick={toggleShowPassword}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <div className="reset-link">
            <button
              type="button"
              className="link-button"
              onClick={() => navigate('/resetpass')}
            >
              Reset password
            </button>
          </div>

          <button type="submit" className="login-button">
            Sign In
          </button>
        </form>

        <div className="signup-link">
          <p>Don’t have an account?</p>
          <button
            type="button"
            className="link-button"
            onClick={() => navigate('/register')}
          >
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
