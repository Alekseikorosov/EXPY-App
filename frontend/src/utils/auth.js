// src/utils/auth.js
import { jwtDecode } from 'jwt-decode';

export const isLoggedIn = () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return false;

    try {
        const { exp, twofaVerified } = jwtDecode(token);
        return Date.now() / 1000 < exp && twofaVerified === true;
    } catch {
        return false;           // токен повреждён или не декодируется
    }
};
