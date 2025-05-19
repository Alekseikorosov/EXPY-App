import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import { jwtDecode } from 'jwt-decode';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/axiosInstance';
import logoImage from '../assets/Group 189.png';
import userIcon from '../assets/Vector.png';
import personIcon  from '../assets/Person.png';
import securityIcon from '../assets/Security.png';
import settingsIcon from '../assets/Setting.png';
import energyPhoto from '../assets/energy.png';
import '../styles/Header.css';                 // <-- файл должен быть в src/components
import Personalization from './Personalization';
import Security from './Security';

const MAX_FUEL = 160;
const REGEN_INTERVAL = 8 * 60 * 1000;

function FuelIndicator({ value }) {
  const isInfinite = !Number.isFinite(value);
  const percent = isInfinite ? 100 : Math.min(100, (value / MAX_FUEL) * 100);
  const displayText = isInfinite ? 'Max' : `${value}/${MAX_FUEL}`;

  return (
    <div className="fuel-indicator">
      <div className="fuel-bar-bg">
        <div className="fuel-bar" style={{ width: `${percent}%` }} />
      </div>
      <div className="fuel-text">
        <img src={energyPhoto} alt="Energy Icon" className="energy-icon" />
        <span className="fuel-number">{displayText}</span>
      </div>
    </div>
  );
}
FuelIndicator.propTypes = {
  value: PropTypes.number.isRequired,
};

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);


  
  

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [fuel, setFuel] = useState(MAX_FUEL);
  const [fuelUpdatedAt, setFuelUpdatedAt] = useState(null);
  const [showEnergyMenu, setShowEnergyMenu] = useState(false);

