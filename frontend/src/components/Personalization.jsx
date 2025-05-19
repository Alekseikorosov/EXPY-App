// export default Personalization;
import React, { useState, useEffect } from 'react';
import api from '../utils/axiosInstance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Personalization.css';


const Personalization = () => {
    const [activeSection, setActiveSection] = useState('default'); // 'default' | 'editUsername' | 'editEmail'
    const [newUsername, setNewUsername] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [emailPassword, setEmailPassword] = useState('');
    const [message, setMessage] = useState('');
    const [userData, setUserData] = useState({
        username: '',
        email: '',
        lastUsernameChange: null,
        lastEmailChange: null,
    });
    const getNextDate = (last, days) =>
        last ? new Date(new Date(last).getTime() + days * 86_400_000) : null;

    // Получаем свежие данные пользователя
    const loadProfile = async () => {
    try {
        const { data } = await api.get('/users/profile');
        const {
        username,
        email,
        lastUsernameChange,
        lastEmailChange,
        } = data;
        setUserData({ username, email, lastUsernameChange, lastEmailChange });
    } catch (err) {
        console.error('Ошибка получения профиля:', err);
    }
    };


    useEffect(() => {
    if (localStorage.getItem('accessToken')) loadProfile();
    }, []);

    const handleUsernameChange = async () => {
        setMessage('');
        // Клиентская валидация username
        const usernameRegex = /^[A-Za-z0-9_.-]{4,13}$/;
        if (!usernameRegex.test(newUsername)) {
            toast.error(
                'Invalid username format. Only Latin letters, digits, hyphen (-), underscore (_), and period (.) are allowed, and the username must be between 4 and 13 characters long.'
            );
            return;
        }

        try {
            const response = await api.put(
                '/users/username',
                { newUsername },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
                }
            );
            toast.success(response.data.message || 'Username updated successfully');
            if (response.data.accessToken)  localStorage.setItem('accessToken',  response.data.accessToken);
            if (response.data.refreshToken) localStorage.setItem('refreshToken', response.data.refreshToken);


            await loadProfile();                              
            setNewUsername('');
            setActiveSection('default');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Server error');
        }
    };

    const handleEmailChange = async () => {
        setMessage('');
        // Валидация email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(newEmail)) {
            toast.error('Invalid email format.');
            return;
        }
        if (!emailPassword) {
            toast.error('Please enter your password.');
            return;
        }
        try {
            const response = await api.put(
                '/users/email',
                { newEmail, password: emailPassword },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
                }
            );
            toast.success(response.data.message || 'Email updated successfully');
            await loadProfile(); 
            if (response.data.forceLogout) {
                localStorage.clear();        
                window.location.href = '/login';
                return;                      
                }
            setNewEmail('');
            setEmailPassword('');
            setActiveSection('default');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Server error');
        }
    };

    return (
        <div className="settings-content">
            {activeSection === 'default' && (
                <>
                    <div className="setting-section">
                        <div className="setting-header">
                            <h3>Username</h3>
                            {(() => {
                                const next = getNextDate(userData.lastUsernameChange, 14); // 14-дн. «карантин»
                                return next && next > new Date() ? (
                                <span className="cooldown-msg">
                                    You can’t change your username until&nbsp;
                                    <span className="cooldown-date">{next.toLocaleDateString()}</span>
                                </span>
                                ) : (
                                <button className="change-btn" onClick={() => setActiveSection('editUsername')}>
                                    Change
                                </button>
                                );
                            })()}
                        </div>
                        <p>
                            Username is a unique identifier used to log in to a system or represent a user account.
                        </p>
                        <ul>
                            <li>Only Latin letters are allowed.</li>
                            <li>Digits (0-9) are allowed.</li>
                            <li>Allowed symbols: hyphen (-), underscore (_), and period (.)</li>
                            <li>All other special characters are prohibited.</li>
                            <li>The username must be between 4 and 13 characters long.</li>
                            <li>After changing your username, you cannot change it again for 14 days.</li>
                        </ul>
            
                    </div>

                    <hr />

                    <div className="setting-section">
                        <div className="setting-header">
                        <h3>Email</h3>
                        {(() => {
                            const next = getNextDate(userData.lastEmailChange, 30); // 30-дн. «карантин»
                            return next && next > new Date() ? (
                            <span className="cooldown-msg">
                                You can’t change your email until&nbsp;
                                <span className="cooldown-date">{next.toLocaleDateString()}</span>
                            </span>
                            ) : (
                            <button className="change-btn" onClick={() => setActiveSection('editEmail')}>
                                Change
                            </button>
                            );
                        })()}
                        </div>
                        <p>
                            We can send you login confirmation emails as well as notifications when enabling two-factor
                            authentication to provide additional protection for your account.
                        </p>
                        
                    </div>
                </>
            )}

            {activeSection === 'editUsername' && (
                <div className="setting-section">
                    <h3>“{userData.username}” change to:</h3>
                    <input
                        type="text"
                        placeholder="New username"
                        className="input-field"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                    />
                    <button className="change-btn" onClick={handleUsernameChange}>
                        Change
                    </button>
                    {message && <p>{message}</p>}
                    <div className="username-rules">
                        <strong>Username Rules:</strong>
                        <ul>
                            <li>Only Latin letters are allowed.</li>
                            <li>Digits (0-9) are allowed.</li>
                            <li>Allowed symbols: hyphen (-), underscore (_), and period (.)</li>
                            <li>All other special characters are prohibited.</li>
                            <li>The username must be between 4 and 13 characters long.</li>
                            <li>After changing your username, you cannot change it again for 14 days.</li>
                        </ul>
                    </div>
                    <button className="back-btn" onClick={() => setActiveSection('default')}>
                        ← Back
                    </button>
                </div>
            )}

            {activeSection === 'editEmail' && (
                <div className="setting-section">
                    <h3>“{userData.email}” change to:</h3>
                    <input
                        type="email"
                        placeholder="New email"
                        className="input-field"
                        value={newEmail}
                        onChange={(e) => setNewEmail(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Confirm password"
                        className="input-field"
                        value={emailPassword}
                        onChange={(e) => setEmailPassword(e.target.value)}
                    />
                    <button className="change-btn" onClick={handleEmailChange}>
                        Change
                    </button>
                    {message && <p>{message}</p>}
                    <div className="username-rules">
                        <strong>Email Rules:</strong>
                        <ul>
                            <li>Please enter a valid email address.</li>
                            <li>After changing your email, you cannot change it again for 30 days.</li>
                        </ul>
                    </div>
                    <button className="back-btn" onClick={() => setActiveSection('default')}>
                        ← Back
                    </button>
                </div>
            )}
            <ToastContainer />
        </div>
    );
};

export default Personalization;
