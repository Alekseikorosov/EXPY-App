// import React, { useEffect, useState, useRef } from 'react';
// import { Link, useNavigate } from 'react-router-dom';

// import logoImage from '../assets/Group 189.png';
// import userIcon from '../assets/Vector.png';
// import settingsIcon from '../assets/Setting.png';

// import '../styles/Header.css';
// import Personalization from './Personalization';
// import Security from "./Security"; // Импорт нового компонента

// function Header() {
//   const navigate = useNavigate();
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [showMenu, setShowMenu] = useState(false);
//   const [showSettingsModal, setShowSettingsModal] = useState(false);
//   const [activeTab, setActiveTab] = useState('personalization'); // 'personalization' | 'security'
//   const menuRef = useRef(null);

//   useEffect(() => {
//     const token = localStorage.getItem('accessToken');
//     setIsLoggedIn(!!token);
//   }, []);

//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (menuRef.current && !menuRef.current.contains(event.target)) {
//         setShowMenu(false);
//       }
//     }
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem('accessToken');
//     setIsLoggedIn(false);
//     setShowMenu(false);
//     navigate('/');
//   };

//   const goToProfile = () => {
//     setShowMenu(false);
//     navigate('/profile');
//   };

//   return (
//       <>
//         <header className="app-header">
//           <div className="header-left">
//             <Link to="/">
//               <img src={logoImage} alt="EXPY Logo" className="logo-image" />
//             </Link>
//           </div>

//           {isLoggedIn && (
//               <div className="header-center">
//                 <nav className="nav-links">
//                   <Link to="/" className="header-link">
//                     Home
//                   </Link>
//                   <Link to="/create-quiz" className="header-link">
//                     Create Quiz
//                   </Link>
//                   <button
//                       className="settings-button"
//                       onClick={() => setShowSettingsModal(true)}
//                   >
//                     <img src={settingsIcon} alt="Settings" className="settings-icon" />
//                   </button>
//                 </nav>
//               </div>
//           )}

//           <div className="header-right">
//             {isLoggedIn ? (
//                 <div className="user-controls" ref={menuRef}>
//                   <img
//                       src={userIcon}
//                       alt="User Icon"
//                       className="header-icon"
//                       onClick={() => setShowMenu((prev) => !prev)}
//                   />
//                   {showMenu && (
//                       <div className="dropdown-menu">
//                         <button onClick={goToProfile} className="dropdown-item">
//                           Profile
//                         </button>
//                         <button onClick={handleLogout} className="dropdown-item">
//                           Logout
//                         </button>
//                       </div>
//                   )}
//                 </div>
//             ) : (
//                 <Link to="/login" className="login-link">
//                   Log In
//                 </Link>
//             )}
//           </div>
//         </header>

//         {/* Модальное окно настроек */}
//         {showSettingsModal && (
//             <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
//               <div className="modal-container" onClick={(e) => e.stopPropagation()}>
//                 <div className="modal-header">
//                   <h2>Settings</h2>
//                 </div>
//                 <div className="modal-body">
//                   <div className="settings-sidebar">
//                     <button
//                         className={`sidebar-btn ${
//                             activeTab === 'personalization' ? 'active' : ''
//                         }`}
//                         onClick={() => setActiveTab('personalization')}
//                     >
//                   <span role="img" aria-label="user">
//                     👤
//                   </span>{' '}
//                       Personalization
//                     </button>
//                     <button
//                         className={`sidebar-btn ${
//                             activeTab === 'security' ? 'active' : ''
//                         }`}
//                         onClick={() => setActiveTab('security')}
//                     >
//                   <span role="img" aria-label="shield">
//                     🛡️
//                   </span>{' '}
//                       Security
//                     </button>
//                   </div>

//                   {/* Здесь рендерим нужный компонент в зависимости от выбранной вкладки */}
//                   {activeTab === 'personalization' ? (
//                       <Personalization />
//                   ) : (
//                       <div className="settings-content">
//                         <Security />
//                       </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//         )}
//       </>
//   );
// }

