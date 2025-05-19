// export default AlternativeMethods;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/AlternativeMethods.css';

import axios from '../utils/axiosInstance';   // baseURL = http://localhost:5000/api
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function AlternativeMethods() {
    const navigate = useNavigate();

    const handleBack = () => navigate(-1);
    const handleRecoveryCode = () => navigate('/recovery-code');

    /* ── вход по коду из письма ────────────────────────── */
    const handleEmailConfirmation = async () => {
        const email = localStorage.getItem('loginEmail');      // сохранили в LoginPage

        if (!email) {
            toast.error('Session expired — log in again');
            navigate('/login');
            return;
        }

        try {
            /* POST http://localhost:5000/api/email-login/send */
            await axios.post('/email-login/send', { email });

            toast.info('We sent the code to ' + email);
            navigate('/email-confirmation');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send code');
        }
    };

    return (
        <div className="alternative-container">
            <h2 className="alternative-title">Sign in using the following methods:</h2>

            <div className="method-line" onClick={handleBack}>
                Use authenticator application
            </div>
            <div className="method-line" onClick={handleRecoveryCode}>
                Use recovery code
            </div>
            <div className="method-line" onClick={handleEmailConfirmation}>
                Use email confirmation
            </div>

            <button className="back-btn" onClick={handleBack}>← Back</button>
        </div>
    );
}

export default AlternativeMethods;
