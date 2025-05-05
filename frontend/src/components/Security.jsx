// import React, { useState, useEffect } from 'react';
// import axios from '../utils/axiosInstance';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import '../styles/Security.css';
// // Импортируйте jwtDecode, если используете декодирование токена
// // import jwtDecode from 'jwt-decode';
//
// const Security = () => {
//     // Следим за тем, какая «секция» сейчас активна:
//     // 'default', 'editPassword' или 'enable2fa'
//     const [activeSection, setActiveSection] = useState('default');
//
//     // Состояния для смены пароля
//     const [currentPassword, setCurrentPassword] = useState('');
//     const [newPassword, setNewPassword] = useState('');
//     const [confirmPassword, setConfirmPassword] = useState('');
//
//     // Для примера возьмём email из токена (если требуется выводить профиль)
//     const [email ] = useState('');
//
//     useEffect(() => {
//         const token = localStorage.getItem('accessToken');
//         if (token) {
//             try {
//                 // const decoded = jwtDecode(token);
//                 // setEmail(decoded.email);
//             } catch (error) {
//                 console.error('Ошибка декодирования токена:', error);
//             }
//         }
//     }, []);
//
//     // Обработчик изменения пароля (как в вашем коде)
//     const handlePasswordChange = async () => {
//         if (newPassword !== confirmPassword) {
//             toast.error('New password and confirm password do not match');
//             return;
//         }
//         if (currentPassword === newPassword) {
//             toast.error('New password cannot be the same as the current password');
//             return;
//         }
//         const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,}$/;
//         if (!passwordRegex.test(newPassword)) {
//             toast.error(
//                 'New password does not meet the requirements. It must be at least 8 characters long, contain only Latin letters, at least one special character, at least one digit, and include both uppercase and lowercase letters.'
//             );
//             return;
//         }
//
//         try {
//             const token = localStorage.getItem('accessToken');
//             const response = await axios.put(
//                 '/users/password',
//                 { currentPassword, newPassword },
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             toast.success(response.data.message || 'Password updated successfully');
//             setCurrentPassword('');
//             setNewPassword('');
//             setConfirmPassword('');
//             setActiveSection('default');
//         } catch (error) {
//             console.error(error);
//             toast.error(error.response?.data?.message || 'Server error');
//         }
//     };
//
//     return (
//         <div className="settings-content">
//
//             {/* ============ Default Screen ============= */}
//             {activeSection === 'default' && (
//                 <div className="setting-section">
//                     <h3>Password</h3>
//                     <p>
//                         <strong>Important:</strong><br/>
//                         • Never share your password with anyone.<br/>
//                         • Do not store it in insecure locations or transmitted files.<br/>
//                         • Keep it confidential, as it is the key to your account’s security.
//                     </p>
//                     <p>
//                         <strong>Password Rules:</strong><br/>
//                         • Minimum length: 8 characters.<br/>
//                         • Only Latin letters are allowed.<br/>
//                         • Must contain at least one special character.<br/>
//                         • Must contain at least one digit.<br/>
//                         • Must include both uppercase and lowercase letters.
//                     </p>
//                     <button className="change-btn" onClick={() => setActiveSection('editPassword')}>
//                         Change
//                     </button>
//
//                     <hr />
//
//                     {/* Блок с 2FA */}
//                     <div className="setting-section">
//                         <h3>Two-Factor Authentication (2FA)</h3>
//                         {/* При нажатии открываем новое «окно» или новый экран */}
//                         <button className="change-btn" onClick={() => setActiveSection('enable2fa')}>
//                             Enable
//                         </button>
//                         <p>
//                             2FA increases the security of your account. After enabling it, you will need
//                             to enter a one-time code in addition to your password to log in.
//                         </p>
//                         <p>
//                             <strong>2FA Advantages:</strong><br/>
//                             • Protects your account in case of a password leak.<br/>
//                             • Reduces the risk of unauthorized access.
//                         </p>
//                     </div>
//                 </div>
//             )}
//
//             {/* ============ Edit Password Screen ============= */}
//             {activeSection === 'editPassword' && (
//                 <div className="setting-section">
//                     <h3>Change Password</h3>
//                     <input
//                         type="password"
//                         placeholder="Current Password"
//                         className="input-field"
//                         value={currentPassword}
//                         onChange={(e) => setCurrentPassword(e.target.value)}
//                     />
//                     <input
//                         type="password"
//                         placeholder="New Password"
//                         className="input-field"
//                         value={newPassword}
//                         onChange={(e) => setNewPassword(e.target.value)}
//                     />
//                     <input
//                         type="password"
//                         placeholder="Confirm Password"
//                         className="input-field"
//                         value={confirmPassword}
//                         onChange={(e) => setConfirmPassword(e.target.value)}
//                     />
//                     <button className="change-btn" onClick={handlePasswordChange}>
//                         Set New Password
//                     </button>
//                     <div className="password-rules">
//                         <strong>Password Rules:</strong>
//                         <ul>
//                             <li>Minimum length: 8 characters.</li>
//                             <li>Only Latin letters are allowed.</li>
//                             <li>Must contain at least one special character.</li>
//                             <li>Must contain at least one digit.</li>
//                             <li>Must include both uppercase and lowercase letters.</li>
//                         </ul>
//                     </div>
//                     <button className="back-btn" onClick={() => setActiveSection('default')}>
//                         ← Back
//                     </button>
//                 </div>
//             )}
//
//             {/* ============ Enable 2FA Screen (Модалка/страница) ============= */}
//             {activeSection === 'enable2fa' && (
//                 <div className="setting-section">
//                     <h3>Enable Two-Factor Authentication</h3>
//
//                     {/* Показываем email вместо предыдущего текста */}
//                     <p>{email}</p>
//
//                     <input
//                         type="password"
//                         placeholder="Current Password"
//                         className="input-field"
//                     />
//
//                     <button className="change-btn">
//                         Continue
//                     </button>
//
//                     <button className="back-btn" onClick={() => setActiveSection('default')}>
//                         ← Back
//                     </button>
//                 </div>
//             )}
//
//             <ToastContainer />
//         </div>
//     );
// };
//
// export default Security;
import React, { useState } from 'react';
import axios from '../utils/axiosInstance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Security.css';
// Если требуется декодирование токена для email:
// import jwtDecode from 'jwt-decode';