// export default Header;
// import React, { useEffect, useState, useRef } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import api from '../utils/axiosInstance';              // <- добавили импорт
// import logoImage from '../assets/Group 189.png';
// import userIcon from '../assets/Vector.png';
// import settingsIcon from '../assets/Setting.png';
// import '../styles/Header.css';
// import Personalization from './Personalization';
// import Security from "./Security";

// function Header() {
//   const navigate = useNavigate();
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [showMenu, setShowMenu] = useState(false);
//   const [showSettingsModal, setShowSettingsModal] = useState(false);
//   const [activeTab, setActiveTab] = useState('personalization');
//   const menuRef = useRef(null);

//   useEffect(() => {
//     const token = localStorage.getItem('accessToken');
//     setIsLoggedIn(!!token);
//   }, []);

//   useEffect(() => {
//     function handleClickOutside(event) {
//       if (menuRef.current && !menuRef.current.contains(event.target)) {
//         setShowMenu(false);
//       }
//     }
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//     };
//   }, []);

//   const handleLogout = async () => {
//     const refreshToken = localStorage.getItem('refreshToken');
//     if (refreshToken) {
//       try {
//         await api.post('/auth/logout', { refreshToken });
//       } catch (e) {
//         console.warn('Не удалось отозвать refreshToken', e);
//       }
//     }
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('refreshToken');
//     setIsLoggedIn(false);
//     setShowMenu(false);
//     navigate('/');
//   };

//   const goToProfile = () => {
//     setShowMenu(false);
//     navigate('/profile');
//   };

//   return (
//     <>
//       <header className="app-header">
//         <div className="header-left">
//           <Link to="/">
//             <img src={logoImage} alt="EXPY Logo" className="logo-image" />
//           </Link>
//         </div>

//         {isLoggedIn && (
//           <div className="header-center">
//             <nav className="nav-links">
//               <Link to="/" className="header-link">
//                 Home
//               </Link>
//               <Link to="/create-quiz" className="header-link">
//                 Create Quiz
//               </Link>
//               <button
//                 className="settings-button"
//                 onClick={() => setShowSettingsModal(true)}
//               >
//                 <img
//                   src={settingsIcon}
//                   alt="Settings"
//                   className="settings-icon"
//                 />
//               </button>
//             </nav>
//           </div>
//         )}

//         <div className="header-right">
//           {isLoggedIn ? (
//             <div className="user-controls" ref={menuRef}>
//               <img
//                 src={userIcon}
//                 alt="User Icon"
//                 className="header-icon"
//                 onClick={() => setShowMenu((prev) => !prev)}
//               />
//               {showMenu && (
//                 <div className="dropdown-menu">
//                   <button onClick={goToProfile} className="dropdown-item">
//                     Profile
//                   </button>
//                   <button onClick={handleLogout} className="dropdown-item">
//                     Logout
//                   </button>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <Link to="/login" className="login-link">
//               Log In
//             </Link>
//           )}
//         </div>
//       </header>

//       {showSettingsModal && (
//         <div
//           className="modal-overlay"
//           onClick={() => setShowSettingsModal(false)}
//         >
//           <div
//             className="modal-container"
//             onClick={(e) => e.stopPropagation()}
//           >
//             <div className="modal-header">
//               <h2>Settings</h2>
//             </div>
//             <div className="modal-body">
//               <div className="settings-sidebar">
//                 <button
//                   className={`sidebar-btn ${
//                     activeTab === 'personalization' ? 'active' : ''
//                   }`}
//                   onClick={() => setActiveTab('personalization')}
//                 >
//                   <span role="img" aria-label="user">
//                     👤
//                   </span>{' '}
//                   Personalization
//                 </button>
//                 <button
//                   className={`sidebar-btn ${
//                     activeTab === 'security' ? 'active' : ''
//                   }`}
//                   onClick={() => setActiveTab('security')}
//                 >
//                   <span role="img" aria-label="shield">
//                     🛡️
//                   </span>{' '}
//                   Security
//                 </button>
//               </div>

