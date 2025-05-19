import React, { useState, useEffect } from 'react';
import axios from '../utils/axiosInstance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Security.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const Security = () => {
    // Состояния для переключения между модальными окнами
    const [activeSection, setActiveSection] = useState('default');

    // Состояния для смены пароля
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    /* 👁 */
    const [showCur, setShowCur]       = useState(false);
    const [showNew, setShowNew]       = useState(false);
    const [showConf, setShowConf]     = useState(false);
    const [show2fa, setShow2fa]       = useState(false);

    // Состояния для 2FA
    const [qrCode, setQrCode] = useState('');
    const [tokenInput, setTokenInput] = useState('');
    const [confirm2faPassword, setConfirm2faPassword] = useState('');

    // Состояния для recovery code
    const [recoveryCode, setRecoveryCode] = useState('');
    const [savedChecked, setSavedChecked] = useState(false);

    // Состояние для статуса 2FA (active/disabled)
    const [twofaActive, setTwofaActive] = useState(false);

    // Состояние для кода при отключении 2FA
    const [disable2faToken, setDisable2faToken] = useState('');

    // Обработчик смены пароля
    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            toast.error('New password and confirmation do not match');
            return;
        }
        if (currentPassword === newPassword) {
            toast.error('The new password cannot be the same as the current one.');
            return;
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            toast.error('The password does not meet the requirements');
            return;
        }
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.put(
                '/users/password',
                { currentPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(response.data.message || 'Password successfuly updated');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setActiveSection('default');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Server error');
        }
    };

    // Обработчик подтверждения пароля для 2FA
    const handleConfirm2faPassword = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.post(
                '/users/confirm-password',
                { password: confirm2faPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.verified) {
                toast.success('Password confirm');
                handleEnable2FA();
            } else {
                toast.error('Wrong password');
            }
        } catch (error) {
            toast.error('Password verification error');
        }
    };

    // Обработчик запроса QR-кода для 2FA
    const handleEnable2FA = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.post(
                '/twofactor/setup',
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setQrCode(response.data.qrCode);
            setActiveSection('setup2fa');
        } catch (error) {
            toast.error('2FA setup error');
        }
    };

    // Обработчик проверки 2FA кода и получение recovery code
    const handleVerify2FA = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.post(
                '/twofactor/verify',
                { token: tokenInput },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.verified) {
                toast.success('2FA successfully enabled!');
                setTwofaActive(true);
                // Получаем recovery code после успешной верификации 2FA
                const recoveryResponse = await axios.post(
                    '/twofactor/recovery-code',
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setRecoveryCode(recoveryResponse.data.code);
                setActiveSection('recovery');
            } else {
                toast.error('Wrong code, try again');
            }
        } catch (error) {
            toast.error('Verification error');
        }
    };

    // =====================
    // Обработчик отключения 2FA (вызов эндпоинта /twofactor/disable)
    // =====================
    const handleDisable2FA = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            // disable2faToken – это 6-значный код из приложения
            const response = await axios.post(
                '/twofactor/disable',
                { token: disable2faToken }, // передаём код
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(response.data.message || '2FA disabled');
            setTwofaActive(false);
            setActiveSection('default');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Error disabling 2FA');
        }
    };


    // Обработчик копирования recovery code
    const handleCopyCode = () => {
        navigator.clipboard.writeText(recoveryCode)
            .then(() => {
                toast.success('Recovery code copied to clipboard!');
            })
            .catch(() => {
                toast.error('Failed to copy code');
            });
    };

    // =====================
    // При нажатии на «Disable» в default-секции – переходим в окно для ввода 6-значного кода
    // =====================
    const handleOpenDisableModal = () => {
        setDisable2faToken('');
        setActiveSection('confirm2faDisable');
    };

    // =====================
    // При рендере компонента – получить статус 2FA
    // =====================
    useEffect(() => {
        fetchTwofaStatus();
    }, []);

    const fetchTwofaStatus = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.get('/twofactor/status', {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (response.data.status === 'active') {
                setTwofaActive(true);
            } else {
                setTwofaActive(false);
            }
        } catch (error) {
            console.error('Failed to get 2FA status:', error);
        }
    };


    return (
        <div className="settings-content">
            {activeSection === 'default' && (
                <div className="setting-section">
                    <div className="setting-header">
                    <h3>Password</h3>
                    <button className="change-btn" onClick={() => setActiveSection('editPassword')}>
                        Change
                    </button>
                    </div>
                    <p>
                        <strong>Important:</strong><br />
                        • Never share your password with anyone.<br />
                        • Do not store it in insecure locations or transmitted files.<br />
                        • Keep it confidential, as it is the key to your account’s security.
                    </p>
                    <p>
                        <strong>Password Rules:</strong><br />
                        • Minimum length: 8 characters.<br />
                        • Only Latin letters are allowed.<br />
                        • Must contain at least one special character.<br />
                        • Must contain at least one digit.<br />
                        • Must include both uppercase and lowercase letters.
                    </p>
                
                    <hr />
                    <div className="setting-section2f">
                        <div className="setting-header">
                            <h3>Two-Factor Authentication (2FA)</h3>

                            {/* контейнер для статуса + кнопки */}
                            <div className="header-actions">
                            {/* только когда активен 2FA */}
                            {twofaActive && (
                                <span className="status-pill status-active">
                            active
                                </span>
                            )}

                            {/* сама кнопка */}
                            {twofaActive ? (
                                <button
                                className="disable-btn"
                                onClick={handleOpenDisableModal}
                                type="button"
                                >
                                Disable
                                </button>
                            ) : (
                                <button
                                className="disable-btn"
                                onClick={() => setActiveSection('confirm2fa')}
                                type="button"
                                >
                                Enable
                                </button>
                            )}
                            </div>
                        </div>

                        {/* описание, только если не активен */}
                        {!twofaActive && (
                            <p>
                            2FA increases the security of your account. After confirming your password, you will
                            receive a QR code.
                            </p>
                        )}
                        {/* убрали <p>Status: Active</p> */}
                        </div>

                </div>
            )}

            {activeSection === 'editPassword' && (
                <div className="setting-section">
          <h3>Change password</h3>

          <div className="input-wrapper">
            <input
              type={showCur ? 'text' : 'password'}
              placeholder="Current password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="input-field"
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowCur((p) => !p)}
            >
              {showCur ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="input-wrapper">
            <input
              type={showNew ? 'text' : 'password'}
              placeholder="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input-field"
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowNew((p) => !p)}
            >
              {showNew ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="input-wrapper">
            <input
              type={showConf ? 'text' : 'password'}
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input-field"
            />
            <button
              type="button"
              className="eye-btn"
              onClick={() => setShowConf((p) => !p)}
            >
              {showConf ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button className="change-btn" onClick={handlePasswordChange}>
            Save new password
          </button>
          <button className="back-btn" onClick={() => setActiveSection('default')}>
            ← Back
          </button>
        </div>
      )}

        {activeSection === 'confirm2fa' && (
                <div className="setting-section">
                <h3>Confirm password for 2FA</h3>

                <div className="input-wrapper">
                    <input
                    type={show2fa ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={confirm2faPassword}
                    onChange={(e) => setConfirm2faPassword(e.target.value)}
                    className="input-field"
                    />
                    <button
                    type="button"
                    className="eye-btn"
                    onClick={() => setShow2fa((p) => !p)}
                    >
                    {show2fa ? <FaEyeSlash /> : <FaEye />}
                    </button>
                </div>

                <button className="change-btn" onClick={handleConfirm2faPassword}>
                    Continue
                </button>
                <button className="back-btn" onClick={() => setActiveSection('default')}>
                    ← Back
                </button>
                </div>
            )}

            {activeSection === 'setup2fa' && (
                <div className="setting-section">
                    <h3>Activate 2FA</h3>
                    <p>Scan QR-code in app-auntificator:</p>
                    {qrCode && <img src={qrCode} alt="QR-code for 2FA" />}
                    <p>Enter 6-digit code from app:</p>
                    <input
                        type="text"
                        placeholder="6-digit code"
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        className="input-field"
                    />
                    <button className="change-btn" onClick={handleVerify2FA}>
                        Continue
                    </button>
                    <button className="back-btn" onClick={() => setActiveSection('default')}>
                        ← Back
                    </button>
                </div>
            )}

            {activeSection === 'recovery' && (
                <div className="setting-section recovery-section">
                    <h3>Two-Factor Authentication (2FA)</h3>
                    <p className="recovery-info">
                    Copy this recovery code and keep it in a safe place. You will need it if you ever need to sign in without your device.
                    </p>

                    <div className="recovery-code-box">
                    {recoveryCode}
                    </div>

                    <button
                    className="copy-inline-btn"
                    onClick={handleCopyCode}
                    type="button"
                    >
                    copy code
                    </button>

                    <div className="checkbox-container">
                    <input
                        type="checkbox"
                        id="recoveryCodeSaved"
                        checked={savedChecked}
                        onChange={e => setSavedChecked(e.target.checked)}
                    />
                    <label htmlFor="recoveryCodeSaved">
                        I have saved the code successfully
                    </label>
                    </div>

                    <button
                    className="continue-btn"
                    onClick={() => setActiveSection('default')}
                    disabled={!savedChecked}
                    >
                    Continue
                    </button>

                    <button
                    className="back-btn"
                    onClick={() => setActiveSection('default')}
                    type="button"
                    >
                    ← Back
                    </button>
                </div>
                )}


            {activeSection === 'confirm2faDisable' && (
                <div className="setting-section">
                    <h3>Disable 2FA – Enter Code</h3>
                    <p>Enter the 6-digit code from your authenticator app:</p>
                    <input
                        type="text"
                        placeholder="6-digit code"
                        value={disable2faToken}
                        onChange={(e) => setDisable2faToken(e.target.value)}
                        className="input-field"
                    />
                    <button className="change-btn" onClick={handleDisable2FA}>
                        Continue
                    </button>
                    <button className="back-btn" onClick={() => setActiveSection('default')}>
                        ← Back
                    </button>
                </div>
            )}

            <ToastContainer />
        </div>
    );
};

export default Security;
