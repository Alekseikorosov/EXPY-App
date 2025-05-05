import React, { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import axios from '../utils/axiosInstance';
import ProfileCreatedQuizzes from '../components/ProfileCreatedQuizzes';
import ProfileBookmarkedQuizzes from '../components/ProfileBookmarkedQuizzes';
import ProfileUserHistory from '../components/ProfileUserHistory';
import AdminDashboard from '../components/AdminDashboard';
import '../styles/ProfilePage.css';
import Header from '../components/Header';
import { jwtDecode } from 'jwt-decode';

function ProfilePage() {
  const location = useLocation();
  
  const token = localStorage.getItem('accessToken');
  let decoded = {};
  try { decoded = token ? jwtDecode(token) : {}; } catch { decoded = {}; }
  const isAdmin = decoded.role === 'admin';

  const [notification, setNotification] = useState('');
  const [activeTab, setActiveTab] = useState('created');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [username, setUsername] = useState('Загрузка...');
  const scrollContainerRef = useRef(null);

  // Чтение сохранённой активной вкладки
  useEffect(() => {
    const savedTab = localStorage.getItem('activeTab');
    if (savedTab) {
      setActiveTab(savedTab);
    }
  }, []);

  // Запрос профиля через декодирование accessToken
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      const decoded = jwtDecode(token);
      const userId = decoded.id;
      axios.get(`/profile/${userId}`)
        .then(response => setUsername(response.data.username))
        .catch(error => console.error('Ошибка получения профиля:', error));
    } else {
      console.error('accessToken не найден в localStorage');
    }
  }, []);

  // Сохранение активной вкладки при изменении
  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  // Сохранение и восстановление положения прокрутки
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      const savedScroll = localStorage.getItem('profileScroll');
      if (savedScroll) container.scrollTop = parseInt(savedScroll, 10);
      const handleScroll = () => localStorage.setItem('profileScroll', container.scrollTop);
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  // Обработка уведомления из location.state
  useEffect(() => {
    if (location.state?.notification) {
      setNotification(location.state.notification);
      const timer = setTimeout(() => setNotification(''), 1500);
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  return (
    <div className="profile-container" ref={scrollContainerRef}>
      <Header />
      {notification && <div className="notification">{notification}</div>}
      <div className="profile-content">
        {/* Sidebar */}
        <div className="profile-sidebar">
          <h2 className="profile-username">{username}</h2>
          <div className="profile-menu">
            <div
              className={`menu-item ${activeTab === 'created' ? 'active' : ''}`}
              onClick={() => setActiveTab('created')}
            >
              Created
            </div>
            <div
              className={`menu-item ${activeTab === 'bookmarked' ? 'active' : ''}`}
              onClick={() => setActiveTab('bookmarked')}
            >
              Bookmarked
            </div>
            <div
              className={`menu-item ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              History
            </div>
            {isAdmin && (
            <div
              className={`menu-item ${activeTab === 'admin' ? 'active' : ''}`}
              onClick={() => setActiveTab('admin')}
            >
              Admin
            </div>
          )}
          </div>
        </div>
        {/* Main content */}
        <div className="profile-main">
          <div className="block-container">
            <input
              type="text"
              placeholder="Search quizzes..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="block-container">
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
              <ProfileUserHistory
                searchTerm={searchTerm}
              />
            )}
            {activeTab === 'admin' && isAdmin && (
              <AdminDashboard 
              searchTerm={searchTerm}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
