// export default EmailConfirmationPage;
import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosInstance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/EmailConfirmationPage.css';

/**
 * Экран ввода 6‑значного кода, который присылается пользователю на e‑mail
 * Порядок работы:
 *  1. После логина (email + password) сервер вернул { twofaRequired: true, tempUserId }
 *  2. На странице AlternativeMethods мы вызвали /email-login/send { userId: tempUserId }
 *  3. Здесь пользователь вводит код; при клике «Confirm» шлём /email-login/verify
 */
function EmailConfirmationPage() {
    // шесть символов кода храним в массиве
    const [code, setCode] = useState(new Array(6).fill(''));
    const navigate        = useNavigate();
    const inputsRef       = useRef([]);

    const [cooldown, setCooldown] = useState(10);

    useEffect(() => {
      if (cooldown <= 0) return;
      const t = setTimeout(() => setCooldown(c => c - 1), 1000);
      return () => clearTimeout(t);
    }, [cooldown]);

    /** обработка изменения символа в каждом инпуте */
    const handleChange = (e, index) => {
        const val = e.target.value;
        if (!/^\d?$/.test(val)) return;
        const newCode = [...code];
        newCode[index] = val;
        setCode(newCode);
        if (val && index < 5) {
            inputsRef.current[index + 1].focus();
        }
    };

    /** вставка из буфера: раскладываем цифры по полям */
    const handlePaste = (e) => {
        e.preventDefault();
        const paste = e.clipboardData.getData('Text').trim();
        if (!/^\d+$/.test(paste)) return;
        const digits = paste.slice(0, 6).split('');
        const newCode = new Array(6).fill('');
        // раскладываем по всем 6 полям, начиная с 0-го
        digits.forEach((d, i) => {
            newCode[i] = d;
            if (inputsRef.current[i]) {
                inputsRef.current[i].value = d;
            }
        });
        setCode(newCode);
        // фокус на последнем вставленном символе
        const lastIndex = digits.length - 1;
        inputsRef.current[lastIndex]?.focus();
    };

    /** Backspace на пустом поле → предыдущий инпут */
    const handleKeyDown = (e, index) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputsRef.current[index - 1].focus();
        }
    };

    /** отправляем код на сервер */
    const handleSubmit = async (e) => {
        e.preventDefault();
        const fullCode   = code.join('');
        if (fullCode.length < 6) {
            toast.error('Enter all 6 digits of the code');
            return;
        }

        const email = localStorage.getItem('loginEmail');
        const tempUserId = localStorage.getItem('tempUserId');
        if (!tempUserId) {
            toast.error('Session expired - please log in again');
            navigate('/login');
            return;
        }

        try {
            const { data } = await axios.post('/email-login/verify', {
                userId: tempUserId,
                email,
                code : fullCode
            });

            if (data.success && data.accessToken) {
                localStorage.setItem('accessToken', data.accessToken);
                localStorage.removeItem('tempUserId');
                toast.success('You have logged in successfully!');
                navigate('/');
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Invalid or expired code');
        }
    };

    /** отправить код повторно */
    const handleResend = async () => {
        const email = localStorage.getItem('loginEmail');   // ← берём e‑mail

        if (!email) {
            toast.error('Session expired — log in again');
            navigate('/login');
            return;
        }

        try {
            // отправляем письмо повторно
            await axios.post('/email-login/send', { email });
            toast.info('Code resent');
            setCooldown(120)
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to send code');
        }
    };

    return (
        <div className="email-confirm-container">
            <h1 className="email-confirm-title">Email confirmation</h1>
            <p className="email-confirm-subtitle">Enter the 6‑digit code we sent to your e‑mail</p>

            <div className="email-confirm-card">
                <form onSubmit={handleSubmit} className="email-confirm-form">
                    <label className="email-confirm-label">Code</label>
                    <div className="email-confirm-inputs">
                        {code.map((value, index) => (
                            <input
                                key={index}
                                type="text"
                                inputMode="numeric"
                                maxLength={1}
                                value={value}
                                ref={el => (inputsRef.current[index] = el)}
                                onChange={e => handleChange(e, index)}
                                onPaste={handlePaste}
                                onKeyDown={e => handleKeyDown(e, index)}
                                className="email-confirm-input"
                            />
                        ))}
                    </div>

                    <button
                        type="button"
                        className="email-confirm-resend"
                        onClick={handleResend}
                        disabled={cooldown > 0}
                    >
                    {cooldown > 0 
                        ? `Send again (${cooldown}s)` 
                        : 'Send again'}
                    </button>

                    <button type="submit" className="email-confirm-button">Confirm</button>
                </form>
            </div>

            <ToastContainer />
        </div>
    );
}

export default EmailConfirmationPage;
