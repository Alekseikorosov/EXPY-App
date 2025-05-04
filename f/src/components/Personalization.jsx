// import React, { useState } from 'react';
// import axios from '../utils/axiosInstance';
// import '../styles/Personalization.css';
//
// const Personalization = () => {
//     const [activeSection, setActiveSection] = useState('default'); // 'default' | 'editUsername' | 'editEmail'
//     const [newUsername, setNewUsername] = useState('');
//     const [newEmail, setNewEmail] = useState('');
//     const [emailPassword, setEmailPassword] = useState('');
//     const [message, setMessage] = useState('');
//
//     const handleUsernameChange = async () => {
//         setMessage('');
//         const usernameRegex = /^[A-Za-z0-9_.-]{4,13}$/;
//         if (!usernameRegex.test(newUsername)) {
//             setMessage('Invalid username format. Only Latin letters, digits, hyphen (-), underscore (_), and period (.) are allowed, and the username must be between 4 and 13 characters long.');
//             return;
//         }
//
//         try {
//             const response = await axios.put('/users/username', { newUsername }, {
//                 headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
//             });
//             setMessage(response.data.message || 'Username updated successfully');
//             setNewUsername('');
//             setActiveSection('default');
//         } catch (error) {
//             console.error(error);
//             setMessage(error.response?.data?.message || 'Server error');
//         }
//     };
//
//     const handleEmailChange = async () => {
//         setMessage('');
//         // Простая клиентская валидация email
//         const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//         if (!emailRegex.test(newEmail)) {
//             setMessage('Invalid email format.');
//             return;
//         }
//         if (!emailPassword) {
//             setMessage('Please enter your password.');
//             return;
//         }
//         try {
//             const response = await axios.put('/users/email', { newEmail, password: emailPassword }, {
//                 headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
//             });
//             setMessage(response.data.message || 'Email updated successfully');
//             setNewEmail('');
//             setEmailPassword('');
//             setActiveSection('default');
//         } catch (error) {
//             console.error(error);
//             setMessage(error.response?.data?.message || 'Server error');
//         }
//     };
//
//     return (
//         <div className="settings-content">
//             {activeSection === 'default' && (
//                 <>
//                     <div className="setting-section">
//                         <h3>Username</h3>
//                         <p>Username is a unique identifier used to log in to a system or represent a user account.</p>
//                         <ul>
//                             <li>Only Latin letters are allowed.</li>
//                             <li>Digits (0-9) are allowed.</li>
//                             <li>Allowed symbols: hyphen (-), underscore (_), and period (.)</li>
//                             <li>All other special characters are prohibited.</li>
//                             <li>The username must be between 4 and 13 characters long.</li>
//                             <li>After changing your username, you cannot change it again for 14 days.</li>
//                         </ul>
//                         <button className="change-btn" onClick={() => setActiveSection('editUsername')}>
//                             Change
//                         </button>
//                     </div>
//
//                     <hr />
//
//                     <div className="setting-section">
//                         <h3>Email</h3>
//                         <p>
//                             We can send you login confirmation emails as well as notifications when enabling two-factor authentication to provide additional protection for your account.
//                         </p>
//                         <button className="change-btn" onClick={() => setActiveSection('editEmail')}>
//                             Change
//                         </button>
//                     </div>
//                 </>
//             )}
//
//             {activeSection === 'editUsername' && (
//                 <div className="setting-section">
//                     <h3>“User Username” change to:</h3>
//                     <input
//                         type="text"
//                         placeholder="New username"
//                         className="input-field"
//                         value={newUsername}
//                         onChange={(e) => setNewUsername(e.target.value)}
//                     />
//                     <button className="change-btn" onClick={handleUsernameChange}>
//                         Change
//                     </button>
//                     {message && <p>{message}</p>}
//                     <div className="username-rules">
//                         <strong>Username Rules:</strong>
//                         <ul>
//                             <li>Only Latin letters are allowed.</li>
//                             <li>Digits (0-9) are allowed.</li>
//                             <li>Allowed symbols: hyphen (-), underscore (_), and period (.)</li>
//                             <li>All other special characters are prohibited.</li>
//                             <li>The username must be between 4 and 13 characters long.</li>
//                             <li>After changing your username, you cannot change it again for 14 days.</li>
//                         </ul>
//                     </div>
//                     <button className="back-btn" onClick={() => setActiveSection('default')}>
//                         ← Back
//                     </button>
//                 </div>
//             )}
//
//             {activeSection === 'editEmail' && (
//                 <div className="setting-section">
//                     <h3>“User Email” change to:</h3>
//                     <input
//                         type="email"
//                         placeholder="New email"
//                         className="input-field"
//                         value={newEmail}
//                         onChange={(e) => setNewEmail(e.target.value)}
//                     />
//                     <input
//                         type="password"
//                         placeholder="Confirm password"
//                         className="input-field"
//                         value={emailPassword}
//                         onChange={(e) => setEmailPassword(e.target.value)}
//                     />
//                     <button className="change-btn" onClick={handleEmailChange}>
//                         Change
//                     </button>
//                     {message && <p>{message}</p>}
//                     <div className="username-rules">
//                         <strong>Email Rules:</strong>
//                         <ul>
//                             <li>Please enter a valid email address.</li>
//                             <li>After changing your email, you cannot change it again for 30 days.</li>
//                         </ul>
//                     </div>
//                     <button className="back-btn" onClick={() => setActiveSection('default')}>
//                         ← Back
//                     </button>
//                 </div>
//             )}
//         </div>
//     );
// };
//
// export default Personalization;
import React, { useState } from 'react';
import axios from '../utils/axiosInstance';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/Personalization.css';

const Personalization = () => {
    const [activeSection, setActiveSection] = useState('default'); // 'default' | 'editUsername' | 'editEmail'
    const [newUsername, setNewUsername] = useState('');
    const [newEmail, setNewEmail] = useState('');
    const [emailPassword, setEmailPassword] = useState('');
    const [message, setMessage] = useState('');

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
            const response = await axios.put(
                '/users/username',
                { newUsername },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
                }
            );
            toast.success(response.data.message || 'Username updated successfully');
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
            const response = await axios.put(
                '/users/email',
                { newEmail, password: emailPassword },
                {
                    headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
                }
            );
            toast.success(response.data.message || 'Email updated successfully');
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
                        <h3>Username</h3>
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
                        <button className="change-btn" onClick={() => setActiveSection('editUsername')}>
                            Change
                        </button>
                    </div>

                    <hr />

                    <div className="setting-section">
                        <h3>Email</h3>
                        <p>
                            We can send you login confirmation emails as well as notifications when enabling two-factor
                            authentication to provide additional protection for your account.
                        </p>
                        <button className="change-btn" onClick={() => setActiveSection('editEmail')}>
                            Change
                        </button>
                    </div>
                </>
            )}

            {activeSection === 'editUsername' && (
                <div className="setting-section">
                    <h3>“User Username” change to:</h3>
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
                    <h3>“User Email” change to:</h3>
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