//               {activeTab === 'personalization' ? (
//                 <Personalization />
//               ) : (
//                 <div className="settings-content">
//                   <Security />
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// export default Header;
// src/components/Header.jsx
// Полная версия после правок – отображение топлива в формате «текущее/максимум ⚡»

// src/components/Header.jsx
// Полная версия после правок – отображение топлива и PropTypes для ESLint

// src/components/Header.jsx
// Полная версия после правок – отображение топлива и PropTypes для ESLint

// src/components/Header.jsx
// Полная версия после правок – отображение топлива и PropTypes для ESLint

// import React, { useEffect, useState, useRef } from 'react';
// import PropTypes from 'prop-types';
// import { Link, useNavigate, useLocation } from 'react-router-dom';
// import api from '../utils/axiosInstance';
// import logoImage from '../assets/Group 189.png';
// import userIcon from '../assets/Vector.png';
// import settingsIcon from '../assets/Setting.png';
// import '../styles/Header.css';
// import Personalization from './Personalization';
// import Security from './Security';

// /** Максимальное значение топлива (должно совпадать с backend utils/fuel.js) */
// const MAX_FUEL = 160;
// /** Интервал восстановления одной единицы (ms): 8 минут */
// const REGEN_INTERVAL = 8 * 60 * 1000;

// /** Индикатор ⚡ */
// function FuelIndicator({ value }) {
//   const percent = Math.min(100, (value / MAX_FUEL) * 100);
//   return (
//     <div className="fuel-indicator" title={`${value} / ${MAX_FUEL} ⚡`}>
//       <div className="fuel-bar-bg">
//         <div className="fuel-bar" style={{ width: `${percent}%` }} />
//       </div>
//       <span className="fuel-text">{value}/{MAX_FUEL}⚡</span>
//     </div>
//   );
// }
// FuelIndicator.propTypes = { value: PropTypes.number.isRequired };

// function Header() {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const menuRef = useRef(null);

//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [fuel, setFuel] = useState(MAX_FUEL);
//   const [fuelUpdatedAt, setFuelUpdatedAt] = useState(null);
//   const [showMenu, setShowMenu] = useState(false);
//   const [showSettingsModal, setShowSettingsModal] = useState(false);
//   const [activeTab, setActiveTab] = useState('personalization');
//   const [showTooltip, setShowTooltip] = useState(false);
//   const [timer, setTimer] = useState(Date.now());

//   /** Загружает текущее топливо и время последнего обновления */
//   const loadFuel = async () => {
//     try {
//       const response = await api.get('/profile/fuel');
//       setFuel(response.data.fuel);
//       setFuelUpdatedAt(response.data.fuel_updated_at || response.data.fuelUpdatedAt);
//     } catch (error) {
//       console.error('Ошибка загрузки топлива:', error);
//     }
//   };

//   // Инициализация
//   useEffect(() => {
//     const token = localStorage.getItem('accessToken');
//     if (token) {
//       setIsLoggedIn(true);
//       loadFuel();
//     }
//   }, []);

//   // Обновляем топливо каждую минуту
//   useEffect(() => {
//     if (!isLoggedIn) return;
//     const id = setInterval(loadFuel, 60000);
//     return () => clearInterval(id);
//   }, [isLoggedIn]);

//   // Подгружаем топливо при смене маршрута
//   useEffect(() => {
//     if (isLoggedIn) loadFuel();
//   }, [location.pathname, isLoggedIn]);

//   // Обновляем таймер при наведении на индикатор
//   useEffect(() => {
//     if (!showTooltip) return;
//     const id = setInterval(() => setTimer(Date.now()), 1000);
//     return () => clearInterval(id);
//   }, [showTooltip]);

//   // Автоматическая подгрузка после восстановления ⚡
//   useEffect(() => {
//     if (!isLoggedIn || fuel >= MAX_FUEL || !fuelUpdatedAt) return;
//     const now = timer;
//     const last = new Date(fuelUpdatedAt).getTime();
//     const elapsed = now - last;
//     const sinceLast = elapsed % REGEN_INTERVAL;
//     const msToNext = REGEN_INTERVAL - sinceLast;
//     const timeoutId = setTimeout(loadFuel, msToNext);
//     return () => clearTimeout(timeoutId);
//   }, [isLoggedIn, fuel, fuelUpdatedAt, timer]);

