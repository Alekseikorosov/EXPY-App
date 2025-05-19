import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/SessionExpiredPage.css';
import { FiClock } from 'react-icons/fi'; // иконка таймера

function SessionExpiredPage() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  return (
    <div className="session-expired-container">
      <FiClock className="session-expired-icon" />
      <h2 className="session-expired-title">Session Expired</h2>
      <p className="session-expired-text">
        Your session has timed out due to inactivity. Please return to the home page to start again.
      </p>
      <button className="session-expired-button" onClick={handleGoHome}>
        Go to Home
      </button>
    </div>
  );
}

export default SessionExpiredPage;
