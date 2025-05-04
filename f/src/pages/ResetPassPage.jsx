import React, { useState, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/ResetPassPage.css';

function ResetPassPage() {
    const navigate = useNavigate();

    // Состояния
    const [email, setEmail] = useState('');
    // Храним 6 цифр в массиве
    const [codeDigits, setCodeDigits] = useState(Array(6).fill(''));

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    // step: 1 — ввод email, 2 — подтверждение кода, 3 — ввод нового пароля
    const [step, setStep] = useState(1);
    const [resendDisabled, setResendDisabled] = useState(false);
    const [resendCountdown, setResendCountdown] = useState(0);

    const countdownIntervalRef = useRef(null);

    // Создаём ссылки на все 6 input для управления фокусом
    const inputRefs = useRef([...Array(6)].map(() => React.createRef()));

    // ======== Функции для обратного отсчёта ========
    const startCountdown = (seconds) => {
        setResendCountdown(seconds);
        setResendDisabled(true);
        countdownIntervalRef.current = setInterval(() => {
            setResendCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(countdownIntervalRef.current);
                    setResendDisabled(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // ======== 1. Отправка email для получения кода ========
    const handleEmailSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');
        try {
            const response = await axios.post('http://localhost:5000/api/auth/resetpass', { email });
            setSuccessMessage(response.data.message || 'Код подтверждения успешно отправлен на вашу почту!');
            setStep(2);
            startCountdown(10);
        } catch (error) {
            console.error('Ошибка при отправке кода:', error);
            if (error.response && error.response.data && error.response.data.error) {
                setErrorMessage(error.response.data.error);
            } else {
                setErrorMessage('Произошла ошибка при отправке кода.');
            }
        }
    };

    // ======== 2. Подтверждение кода ========
    const handleCodeConfirm = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        // Склеиваем массив в одну строку
        const confirmationCode = codeDigits.join('');
        if (confirmationCode.length < 6) {
            setErrorMessage('Пожалуйста, введите 6-значный код.');
            return;
        }

        try {
            // Пример вызова проверки кода на сервере
            const response = await axios.post('http://localhost:5000/api/auth/verify-code', {
                email,
                confirmationCode
            });
            setSuccessMessage(response.data.message || 'Код успешно подтвержден!');
            setStep(3);
        } catch (error) {
            console.error('Ошибка при подтверждении кода:', error);
            if (error.response && error.response.data && error.response.data.error) {
                setErrorMessage(error.response.data.error);
            } else {
                setErrorMessage('Произошла ошибка при подтверждении кода.');
            }
        }
    };

    // ======== 3. Смена пароля ========
    const handleNewPasswordSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');
        setSuccessMessage('');

        const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            setErrorMessage(
                'Пароль должен быть не короче 8 символов и содержать ' +
                'строчные, заглавные буквы, цифры и спецсимвол из !@#$%^&*.'
            );
            return;
        }
        if (newPassword !== confirmPassword) {
            setErrorMessage('Пароли не совпадают.');
            return;
        }

        try {
            // Для смены пароля тоже нужен код
            const confirmationCode = codeDigits.join('');
            const response = await axios.post('http://localhost:5000/api/auth/update-password', {
                email,
                confirmationCode,
                newPassword
            });
            setSuccessMessage(response.data.message || 'Пароль успешно обновлен!');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            console.error('Ошибка при обновлении пароля:', error);
            if (error.response && error.response.data && error.response.data.error) {
                setErrorMessage(error.response.data.error);
            } else {
                setErrorMessage('Произошла ошибка при обновлении пароля.');
            }
        }
    };

    // ======== Повторная отправка кода ========
    const handleResendCode = async () => {
        setErrorMessage('');
        setSuccessMessage('');
        try {
            const response = await axios.post('http://localhost:5000/api/auth/resetpass', { email });
            setSuccessMessage(response.data.message || 'Код подтверждения повторно отправлен на вашу почту!');
            startCountdown(120);
        } catch (error) {
            console.error('Ошибка при повторной отправке кода:', error);
            if (error.response && error.response.data && error.response.data.error) {
                setErrorMessage(error.response.data.error);
            } else {
                setErrorMessage('Произошла ошибка при повторной отправке кода.');
            }
        }
    };

    // ======== Обработчики ввода для «кубиков» кода ========

    // При вводе одной цифры переходим к следующему полю
    const handleDigitChange = (value, index) => {
        // Оставляем только цифру
        const digit = value.replace(/\D/g, '').charAt(0) || '';
        const newDigits = [...codeDigits];
        newDigits[index] = digit;
        setCodeDigits(newDigits);

        // Если пользователь ввёл цифру, фокусируем следующее поле
        if (digit && index < 5) {
            inputRefs.current[index + 1].current.focus();
        }
    };

    // Если поле пустое и нажали Backspace – переходим к предыдущему
    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !codeDigits[index] && index > 0) {
            inputRefs.current[index - 1].current.focus();
        }
    };

    // При вставке (Paste) всего кода сразу
    // Заполняем с первой ячейки, игнорируя index
    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '');
        if (!pasted) return;

        const newDigits = [...codeDigits];
        for (let i = 0; i < 6; i++) {
            newDigits[i] = pasted[i] || '';
        }
        setCodeDigits(newDigits);

        // Фокусируемся на последнем заполненном поле (или последнем)
        let fillIndex = pasted.length < 6 ? pasted.length : 6;
        if (fillIndex > 5) fillIndex = 5;
        inputRefs.current[fillIndex].current.focus();
    };

    return (
        <div className="resetpass-container">
            <div className="resetpass-card">
                <h2 className="resetpass-title">Восстановление пароля</h2>
                {errorMessage && <p className="resetpass-error">{errorMessage}</p>}
                {successMessage && <p className="resetpass-success">{successMessage}</p>}

                {/* Шаг 1: Ввод email */}
                {step === 1 && (
                    <form onSubmit={handleEmailSubmit}>
                        <div className="resetpass-input-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                placeholder="Введите ваш email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="resetpass-button">Send</button>
                    </form>
                )}

                {/* Шаг 2: Подтверждение кода (6 кубиков) */}
                {step === 2 && (
                    <>
                        <form onSubmit={handleCodeConfirm}>
                            <p>Введите 6-значный код из письма:</p>
                            <div className="resetpass-code-container">
                                {codeDigits.map((digit, idx) => (
                                    <input
                                        key={idx}
                                        ref={inputRefs.current[idx]}
                                        type="text"
                                        maxLength={1}
                                        className="resetpass-code-input"
                                        value={digit}
                                        onChange={(e) => handleDigitChange(e.target.value, idx)}
                                        onKeyDown={(e) => handleKeyDown(e, idx)}
                                        onPaste={handlePaste}
                                    />
                                ))}
                            </div>

                            <button type="submit" className="resetpass-button" style={{ marginTop: '20px' }}>
                                Confirm
                            </button>
                        </form>
                        <button
                            className="resetpass-resend-button"
                            onClick={handleResendCode}
                            disabled={resendDisabled}
                        >
                            {resendDisabled
                                ? `Отправить код еще раз (${resendCountdown})`
                                : 'Отправить код еще раз'}
                        </button>
                    </>
                )}

                {/* Шаг 3: Ввод нового пароля */}
                {step === 3 && (
                    <form onSubmit={handleNewPasswordSubmit}>
                        <div className="resetpass-input-group">
                            <label htmlFor="newPassword">Новый пароль</label>
                            <input
                                id="newPassword"
                                type="password"
                                placeholder="Введите новый пароль"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                            />
                        </div>
                        <div className="resetpass-input-group">
                            <label htmlFor="confirmPassword">Подтвердите новый пароль</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                placeholder="Подтвердите новый пароль"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                            />
                        </div>
                        <button type="submit" className="resetpass-button">Update Password</button>
                    </form>
                )}
            </div>
        </div>
    );
}

export default ResetPassPage;