//   // Закрытие меню при клике вне
//   useEffect(() => {
//     const handleClickOutside = (e) => {
//       if (menuRef.current && !menuRef.current.contains(e.target)) {
//         setShowMenu(false);
//       }
//     };
//     document.addEventListener('mousedown', handleClickOutside);
//     return () => document.removeEventListener('mousedown', handleClickOutside);
//   }, []);

//   const handleLogout = async () => {
//     const refreshToken = localStorage.getItem('refreshToken');
//     if (refreshToken) {
//       try {
//         await api.post('/auth/logout', { refreshToken });
//       } catch (error) {
//         console.warn('Не удалось отозвать refreshToken', error);
//       }
//     }
//     localStorage.removeItem('accessToken');
//     localStorage.removeItem('refreshToken');
//     setIsLoggedIn(false);
//     setShowMenu(false);
//     // Переходим на главную и делаем полную перезагрузку приложения
//     navigate('/', { replace: true });
//     window.location.reload();
//   };

//   const goToProfile = () => {
//     setShowMenu(false);
//     navigate('/profile');
//   };

//   // Вычисляем оставшееся время
//   const computeTimes = () => {
//     if (!fuelUpdatedAt) return {};
//     const now = timer;
//     const last = new Date(fuelUpdatedAt).getTime();
//     const elapsed = now - last;
//     const sinceLast = elapsed % REGEN_INTERVAL;
//     const toNext = REGEN_INTERVAL - sinceLast;
//     const unitsLeft = Math.max(0, MAX_FUEL - fuel);
//     const toFull = unitsLeft * REGEN_INTERVAL - sinceLast;
//     const format = (ms) => {
//       const total = Math.max(0, Math.ceil(ms / 1000));
//       const h = Math.floor(total / 3600);
//       const m = Math.floor((total % 3600) / 60);
//       const s = total % 60;
//       return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
//     };
//     return { toNext: format(toNext), toFull: format(toFull) };
//   };
//   const { toNext, toFull } = computeTimes();

//   // Стили для тултипа

//   return (
//     <>
//       <header className="app-header">
//         <div className="header-left">
//           <Link to="/">
//             <img src={logoImage} alt="EXPY Logo" className="logo-image" />
//           </Link>
//         </div>
//         {isLoggedIn && (
//           <div className="header-center">
//             <nav className="nav-links">
//               <Link to="/" className="header-link">Home</Link>
//               <Link to="/create-quiz" className="header-link">Create Quiz</Link>
//               <button className="settings-button" onClick={() => setShowSettingsModal(true)}>
//                 <img src={settingsIcon} alt="Settings" className="settings-icon" />
//               </button>
//             </nav>
//           </div>
//         )}
//         <div className="header-right">
//           {isLoggedIn ? (
//             <div className="user-controls" ref={menuRef}>
//               <div
//                 style={{ position: 'relative', display: 'inline-block', marginRight: '6px' }}
//                 onMouseEnter={() => setShowTooltip(true)}
//                 onMouseLeave={() => setShowTooltip(false)}
//               >
//                 <FuelIndicator value={fuel} />
//                 {showTooltip && (
//                 <div className="tooltip-content">
//                   <div className="tooltip-times">
//                     {fuel < MAX_FUEL
//                       ? <>
//                           <div>До +1: {toNext}</div>
//                           <div>До полного: {toFull}</div>
//                         </>
//                       : <div>Бак полный</div>
//                     }
//                   </div>
//                   <div className="tooltip-divider" />
//                   <div className="tooltip-desc">
//                     EXPY Sphere — это внутренняя энергия, необходимая для создания квизов.
//                     Для создания 1 квиза требуется 20 единиц эренгии, а пополнение происходит 
//                     по 1 каждые 8 минут вплоть до 160.
//                   </div>
//                 </div>
//               )}
//               </div>
//               <img
//                 src={userIcon} alt="User Icon" className="header-icon"
//                 onClick={() => setShowMenu(prev => !prev)}
//               />
//               {showMenu && (
//                 <div className="dropdown-menu">
//                   <button onClick={goToProfile} className="dropdown-item">Profile</button>
//                   <button onClick={handleLogout} className="dropdown-item">Logout</button>
//                 </div>
//               )}
//             </div>
//           ) : (
//             <Link to="/login" className="login-link">Log In</Link>
//           )}
//         </div>
//       </header>
//       {showSettingsModal && (
//         <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
//           <div className="modal-container" onClick={e => e.stopPropagation()}>
//             <div className="modal-header"><h2>Settings</h2></div>
//             <div className="modal-body">
//               <div className="settings-sidebar">
//                 <button
//                   className={`sidebar-btn ${activeTab === 'personalization' ? 'active' : ''}`}
//                   onClick={() => setActiveTab('personalization')}>
//                   👤 Personalization
//                 </button>
//                 <button
//                   className={`sidebar-btn ${activeTab === 'security' ? 'active' : ''}`}
//                   onClick={() => setActiveTab('security')}>
//                   🛡️ Security
//                 </button>
//               </div>
//               {activeTab === 'personalization'
//                 ? <Personalization />
//                 : <div className="settings-content"><Security /></div>}
//             </div>
//           </div>
//         </div>
//       )}
//     </>
//   );
// }

