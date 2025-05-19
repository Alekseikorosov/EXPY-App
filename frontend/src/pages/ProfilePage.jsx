
// src/pages/ProfilePage.jsx
import 'particles.js'; // убедитесь, что вы выполнили npm install particles.js
import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from '../utils/axiosInstance';
import { jwtDecode } from 'jwt-decode';
import ProfileCreatedQuizzes from '../components/ProfileCreatedQuizzes';
import ProfileBookmarkedQuizzes from '../components/ProfileBookmarkedQuizzes';
import ProfileUserHistory from '../components/ProfileUserHistory';
import AdminDashboard from '../components/AdminDashboard';
import Header from '../components/Header';
import '../styles/ProfilePage.css';

function ProfilePage() {
  const location = useLocation();
  const token = localStorage.getItem('accessToken');
  let decoded = {};
  try {
    decoded = token ? jwtDecode(token) : {};
  } catch {
    decoded = {};
  }
  const isAdmin = decoded.role === 'admin';

  const [notification, setNotification] = useState('');
  const [activeTab, setActiveTab] = useState('created');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [username, setUsername] = useState('Загрузка...');
  const scrollContainerRef = useRef(null);

  // Инициализируем Particles.js
  useEffect(() => {
    if (window.particlesJS && window.particlesJS.load) {
      window.particlesJS.load(
        'particles-js',
        '/particlesjs-config.json',
        () => console.log('Particles.js loaded')
      );
    }
  }, []);

  // Восстановление активного таба
  useEffect(() => {
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) setActiveTab(savedTab);
  }, []);

  // Загрузка username
  useEffect(() => {
    if (token) {
      const tokenData = jwtDecode(token);
      axios.get(`/profile/${tokenData.id}`)
        .then(res => setUsername(res.data.username))
        .catch(console.error);
    }
  }, [token]);

  // Сохранение активного таба
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  // Сохранение позиции скролла
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const saved = localStorage.getItem('profileScroll');
    if (saved) container.scrollTop = +saved;
    const onScroll = () => localStorage.setItem('profileScroll', container.scrollTop);
    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  }, []);

  // Показ уведомления
  useEffect(() => {
    if (location.state?.notification) {
      setNotification(location.state.notification);
      const t = setTimeout(() => setNotification(''), 1500);
      return () => clearTimeout(t);
    }
  }, [location.state]);

  return (
    <>
      <div id="particles-js" className="particles-bg" />

      <div className="profile-container" ref={scrollContainerRef}>
        <Header />
        {notification && <div className="notification">{notification}</div>}
        <div className="profile-content">
          <div className="profile-sidebar">
            <h2 className="profile-username">Welcome, {username}!</h2>
            <div className="profile-menu">
              {['created','bookmarked','history','admin'].map(tab => (
                (tab !== 'admin' || isAdmin) && (
                  <div
                    key={tab}
                    className={`menu-item ${activeTab === tab ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </div>
                )
              ))}
            </div>
          </div>

          <div className="profile-main">
            <input
              type="text"
              placeholder="Search..."
              className="search-input"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />

            {activeTab === 'created' && (
              <ProfileCreatedQuizzes
                searchTerm={searchTerm}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
              />
            )}
            {activeTab === 'bookmarked' && (
              <ProfileBookmarkedQuizzes
                searchTerm={searchTerm}
                selectedCategories={selectedCategories}
                setSelectedCategories={setSelectedCategories}
              />
            )}
            {activeTab === 'history' && (
              <ProfileUserHistory searchTerm={searchTerm} />
            )}
            {activeTab === 'admin' && isAdmin && (
              <AdminDashboard searchTerm={searchTerm} />
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default ProfilePage;