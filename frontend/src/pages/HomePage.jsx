// src/pages/HomePage.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
// import { jwtDecode } from 'jwt-decode';
import api from '../utils/axiosInstance';
import Header from '../components/Header';
import CategoriesModal from '../components/CategoriesModal';
import QuizModal from '../components/QuizModal';
// import ownerIcon from '../assets/owner.png';
import '../styles/HomePage.css';
import 'particles.js';
import infoIcon from '../assets/info.png';





function HomePage() {
  const navigate = useNavigate();

  // ———————————— текущий пользователь (для бейджа автора)
  // const [currentUserId, setCurrentUserId] = useState(null);
  // useEffect(() => {
  //   const token = localStorage.getItem('accessToken');
  //   if (token) {
  //     try {
  //       const { id } = jwtDecode(token);
  //       setCurrentUserId(id);
  //     } catch {
  //       console.warn('Invalid token');
  //     }
  //   }
  // }, []);


  useEffect(() => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
}, []);

  useEffect(() => {
  if (window.particlesJS?.load) {
    window.particlesJS.load(
      'particles-js',
      '/particlesjs-config.json',
      () => console.log('Particles.js loaded')
    );
  }
}, []);


  // состояния для квизов и пагинации
  const [quizzes, setQuizzes] = useState([]);
  const animSettings = useRef({});
  const [page, setPage] = useState(1);
  const limit = 9;
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  // состояние видимости окна поддержки
 const [showSupport, setShowSupport] = useState(false);
 // переключает showSupport между true/false
 const toggleSupport = () => setShowSupport(v => !v);

  // сортировка и фильтры
  const [sortOrder, setSortOrder] = useState('Date');
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
        console.warn('Failed to read selectedCategories from localStorage', e);
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
            .catch(err => console.error('Error loading categories:', err));
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
        let newData = res.data.quizzes;

          // сортировка по дате: новое → старое или старое → новое
          
         // сортировка: новое → старое, старое → новое или рандом
            if (sortOrder === 'new') {
              newData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            } else if (sortOrder === 'old') {
              newData.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            } else {
              // когда sortOrder не 'new' и не 'old' — рандом
              newData.sort(() => Math.random() - 0.5);
            }

            setQuizzes(prev => {
              if (page === 1) return newData;
              const existingIds = new Set(prev.map(q => q.id));
              const filtered = newData.filter(q => !existingIds.has(q.id));
              return [...prev, ...filtered];
            });


        setHasMore(newData.length >= limit);
      })
      .catch(err => {
        console.error('Error loading quizzes:', err);
        setError('Error loading quizzes');
      })
      .finally(() => setLoading(false));
  }, [page, limit, sortOrder, selectedCategories]);

  // сброс при смене категорий
  useEffect(() => {
    setPage(1);
    setQuizzes([]);
  }, [selectedCategories]);

  // сброс при смене порядка сортировки
  useEffect(() => {
    setPage(1);
    setQuizzes([]);
  }, [sortOrder]);

  // фильтрация поиска
   const filteredQuizzes = quizzes.filter(quiz => {
    const q = searchQuery.toLowerCase();
    return (
      quiz.title.toLowerCase().includes(q) ||
      quiz.creator?.username?.toLowerCase().includes(q)
    );
  });


    

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

// удаление чипса категории
  const handleRemoveCategory = category => {
    const newCats = selectedCategories.filter(c => c.id !== category.id);
    setSelectedCategories(newCats);
    localStorage.setItem('selectedCategories', JSON.stringify(newCats));
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
      alert('Failed to load quiz details');
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
    if (!token) { alert('You are not logged in'); return; }

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
      alert('Failed to edit favorites');
    }
  };

  // старт квиза
  const handleStartQuiz = () => {
    if (selectedQuiz) navigate(`/quiz/${selectedQuiz.id}`);
  };

  return (
    <>
    <div id="particles-js" className="particles-bg" />
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
          <div className="home-search-controls">
              <select value={sortOrder} onChange={e => setSortOrder(e.target.value)}>
                <option value="Date">Date</option>
                <option value="new">New</option>
                <option value="old">Old</option>
              </select>
            <button onClick={handleOpenCatModal}>Categories</button>
            {selectedCategories.length > 0 && (
              <button onClick={handleClearCategories}>Clear Categories</button>
            )}
          </div>



          {selectedCategories.length > 0 && (
            <div className="selected-categories-chips">
              {selectedCategories.map(cat => (
                <div
                  key={cat.id}
                  className="category-chip"
                  onClick={() => handleRemoveCategory(cat)}
                >
                  {cat.name}
                  <span className="remove-chip">&times;</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div className="home-quiz-list">
          {filteredQuizzes.map((quiz, index) => {
            const isLast = index === filteredQuizzes.length - 1;
            // предполагаем, что API отдаёт поле myProgress (0–100)
            const progress = quiz.myProgress ?? 0;
          

            if (!animSettings.current[quiz.id]) {
             const animations = ['fadeInUp','fadeInDown','fadeInLeft','fadeInRight'];
             const anim = animations[Math.floor(Math.random() * animations.length)];
             const delay = `${Math.random() * 0.6}s`;
             animSettings.current[quiz.id] = { anim, delay };
           }
           const { anim, delay } = animSettings.current[quiz.id];

           return (
              
              <div
                key={quiz.id}
                className="home-quiz-card-wrapper visible"
                ref={isLast ? lastQuizElementRef : null}
                style={{
                '--delay': delay,   // из animSettings
                '--anim' : anim     // из animSettings
              }}
                // – чем больше множитель, тем разброс задержек шире
              >

                {/* бейдж «вы — автор» */}
                 {/* {quiz.creator?.id === currentUserId && (
                  <div className="quiz-owner-badge" title="You created this quiz">
                    <img src={ownerIcon} alt="Owner badge" className="owner-icon" />
                  </div>
                )} */}

                <div
                  className={`home-quiz-card ${!isLoggedIn ? 'home-quiz-card--compact' : ''}`}
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

                    <div className="card-bottom">
                      {/* прогресс-бар и процент только для залогиненных */}
                      {isLoggedIn && (
                        <>
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
                        </>
                      )}

                      {/* категория и дата */}
                      <div className="card-info">
                        <span>{quiz.category?.name || '—'}</span>
                        <span>{new Date(quiz.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>



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
      {/* <div className="footer-info">
          info: expy@info.ee
        </div> */}
    </div>
    <div className="support-container">
   <button
     className="support-button"
     onClick={toggleSupport}
     aria-label="Support"
   >
     ?
   </button>

      {/* ——— попап, появляется только когда showSupport = true */}
      <div className="support-container">
  <button
    className="support-button"
    onClick={toggleSupport}
    aria-label="Support"
  >
    <img src={infoIcon} alt="Info" className="support-icon" />
  </button>

   {showSupport && (
     <div className={`support-popup ${showSupport ? 'open' : ''}`}>
    <p>If u have some problems, contact us:</p>
    <a href="mailto:expy-support@info.com">
      expy-support@info.com
    </a>
  </div>
   )}
 </div>
 </div>
  </>
  );
}

export default HomePage;
