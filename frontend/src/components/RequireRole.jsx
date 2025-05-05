// src/components/RequireRole.jsx
import React from 'react';
import PropTypes from 'prop-types';
import { Navigate, Outlet } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

/**
 * Защищённый маршрут по ролям.
 * @param {{allowed: string | string[]}} props.allowed — роль или список ролей, которым разрешён доступ
 */
function RequireRole({ allowed }) {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let role;
  try {
    const decoded = jwtDecode(token);
    role = decoded.role;
  } catch {
    return <Navigate to="/login" replace />;
  }

  const ok = Array.isArray(allowed)
    ? allowed.includes(role)
    : role === allowed;

  return ok ? <Outlet /> : <Navigate to="/" replace />;
}

RequireRole.propTypes = {
  allowed: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]).isRequired,
};

export default RequireRole;