// export default Header;
import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import {jwtDecode} from 'jwt-decode';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/axiosInstance';
import logoImage from '../assets/Group 189.png';
import userIcon from '../assets/Vector.png';
import settingsIcon from '../assets/Setting.png';
import '../styles/Header.css';
import Personalization from './Personalization';
import Security from './Security';

/** Максимальное значение топлива (должно совпадать с backend utils/fuel.js) */
const MAX_FUEL = 160;
/** Интервал восстановления одной единицы (ms): 8 минут */
const REGEN_INTERVAL = 8 * 60 * 1000;

/** Индикатор ⚡ */
function FuelIndicator({ value }) {
  const isInfinite = !Number.isFinite(value);
  const percent = isInfinite ? 100 : Math.min(100, (value / MAX_FUEL) * 100);
  const title = isInfinite ? '∞' : `${value} / ${MAX_FUEL} ⚡`;
  const displayText = isInfinite ? '∞' : `${value}/${MAX_FUEL}`;

  return (
    <div className="fuel-indicator" title={title}>
      <div className="fuel-bar-bg">
        <div className="fuel-bar" style={{ width: `${percent}%` }} />
      </div>
      <span className="fuel-text">{displayText}⚡</span>
    </div>
  );
}
FuelIndicator.propTypes = { value: PropTypes.number.isRequired };