const Security = () => {
    // Возможные состояния: 'default', 'editPassword', 'setup2fa'
    const [activeSection, setActiveSection] = useState('default');

    // Состояния для смены пароля
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    // Состояния для 2FA
    const [qrCode, setQrCode] = useState('');
    const [tokenInput, setTokenInput] = useState('');

    // Обработчик смены пароля (без изменений)
    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            toast.error('New password and confirm password do not match');
            return;
        }
        if (currentPassword === newPassword) {
            toast.error('New password cannot be the same as the current password');
            return;
        }
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?])[A-Za-z\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]{8,}$/;
        if (!passwordRegex.test(newPassword)) {
            toast.error(
                'New password does not meet the requirements. It must be at least 8 characters long, contain only Latin letters, at least one special character, at least one digit, and include both uppercase and lowercase letters.'
            );
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.put(
                '/users/password',
                { currentPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            toast.success(response.data.message || 'Password updated successfully');
            setCurrentPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setActiveSection('default');
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.message || 'Server error');
        }
    };

    // Обработчик клика "Enable" для 2FA: запрашивает QR-код
    const handleEnable2FA = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.post('/2fa/setup', {}, { headers: { Authorization: `Bearer ${token}` } });
            setQrCode(response.data.qrCode);
            setActiveSection('setup2fa');
        } catch (error) {
            toast.error('Error setting up 2FA');
        }
    };

    // Обработчик проверки кода 2FA
    const handleVerify2FA = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.post(
                '/api/2fa/verify',
                { token: tokenInput },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (response.data.verified) {
                toast.success('2FA enabled successfully!');
                setActiveSection('default');
            } else {
                toast.error('Invalid token, please try again');
            }
        } catch (error) {
            toast.error('Verification failed');
        }
    };

    return (
        <div className="settings-content">
            {activeSection === 'default' && (
                <div className="setting-section">
                    <h3>Password</h3>
                    <p>
                        <strong>Important:</strong><br/>
                        • Never share your password with anyone.<br/>
                        • Do not store it in insecure locations or transmitted files.<br/>
                        • Keep it confidential, as it is the key to your account’s security.
                    </p>
                    <p>
                        <strong>Password Rules:</strong><br/>
                        • Minimum length: 8 characters.<br/>
                        • Only Latin letters are allowed.<br/>
                        • Must contain at least one special character.<br/>
                        • Must contain at least one digit.<br/>
                        • Must include both uppercase and lowercase letters.
                    </p>
                    <button className="change-btn" onClick={() => setActiveSection('editPassword')}>
                        Change
                    </button>

                    <hr />

                    {/* Блок с 2FA */}
                    <div className="setting-section">
                        <h3>Two-Factor Authentication (2FA)</h3>
                        <button className="change-btn" onClick={handleEnable2FA}>
                            Enable
                        </button>
                        <p>
                            2FA increases the security of your account. After enabling it, you will need to enter a one-time code
                            from Google Authenticator to log in.
                        </p>
                        <p>
                            <strong>2FA Advantages:</strong><br/>
                            • Protects your account in case of a password leak.<br/>
                            • Reduces the risk of unauthorized access.
                        </p>
                    </div>
                </div>
            )}

            {activeSection === 'editPassword' && (
                <div className="setting-section">
                    <h3>Change Password</h3>
                    <input
                        type="password"
                        placeholder="Current Password"
                        className="input-field"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="New Password"
                        className="input-field"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Confirm Password"
                        className="input-field"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button className="change-btn" onClick={handlePasswordChange}>
                        Set New Password
                    </button>
                    <div className="password-rules">
                        <strong>Password Rules:</strong>
                        <ul>
                            <li>Minimum length: 8 characters.</li>
                            <li>Only Latin letters are allowed.</li>
                            <li>Must contain at least one special character.</li>
                            <li>Must contain at least one digit.</li>
                            <li>Must include both uppercase and lowercase letters.</li>
                        </ul>
                    </div>
                    <button className="back-btn" onClick={() => setActiveSection('default')}>
                        ← Back
                    </button>
                </div>
            )}

            {activeSection === 'setup2fa' && (
                <div className="setting-section">
                    <h3>Enable Two-Factor Authentication</h3>
                    <p>Scan the QR code with Google Authenticator:</p>
                    {qrCode && <img src={qrCode} alt="QR Code for 2FA" />}
                    <p>Then, enter the 6-digit code from the app:</p>
                    <input
                        type="text"
                        placeholder="6-digit code"
                        className="input-field"
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                    />
                    <button className="change-btn" onClick={handleVerify2FA}>
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

