import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/axiosInstance';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import CategoriesModal from './CategoriesModal';
import QuizCard from './profileComp/QuizCard';
import '../styles/ProfileCreatedQuizzes.css';


function ProfileUserHistory({ searchTerm = '' }) {
  const [userId, setUserId] = useState(null);
  const [history, setHistory] = useState([]);
  const [dateSort, setDateSort] = useState('new');
  const [dateRange, setDateRange] = useState('all');  
  
  
  
  // ← новый стейт
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' && window.innerWidth <= 768
    );
    // Режим отображения: по умолчанию table на десктопе, list на мобилке
    const [viewMode, setViewMode] = useState(isMobile ? 'list' : 'table');
  
    useEffect(() => {
      const onResize = () => {
        const mobile = window.innerWidth <= 768;
          setIsMobile(mobile);
          setViewMode(mobile ? 'list' : 'table');
        };
        // сразу приводим в корректный режим при монтировании
        onResize();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
      }, []);


  const [openDetailCardId, setOpenDetailCardId] = useState(null);
  const [openDropdownCardId, setOpenDropdownCardId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);

  const itemsPerPage = 10;
  const navigate = useNavigate();




  
  // глобальный клик для закрытия dropdown/detail
  useEffect(() => {
    const handleDocumentClick = () => {
      setOpenDetailCardId(null);
      setOpenDropdownCardId(null);
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  // сброс dropdown при смене вида
  useEffect(() => {
    setOpenDropdownCardId(null);
  }, [viewMode]);

  // декодируем ID пользователя
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const { id } = jwtDecode(token);
        setUserId(id);
      } catch {
        console.error('Token decoding error');
      }
    }
  }, []);

  // загружаем историю попыток
  useEffect(() => {
    if (!userId) return;
    api.get(`/profile/history/${userId}`)
      .then(res => setHistory(res.data))
      .catch(err => {
        console.error('Error loading user history:', err);
        toast.error('Error loading history');
      });
  }, [userId]);

  // доступные категории
  const availableCategories = Array.from(
    new Map(
      history
        .filter(item => item.quiz.category)
        .map(item => [item.quiz.category.id, item.quiz.category])
    ).values()
  );

  // фильтрация по тексту, категориям и диапазону времени
  const filteredHistory = history.filter(item => {
    const titleMatches = item.quiz.title
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const selCatIds = selectedCategories.map(c => c.id);
    const inCat = selCatIds.length
      ? selCatIds.includes(item.quiz.category?.id)
      : true;

    // диапазон времени
    const now = Date.now();
    const endTime = new Date(item.end_time).getTime();
    let inRange = true;
    if (dateRange === 'day') {
      inRange = (now - endTime) <= 24 * 60 * 60 * 1000;
    } else if (dateRange === 'week') {
      inRange = (now - endTime) <= 7 * 24 * 60 * 60 * 1000;
    } else if (dateRange === 'month') {
      inRange = (now - endTime) <= 30 * 24 * 60 * 60 * 1000;
    }

    return titleMatches && inCat && inRange;
  });

  // сортировка по дате
  const sortedHistory = [...filteredHistory].sort((a, b) =>
    dateSort === 'new'
      ? new Date(b.end_time) - new Date(a.end_time)
      : new Date(a.end_time) - new Date(b.end_time)
  );

  // пагинация и утилиты
  const totalPages = Math.ceil(sortedHistory.length / itemsPerPage);
  const pageData = sortedHistory.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  const formatDate = iso => new Date(iso).toLocaleDateString();
  const formatDuration = (s, e) => {
    const ms = new Date(e) - new Date(s);
    const m = Math.floor(ms / 60000), sec = Math.floor((ms % 60000)/1000);
    return `${m}m ${sec}s`;
  };

  // Actions
  const handleRetake = quizId => navigate(`/quiz/${quizId}`);
  const handleViewResults = attemptId => navigate(`/attempt/${attemptId}/result`);
  const handleClearHistory = () => {
    api.delete(`/profile/history/${userId}`)
      .then(() => {
        toast.success('History cleared');
        setHistory([]);
        setCurrentPage(1);
      })
      .catch(err => {
        console.error('Error clearing history:', err);
        toast.error('Error clearing history');
      });
  };

  return (
    <div className="profile-created-quizzes profile-user-history">

      {/* Фильтры */}
      <div className="block-container">
        <div className="filters-row">
          <label className="date-sort">
            <select value={dateSort} onChange={e => setDateSort(e.target.value)}>
              <option>Sort</option>
              <option value="new">Newest</option>
              <option value="old">Oldest</option>
            </select>
          </label>
          <label className="date-sort" style={{ marginLeft: '1rem' }}>
            <select value={dateRange} onChange={e => setDateRange(e.target.value)}>
              <option>Range</option>
              <option value="all">All</option>
              <option value="day">Today</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
            </select>
          </label>
          <button onClick={handleClearHistory} style={{ marginLeft: '1rem' }}>
            Clear History
          </button>
          <button onClick={() => setIsCategoriesModalOpen(true)} style={{ marginLeft: '1rem' }}>
            Categories
          </button>
          {selectedCategories.length > 0 && (
            <button onClick={() => setSelectedCategories([])} style={{ marginLeft: '1rem' }}>
              Clear Categories
            </button>
          )}
        </div>
      </div>

        {/* View toggle */}
      {!isMobile && (
  <div className="filters-row">
    <div className="view-mode-toggle">
      <button
        onClick={() => { setViewMode('table'); setCurrentPage(1); }}
        className={viewMode === 'table' ? 'active' : ''}
      >
        Table View
      </button>
      <button
        onClick={() => setViewMode('list')}
        className={viewMode === 'list' ? 'active' : ''}
      >
        List View
      </button>
    </div>
  </div>
)}

      {/* Контент */}
      <div className="block-container">
        {viewMode === 'table' ? (
          <div className="table-wrapper scrollable">
            <table className="quizzes-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Score</th>
                  <th>Percent</th>
                  <th>Date</th>
                  <th>Duration</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
              {pageData.length ? (
  pageData.map(item => {
    const fullTitle = item.quiz.title || '';
    const shortTitle =
      fullTitle.length > 15
        ? fullTitle.slice(0, 15) + '…'
        : fullTitle;

                return (
                  <tr key={item.id}>
                    <td title={fullTitle}>{shortTitle}</td>
                    <td>{item.final_score} / {item.quiz.question_quantity}</td>
                    <td>{((item.final_score / item.quiz.question_quantity) * 100).toFixed(1)}%</td>
                    <td>{formatDate(item.end_time)}</td>
                    <td>{formatDuration(item.start_time, item.end_time)}</td>
                    <td>
                      <div className="actions-dropdown-wrapper">
                        <button
                          className="ellipsis-btn"
                          onClick={e => {
                            e.stopPropagation();
                            setOpenDropdownCardId(openDropdownCardId === item.id ? null : item.id);
                          }}
                        >…</button>
                        {openDropdownCardId === item.id && (
                          <div className="actions-dropdown" onClick={e => e.stopPropagation()}>
                            <button onClick={() => handleRetake(item.quiz_id)}>Retake</button>
                            <button onClick={() => handleViewResults(item.id)}>Results</button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: 'center' }}>No history</td>
              </tr>
            )}

              </tbody>
            </table>
           
          </div>
        ) : (
          <div className="list-view scrollable">
            {sortedHistory.length ? (
              sortedHistory.map(attempt => {
                const card = {
                  id: attempt.id,
                  title: attempt.quiz.title,
                  cover: attempt.quiz.cover,
                  category: attempt.quiz.category,
                  question_quantity: attempt.quiz.question_quantity,
                  created_at: attempt.end_time,
                };
                return (
                  <QuizCard
                    key={attempt.id}
                    quiz={card}
                    attempt={attempt}
                    selectedQuizzes={[]}
                    handleSelectQuiz={() => navigate(`/quiz/${attempt.quiz.id}`)}
                    openDetailQuizId={openDetailCardId}
                    setOpenDetailQuizId={setOpenDetailCardId}
                    openDropdownQuizId={openDropdownCardId}
                    setOpenDropdownQuizId={setOpenDropdownCardId}
                    handleStartQuiz={id => navigate(`/quiz/${id}`)}
                    navigate={navigate}
                    isHistory={true}
                  />
                );
              })
            ) : (
              <div style={{ textAlign: 'center' }}>No history</div>
            )}
          </div>
        )}
      </div>




{viewMode === 'table' && totalPages > 1 && (
        <div className="pagination-container">
          <button onClick={() => setCurrentPage(currentPage - 1)}>«</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={page === currentPage ? 'active-page' : ''}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button onClick={() => setCurrentPage(currentPage + 1)}>»</button>
        </div>
      )}

      {/* Categories Modal */}
      {isCategoriesModalOpen && (
        <CategoriesModal
          isOpen={isCategoriesModalOpen}
          onClose={() => setIsCategoriesModalOpen(false)}
          onAddCategories={setSelectedCategories}
          alreadySelected={selectedCategories}
          availableCategories={availableCategories}
        />
      )}
    </div>
  );
}

ProfileUserHistory.propTypes = {
  searchTerm: PropTypes.string,
};

ProfileUserHistory.defaultProps = {
  searchTerm: '',
};

export default ProfileUserHistory;