function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const menuRef = useRef(null);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [fuel, setFuel] = useState(MAX_FUEL);
  const [fuelUpdatedAt, setFuelUpdatedAt] = useState(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('personalization');
  const [showTooltip, setShowTooltip] = useState(false);
  const [timer, setTimer] = useState(Date.now());

  const token = localStorage.getItem('accessToken');
  let userRole = null;
  try {
    userRole = jwtDecode(token).role;
  } catch (err) {
    console.warn('Error decoding token:', err);
  }
  const canCreate = userRole === 'admin' || fuel >= 20;

  /** Загружает текущее топливо и при необходимости определяет роль admin */
  const loadFuel = async () => {
    let role = null;
    try {
      role = jwtDecode(token).role;
    } catch (err) {
      console.warn('Error decoding token:', err);
    }
    if (role === 'admin') {
      setFuel(Infinity);
      setFuelUpdatedAt(null);
      return;
    }

    try {
      const { data } = await api.get('/profile/fuel');
      setFuel(data.fuel);
      setFuelUpdatedAt(data.fuel_updated_at || data.fuelUpdatedAt);
    } catch (error) {
      console.error('Ошибка загрузки топлива:', error);
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
    if (showTooltip) {
      const id = setInterval(() => setTimer(Date.now()), 1000);
      return () => clearInterval(id);
    }
  }, [showTooltip]);

  useEffect(() => {
    if (isLoggedIn && fuel < MAX_FUEL && fuelUpdatedAt) {
      const now = timer;
      const last = new Date(fuelUpdatedAt).getTime();
      const elapsed = now - last;
      const sinceLast = elapsed % REGEN_INTERVAL;
      const msToNext = REGEN_INTERVAL - sinceLast;
      const timeoutId = setTimeout(loadFuel, msToNext);
      return () => clearTimeout(timeoutId);
    }
  }, [isLoggedIn, fuel, fuelUpdatedAt, timer]);

  useEffect(() => {
    const handleClickOutside = e => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      try {
        await api.post('/auth/logout', { refreshToken });
      } catch (err) {
        console.warn('Не удалось отозвать refreshToken', err);
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
    const now = timer;
    const last = new Date(fuelUpdatedAt).getTime();
    const elapsed = now - last;
    const sinceLast = elapsed % REGEN_INTERVAL;
    const toNext = REGEN_INTERVAL - sinceLast;
    const unitsLeft = Math.max(0, MAX_FUEL - fuel);
    const toFull = unitsLeft * REGEN_INTERVAL - sinceLast;
    const format = ms => {
      const total = Math.max(0, Math.ceil(ms / 1000));
      const h = Math.floor(total / 3600);
      const m = Math.floor((total % 3600) / 60);
      const s = total % 60;
      return `${h > 0 ? h + 'h ' : ''}${m}m ${s}s`;
    };
    return { toNext: format(toNext), toFull: format(toFull) };
  };
  const { toNext, toFull } = computeTimes();

  return (
    <>
      <header className="app-header">
        <div className="header-left">
          <Link to="/">
            <img src={logoImage} alt="EXPY Logo" className="logo-image" />
          </Link>
        </div>
        {isLoggedIn && (
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
        <div className="header-right">
          {isLoggedIn ? (
            <div className="user-controls" ref={menuRef}>
              <div
                style={{ position: 'relative', display: 'inline-block', marginRight: '6px' }}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <FuelIndicator value={fuel} />
                {showTooltip && (
                  <div className="tooltip-content">
                    <div className="tooltip-times">
                      {fuel < MAX_FUEL
                        ? <>
                            <div>До +1: {toNext}</div>
                            <div>До полного: {toFull}</div>
                          </>
                        : <div>Бак полный</div>
                      }
                    </div>
                    <div className="tooltip-divider" />
                    <div className="tooltip-desc">
                      EXPY Sphere — это внутренняя энергия, необходимая для создания квизов.
                      Для создания 1 квиза требуется 20 единиц энергии, а пополнение происходит
                      по 1 каждые 8 минут вплоть до 160.
                    </div>
                  </div>
                )}
              </div>
              <img
                src={userIcon} alt="User Icon" className="header-icon"
                onClick={() => setShowMenu(prev => !prev)}
              />
              {showMenu && (
                <div className="dropdown-menu">
                  <button onClick={goToProfile} className="dropdown-item">Profile</button>
                  <button onClick={handleLogout} className="dropdown-item">Logout</button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="login-link">Log In</Link>
          )}
        </div>
      </header>
      {showSettingsModal && (
        <div className="modal-overlay" onClick={() => setShowSettingsModal(false)}>
          <div className="modal-container" onClick={e => e.stopPropagation()}>
            <div className="modal-header"><h2>Settings</h2></div>
            <div className="modal-body">
              <div className="settings-sidebar">
                <button
                  className={`sidebar-btn ${activeTab === 'personalization' ? 'active' : ''}`}
                  onClick={() => setActiveTab('personalization')}>
                  👤 Personalization
                </button>
                <button
                  className={`sidebar-btn ${activeTab === 'security' ? 'active' : ''}`}
                  onClick={() => setActiveTab('security')}>
                  🛡️ Security
                </button>
              </div>
              {activeTab === 'personalization'
                ? <Personalization />
                : <div className="settings-content"><Security /></div>}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
