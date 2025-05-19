import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosInstance';
import PhoneInput from 'react-phone-input-2';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'react-phone-input-2/lib/style.css';
import '../styles/RegisterPage.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function RegisterPage() {
  const navigate = useNavigate();

  /* ─────────── шаги ─────────── */
  const [step, setStep] = useState(1);

  /* поля регистрации */
  const [username, setUsername] = useState('');
  const [email,    setEmail]    = useState('');
  const [phone,    setPhone]    = useState('');
  const [password, setPassword] = useState('');
  const [confirm,  setConfirm]  = useState('');

  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  /* код из письма (6 «кубиков») */
  const [codeDigits, setCodeDigits] = useState(Array(6).fill(''));
  const inputsRef                    = useRef([...Array(6)].map(()=>React.createRef()));

  /* resend-кнопка */
  const [resendDisabled,  setResendDisabled]  = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);
  const countdownRef = useRef(null);

  /* регулярки */
  const usernameRegex = /^(?=.{4,13}$)[a-zA-Z0-9_.-]+$/;
  const passwordRegex = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,}$/;

  /* ─────────── вспом-функции ─────────── */
  const startCountdown = sec => {
    setResendDisabled(true);
    setResendCountdown(sec);
    countdownRef.current = setInterval(()=>{
      setResendCountdown(prev=>{
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          setResendDisabled(false);
          return 0;
        }
        return prev - 1;
      });
    },1000);
  };

  useEffect(() => () => clearInterval(countdownRef.current), []);

  /* ─────────── регистрация (шаг 1) ─────────── */
  const handleStart = async e => {
    e.preventDefault();

    if (!usernameRegex.test(username)) return toast.error('Bad username (4-13 latin, digits, _.-)');
    if (password !== confirm)          return toast.error('Passwords do not match');
    if (!passwordRegex.test(password)) return toast.error('Password too weak');

    try {
      const { data } = await axios.post('/auth/register/start', {
        username, email, telephone: phone, password
      });

      if (data.confirmationId) {
        localStorage.setItem('confirmationId', data.confirmationId);
      toast.success('We’ve sent a code to your e-mail');
      setStep(2);
      // -   startCountdown(10);               // ждём 2 мин до повторной отправки
      // - } catch (err) {
         startCountdown(120);              // 120 с = 2 мин
       }                                   // ← ЗАКРЫЛИ if

       } catch (err) {
      const msg =
        err.response?.data?.message ||   // ← важные сообщения 409 от сервера
        err.response?.data?.error   ||
        'Registration error';
  
      toast.error(msg);
  
    if (err.response?.status === 409) {
       // данные заняты → остаёмся на первом шаге, пароль очищаем
       setStep(1);
       setPassword('');
       setConfirm('');
       // при желании можно подсветить соответствующее поле
     }
    }
  };

  /* ─────────── обработка «кубиков» ─────────── */
  const handleDigitChange = (val, idx) => {
    const digit = val.replace(/\D/g,'').charAt(0) || '';
    const arr   = [...codeDigits];
    arr[idx] = digit;
    setCodeDigits(arr);
    if (digit && idx < 5) inputsRef.current[idx+1].current.focus();
  };

  const handleKeyDown = (e,idx)=>{
    if (e.key==='Backspace' && !codeDigits[idx] && idx>0)
      inputsRef.current[idx-1].current.focus();
  };

  const handlePaste = e=>{
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g,'').slice(0,6);
    if (!pasted) return;
    const arr=[...codeDigits];
    for (let i=0;i<6;i++) arr[i]=pasted[i]||'';
    setCodeDigits(arr);
    inputsRef.current[Math.min(pasted.length,5)].current.focus();
  };

  const handleConfirm = async e => {
    e.preventDefault();
    const fullCode = codeDigits.join('');
    if (!/^\d{6}$/.test(fullCode)) {
      return toast.error('Enter all 6 digits');
    }
    /* читаем именно confirmationId */
    const confirmationId = localStorage.getItem('confirmationId');
    if (!confirmationId) {
      toast.error('Session expired – register again');
      setStep(1);
      return;
    }
    try {
      const { data } = await axios.post('/auth/register/verify', {
        confirmationId,
        code: fullCode
      });
      // не логиним автоматически
      localStorage.removeItem('confirmationId');
      toast.success(data.message || 'E-mail verified!');
      // переходим на страницу входа
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired code');
    }
  };

  const handleResend = async () => {
    const confirmationId = localStorage.getItem('confirmationId');
    if (!confirmationId) return;
    try {
      await axios.post('/auth/register/resend-code', { confirmationId });
      toast.success('Code resent!');
      startCountdown(120);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot resend code');
    }
  };

  /* ─────────── UI ─────────── */
  return (
      <div className="register-container">
        <div className="register-card">
          {/* <h2 className="register-title">Sign Up</h2> */}

          {/* ===== ШАГ 1: регистрационная форма ===== */}
          {step===1 && (
              <form onSubmit={handleStart}>
                <div className="register-input-group">
                  <label>Username</label>
                  <input value={username} onChange={e=>setUsername(e.target.value)} required/>
                </div>

                <div className="register-input-group">
                  <label>E-mail</label>
                  <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required/>
                </div>

                <div className="register-input-group">
                  <label>Phone</label>
                  <PhoneInput country="us" value={phone} onChange={setPhone}/>
                </div>

                <div className="register-input-group eye-group">
              <label>Password</label>
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowPass((p) => !p)}
              >
                {showPass ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="register-input-group eye-group">
              <label>Confirm password</label>
              <input
                type={showConfirm ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              <button
                type="button"
                className="eye-btn"
                onClick={() => setShowConfirm((p) => !p)}
              >
                {showConfirm ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button className="register-button">Sign Up</button>
          </form>
        )}

          {/* ===== ШАГ 2: ввод кода ===== */}
          {step===2 && (
              <>
                <p>Enter 6-digit code, sent to <b>{email}</b></p>
                <form onSubmit={handleConfirm}>
                  <div className="register-code-container">
                    {codeDigits.map((d,i)=>(
                        <input key={i}
                               ref={inputsRef.current[i]}
                               maxLength={1}
                               className="register-code-input"
                               value={d}
                               onChange={e=>handleDigitChange(e.target.value,i)}
                               onKeyDown={e=>handleKeyDown(e,i)}
                               onPaste={handlePaste}/>
                    ))}
                  </div>
                  <button className="register-button" style={{marginTop:20}}>Confirm</button>
                </form>

                <button className="register-resend-button"
                        onClick={handleResend}
                        disabled={resendDisabled}>
                  {resendDisabled
                      ? `Send again (${resendCountdown})`
                      : 'Send again'}
                </button>
              </>
          )}
        </div>
        <ToastContainer/>
      </div>
  );
}
