import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';
import api from '../utils/axiosInstance';

export default function RequireEnergy({ children }) {
  const navigate = useNavigate();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    let role = null;
    try {
      role = jwtDecode(token)?.role;
    } catch (err) {
      console.warn('Error decoding token:', err);
    }

    if (role === 'admin') {
      setAllowed(true);
      return;
    }

    api.get('/profile/fuel')
      .then(({ data }) => {
        if (data.fuel >= 20) {
          setAllowed(true);
        } else {
          navigate('/', { replace: true });
        }
      })
      .catch(err => {
        console.error('Error fetching fuel:', err);
        navigate('/', { replace: true });
      });
  }, [navigate]);

  if (!allowed) return null;
  return children;
}

RequireEnergy.propTypes = {
  children: PropTypes.node.isRequired,
};
