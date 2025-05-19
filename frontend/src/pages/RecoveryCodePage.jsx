import React, { useState } from 'react';
import api from '../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/RecoveryCodePage.css';

function RecoveryCodePage() {
  const [recoveryCode, setRecoveryCode] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!recoveryCode.trim()) {
      toast.error('Enter recovery code');
      return;
    }

    try {
     const { data } = await api.post('/twofactor/recovery-code/verify', {
        email: localStorage.getItem('loginEmail'),
        code:  recoveryCode
        });

      if (data.success && data.accessToken) {
        localStorage.setItem('accessToken', data.accessToken);
        if (data.refreshToken) {
          localStorage.setItem('refreshToken', data.refreshToken);
        }
        toast.success('Recovery code accepted – keep the new one!');
        localStorage.removeItem('loginEmail');
        navigate('/new-recovery-code', { state: { newCode: data.newCode } });
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message || 'Invalid or expired recovery code'
      );
      // Не перенаправляем, только показываем ошибку
    }
  };

  return (
    <div className="recovery-container">
      <h1 className="recovery-title">Recovery Code</h1>
      <p className="recovery-subtitle">Enter your recovery code!</p>

      <div className="recovery-card">
        <form onSubmit={handleSubmit} className="recovery-form">
          <label htmlFor="recoveryCode">Code</label>
          <input
            type="text"
            id="recoveryCode"
            value={recoveryCode}
            onChange={(e) => setRecoveryCode(e.target.value)}
            className="recovery-input"
            placeholder="Enter your code"
          />

          <button
            type="submit"
            className="recovery-button"
            disabled={!recoveryCode.trim()}
          >
            Confirm
          </button>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
}

export default RecoveryCodePage;