// NOW we can safely introduce currentTime and an effect that reads showEnergyMenu:
  const [currentTime, setCurrentTime] = useState(Date.now());
  useEffect(() => {
   if (!showEnergyMenu) return;
   const timerId = setInterval(() => {
     setCurrentTime(Date.now());
   }, 1000);
   return () => clearInterval(timerId);
 }, [showEnergyMenu]);


  const [showMenu, setShowMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('personalization');

  const token = localStorage.getItem('accessToken');
  let userRole = null;
  try {
    userRole = jwtDecode(token).role;
  } catch (err) {
    console.warn('Error decoding token:', err);
  }
  const canCreate = userRole === 'admin' || fuel >= 20;

  const loadFuel = async () => {
    if (userRole === 'admin') {
      setFuel(Infinity);
      setFuelUpdatedAt(null);
      return;
    }
    try {
      const { data } = await api.get('/profile/fuel');
      setFuel(data.fuel);
      setFuelUpdatedAt(data.fuel_updated_at || data.fuelUpdatedAt);
    } catch (e) {
      console.error('Ошибка загрузки топлива:', e);
    }
  };

  useEffect(() => {
    if (token) {
      setIsLoggedIn(true);
      loadFuel();
    }
  }, [token]);

  useEffect(() => {
    if (isLoggedIn) {
      const id = setInterval(loadFuel, 60000);
      return () => clearInterval(id);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn) loadFuel();
  }, [location.pathname, isLoggedIn]);

  useEffect(() => {
    if (isLoggedIn && fuel < MAX_FUEL && fuelUpdatedAt) {
      const now = currentTime;
      const last = new Date(fuelUpdatedAt).getTime();
      const elapsed = now - last;
      const sinceLast = elapsed % REGEN_INTERVAL;
      const msToNext = REGEN_INTERVAL - sinceLast;
      const timeoutId = setTimeout(loadFuel, msToNext);
      return () => clearTimeout(timeoutId);
    }
  }, [isLoggedIn, fuel, fuelUpdatedAt]);

  useEffect(() => {
    const onClickOutside = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch (error) {
        console.warn('Logout failed:', error);
      }
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsLoggedIn(false);
    setShowMenu(false);
    navigate('/', { replace: true });
    window.location.reload();
  };

  const goToProfile = () => {
    setShowMenu(false);
    navigate('/profile');
  };

  const computeTimes = () => {
    if (!fuelUpdatedAt) return {};
    const now = Date.now();
    const last = new Date(fuelUpdatedAt).getTime();
    const elapsed = now - last;
    const sinceLast = elapsed % REGEN_INTERVAL;
    const toNext = REGEN_INTERVAL - sinceLast;
    const unitsLeft = Math.max(0, MAX_FUEL - fuel);
    const toFull = unitsLeft * REGEN_INTERVAL - sinceLast;
    const fmt = ms => {
      const s = Math.ceil(ms / 1000);
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      return `${h > 0 ? h + 'h ' : ''}${m}m ${sec}s`;
    };
    return { toNext: fmt(toNext), toFull: fmt(toFull) };
  };
  const { toNext, toFull } = computeTimes();

  return (
    <>
      <header className="app-header">
        <div className="header-left">
          <Link to="/"><img src={logoImage} alt="Logo" className="logo-image" /></Link>
        </div>

        {isLoggedIn && !isMobile && (
          <div className="header-center">
            <nav className="nav-links">
              <Link to="/" className="header-link">Home</Link>
              {canCreate
                ? <Link to="/create-quiz" className="header-link">Create Quiz</Link>
                : <span className="header-link disabled" title="Недостаточно энергии">Create Quiz</span>
              }
              <button className="settings-button" onClick={() => setShowSettingsModal(true)}>
                <img src={settingsIcon} alt="Settings" className="settings-icon" />
              </button>
            </nav>
          </div>
        )}

        <div className="header-right" ref={menuRef}>
          {isLoggedIn ? (
            <>
              <div
                className="fuel-wrapper"
                /* на десктопе — по hover */
                onMouseEnter={() => !isMobile && setShowEnergyMenu(true)}
                onMouseLeave={() => !isMobile && setShowEnergyMenu(false)}
                /* на мобилке — по клику */
                onClick={() => isMobile && setShowEnergyMenu(prev => !prev)}
              >
                <FuelIndicator value={fuel} />
                {showEnergyMenu && (
                  <div className="energy-dropdown-menu">
                    {fuel < MAX_FUEL ? (
                      <>
                        <div className="dropdown-item">Before +1: {toNext}</div>
                        <div className="dropdown-item">Before full: {toFull}</div>
                      </>
                    ) : (
                      <div className="dropdown-item">Max energy</div>
                    )}
                    <div className="dropdown-divider" />
                    <div className="dropdown-desc">
                      EXPY Sphere — internal energy for creating quizzes. 1 quiz = 20 energy. Restores 1 unit every 8 minutes up to 160.
                    </div>
                  </div>
                )}
              </div>

              <img
                src={userIcon}
                alt="User"
                className="header-icon"
                onClick={() => setShowMenu(prev => !prev)}
              />
              {showMenu && (
  <div className="dropdown-menu">
    {isMobile ? (
      <div className="mobile-nav">
        <button
          onClick={goToProfile}
          className="dropdown-item"
        >
          Profile
        </button>

        <button
          className="dropdown-item"
          onClick={() => {
            setShowSettingsModal(true);
            setShowMenu(false);
          }}
        >
          Settings
        </button>
      </div>
    ) : (
      <button
        onClick={goToProfile}
        className="dropdown-item"
      >
        Profile
      </button>
    )}

    <div className="dropdown-divider" />
    <button
      onClick={handleLogout}
      className="dropdown-item logout-item"
    >
      Logout
    </button>
  </div>
)}


            </>
          ) : (
            <Link to="/login" className="login-link">Log In</Link>
          )}
        </div>
      </header>

              {showSettingsModal && (
                <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
                  <div className="modal-container" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
          <h2>Settings</h2>
          <button
            className="modal-close-btn"
            onClick={() => setShowSettingsModal(false)}
            aria-label="Close settings"
          >
            ×
          </button>
        </div>
            <div className="modal-body">
              <div className="settings-sidebar">
                <button
                className={`sidebar-btn ${activeTab === 'personalization' ? 'active' : ''}`}
                onClick={() => setActiveTab('personalization')}
              >
                <img src={personIcon} alt="Personalization" className="sidebar-icon" />
                Personalization
              </button>
                              <button
                className={`sidebar-btn ${activeTab === 'security' ? 'active' : ''}`}
                onClick={() => setActiveTab('security')}
              >
                <img src={securityIcon} alt="Security" className="sidebar-icon" />
                Security
              </button>
              </div>
              {activeTab === 'personalization'
                ? <Personalization />
                : <div className="settings-content"><Security /></div>
              }
            </div>
          </div>
        </div>
      )}
    </>
  );
}
