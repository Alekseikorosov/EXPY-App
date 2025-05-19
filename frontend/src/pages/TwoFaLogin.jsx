// TwoFaLogin.jsx
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosInstance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/TwoFaLogin.css';

function TwoFaLogin() {
  const [codeArr, setCodeArr] = useState(new Array(6).fill(''));
  const inputsRef = useRef([]);
  const navigate = useNavigate();

  const handleChange = (e, idx) => {
    const val = e.target.value.replace(/\D/, '').slice(0, 1);
    const arr = [...codeArr];
    arr[idx] = val;
    setCodeArr(arr);
    if (val && idx < 5) inputsRef.current[idx + 1].focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !codeArr[idx] && idx > 0) {
      inputsRef.current[idx - 1].focus();
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const tempUserId = localStorage.getItem('tempUserId');
    const code = codeArr.join('');
    try {
      const { data } = await api.post('/auth/2fa-login', { tempUserId, code });
      if (data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        data.refreshToken && localStorage.setItem('refreshToken', data.refreshToken);
        localStorage.removeItem('tempUserId');
        navigate('/');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Invalid 2FA code';
      toast.error(msg);
    }
  };

  return (
    <div className="twofa-page">
    <h2>Two-Factor Authentication (2FA)</h2>
      <div className="twofa-card">
        <form onSubmit={handleSubmit} className="twofa-form">
          <label className="twofa-label">Enter your one-time code</label>
          <div className="twofa-inputs">
            {codeArr.map((digit, idx) => (
              <input
                key={idx}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                ref={el => (inputsRef.current[idx] = el)}
                onChange={e => handleChange(e, idx)}
                onKeyDown={e => handleKeyDown(e, idx)}
              />
            ))}
          </div>
          <button type="submit" className="twofa-submit">Sign In</button>
        </form>
        <button
          type="button"
          className="twofa-alt"
          onClick={() => navigate('/alternative-methods')}
        >
          Use another method
        </button>
      </div>
      <ToastContainer />
    </div>
  );
}

export default TwoFaLogin;
