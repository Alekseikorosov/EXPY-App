import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SessionExpiredPage.css';

function SessionExpiredPage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    // Используем replace, чтобы не сохранять эту страницу в истории
    navigate('/', { replace: true });
  };

  return (
    <div className="session-expired-container">
      <h2>Сессия истекла</h2>
      <p>Вы превысили время ожидания. Пожалуйста, вернитесь на главную страницу и попробуйте снова.</p>
      <button onClick={handleGoHome}>Вернуться на главную</button>
    </div>
  );
}

export default SessionExpiredPage;
