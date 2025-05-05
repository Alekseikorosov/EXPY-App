// src/pages/HomePage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/axiosInstance';
import Header from '../components/Header';
import CategoriesModal from '../components/CategoriesModal';
import QuizModal from '../components/QuizModal';
import '../styles/HomePage.css';

function HomePage() {
  const navigate = useNavigate();

  // ———————————— текущий пользователь (для бейджа автора)
  const [currentUserId, setCurrentUserId] = useState(null);
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const { id } = jwtDecode(token);
        setCurrentUserId(id);
      } catch {
        console.warn('Invalid token');
      }
    }
  }, []);

  // состояния для квизов и пагинации
  const [quizzes, setQuizzes] = useState([]);
  const [page, setPage] = useState(1);
  const limit = 9;
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // сортировка и фильтры
  const [sortOrder, setSortOrder] = useState('new');
  const [isCatModalOpen, setIsCatModalOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState(() => {
    const saved = localStorage.getItem('selectedCategories');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch (e) {
        console.warn('Не удалось прочитать selectedCategories из localStorage', e);
      }
    }
    return [];
  });

  // модалка деталей квиза
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // поиск по названию/создателю
  const [searchQuery, setSearchQuery] = useState('');

  const isLoggedIn = !!localStorage.getItem('accessToken');

  const [availableCategories, setAvailableCategories] = useState([]);

  // infinite scroll
  const observer = useRef();
  const lastQuizElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(p => p + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

    useEffect(() => {
        if (isCatModalOpen) {
          api.get('/categories')
            .then(res => setAvailableCategories(res.data))
            .catch(err => console.error('Ошибка загрузки категорий:', err));
        }
      }, [isCatModalOpen]);

      

  // загрузка списка квизов
  useEffect(() => {
    setLoading(true);
    const params = { page, limit, sort: sortOrder };
    if (selectedCategories.length) {
      params.categories = selectedCategories.map(c => c.id).join(',');
    }

    api.get('/quizzes', { params })
      .then(res => {
        // теперь res.data = { total, page, pageCount, quizzes: [...] }
        const newData = res.data.quizzes;
        setQuizzes(prev => {
          if (page === 1) return newData;
          const existingIds = new Set(prev.map(q => q.id));
          const filtered = newData.filter(q => !existingIds.has(q.id));
          return [...prev, ...filtered];
        });
        setHasMore(newData.length >= limit);
      })
      .catch(err => {
        console.error('Ошибка при загрузке квизов:', err);
        setError('Ошибка загрузки квизов');
      })
      .finally(() => setLoading(false));
  }, [page, limit, sortOrder, selectedCategories]);

  // сброс при смене категорий
  useEffect(() => {
    setPage(1);
    setQuizzes([]);
  }, [selectedCategories]);

  // фильтрация поиска
  const filteredQuizzes = quizzes.filter(quiz => {
    const q = searchQuery.toLowerCase();
    return (
      quiz.title.toLowerCase().includes(q) ||
      quiz.creator?.username?.toLowerCase().includes(q)
    );
  });

    useEffect(() => {
        setPage(1);
        setQuizzes([]);
    }, [sortOrder]);

  // управление модалкой категорий
  const handleOpenCatModal = () => setIsCatModalOpen(true);
  const handleCloseCatModal = () => setIsCatModalOpen(false);



  const handleClearCategories = () => {
    setSelectedCategories([]);
    localStorage.removeItem('selectedCategories');
  };
  

  const handleAddCategories = cats => {
    setSelectedCategories(cats);
    localStorage.setItem('selectedCategories', JSON.stringify(cats));
    setIsCatModalOpen(false);
  };


  

  // открытие деталей квиза
  const handleOpenQuiz = async quizId => {
    try {
      const res = await api.get(`/quizzes/${quizId}`);
      setSelectedQuiz(res.data);

      const token = localStorage.getItem('accessToken');
      if (token) {
        const chk = await api.get(`/favorites/check?quizId=${quizId}`, {
          headers: { Authorization: 'Bearer ' + token }
        });
        setIsFavorite(chk.data.isFavorite);
      } else {
        setIsFavorite(false);
      }
      setIsModalOpen(true);
    } catch {
      alert('Не удалось загрузить детали квиза');
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedQuiz(null);
    setIsFavorite(false);
  };

  // toggle favorite
  const handleToggleFavorite = async () => {
    if (!selectedQuiz) return;
    const token = localStorage.getItem('accessToken');
    if (!token) { alert('Вы не авторизованы'); return; }

    try {
      if (isFavorite) {
        await api.delete(`/favorites?quizId=${selectedQuiz.id}`, {
          headers: { Authorization: 'Bearer ' + token }
        });
        setIsFavorite(false);
      } else {
        await api.post(`/favorites?quizId=${selectedQuiz.id}`, null, {
          headers: { Authorization: 'Bearer ' + token }
        });
        setIsFavorite(true);
      }
    } catch {
      alert('Не удалось изменить избранное');
    }
  };

  // старт квиза
  const handleStartQuiz = () => {
    if (selectedQuiz) navigate(`/quiz/${selectedQuiz.id}`);
  };

  return (
    <div className="home-container">
      <Header />

      <main className="home-main">
        <h1 className="home-title">Discover Fun and Interactive Quizzes!</h1>

        <div className="home-search-section">
          <input
            type="text"
            placeholder="Search by title or creator..."
            className="home-search-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <select
            value={sortOrder}
            onChange={e => setSortOrder(e.target.value)}
          >
            <option value="new">New</option>
            <option value="old">Old</option>
          </select>
          <button onClick={handleOpenCatModal}>Categories</button>
          {selectedCategories.length > 0 && (
            <button onClick={handleClearCategories}>Clear Categories</button>
          )}
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div className="home-quiz-list">
          {filteredQuizzes.map((quiz, index) => {
            const isLast = index === filteredQuizzes.length - 1;
            // предполагаем, что API отдаёт поле myProgress (0–100)
            const progress = quiz.myProgress ?? 0;

            return (
              <div
                key={quiz.id}
                className="home-quiz-card-wrapper"
                ref={isLast ? lastQuizElementRef : null}
              >
                {/* бейдж «вы — автор» */}
                {quiz.creator?.id === currentUserId && (
                  <div
                    className="quiz-owner-badge"
                    title="You created this quiz"
                  >
                    👑
                  </div>
                )}

                <div
                  className="home-quiz-card"
                  onClick={() => handleOpenQuiz(quiz.id)}
                  style={{ cursor: 'pointer' }}
                >
                  {quiz.cover && (
                    <img
                      src={quiz.cover}
                      alt={quiz.title}
                      className="quiz-cover-image"
                    />
                  )}
                  <h2>{quiz.title}</h2>

                  {/* прогресс‑бар */}
                  <div 
                    className="quiz-progress-bar" 
                    role="progressbar" 
                    aria-valuemin="0" 
                    aria-valuemax="100" 
                    aria-valuenow={progress}
                  >
                    <div
                      className="quiz-progress-fill"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="progress-label">{progress}%</p>

                  <p>Category: {quiz.category?.name || '—'}</p>
                  <p>Date: {new Date(quiz.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            );
          })}
        </div>

        {loading && (
          <div className="loading-indicator">Loading...</div>
        )}
      </main>

      {isModalOpen && selectedQuiz && (
        <QuizModal
          quiz={selectedQuiz}
          isLoggedIn={isLoggedIn}
          isFavorite={isFavorite}
          onToggleFavorite={handleToggleFavorite}
          onClose={handleCloseModal}
          onStartQuiz={handleStartQuiz}
        />
      )}

      <CategoriesModal
        isOpen={isCatModalOpen}
        onClose={handleCloseCatModal}
        onAddCategories={handleAddCategories}
        alreadySelected={selectedCategories}
        availableCategories={availableCategories}
      />
    </div>
  );
}

export default HomePage;
