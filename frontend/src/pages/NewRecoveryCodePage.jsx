import React, { useState } from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import '../styles/RecoveryCodePage.css';

export default function NewRecoveryCodePage() {
    const { state } = useLocation();
    const navigate = useNavigate();
    const code = state?.newCode;
    
    // если пользователь попал без кода (обновил страницу) — перенаправляем на главную
    if (!code) {
        return <Navigate to="/" replace />;
    }

    const [checked, setChecked] = useState(false);

    const handleConfirm = () => {
        if (checked) {
            navigate('/');
        }
    };

    return (
        <div className="recovery-container">
            <h1 className="recovery-title">Recovery Code</h1>
            <p className="recovery-subtitle">Save your new recovery code!</p>

            <div className="recovery-card">
                <label htmlFor="newCode">Code:</label>
                <input
                    id="newCode"
                    type="text"
                    readOnly
                    value={code}
                    className="recovery-input"
                />

                <div className="checkbox-row">
                    <input
                        id="saved"
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => setChecked(e.target.checked)}
                    />
                    <label htmlFor="saved">I have saved the code successfully</label>
                </div>

                <button
                    className="recovery-button"
                    disabled={!checked}
                    onClick={handleConfirm}
                >
                    Confirm
                </button>
            </div>
        </div>
    );
}
