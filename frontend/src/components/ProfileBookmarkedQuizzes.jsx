import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/axiosInstance';
import CategoriesModal from './CategoriesModal';
import '../styles/ProfileCreatedQuizzes.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import QuizCard from './profileComp/QuizCard';

function ProfileBookmarkedQuizzes({ searchTerm, selectedCategories, setSelectedCategories }) {
  const [userId, setUserId] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [dateSort, setDateSort] = useState('new');
  const [selectedQuizzes, setSelectedQuizzes] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: '',
    onConfirm: null,
  });
  // Состояние для управления выпадающим меню
  const [openDropdownQuizId, setOpenDropdownQuizId] = useState(null);
  // Состояние режима отображения: 'table' или 'list'
  const [viewMode, setViewMode] = useState('table');
  // Новый стейт для показа деталей квиза (Detail)
  const [openDetailQuizId, setOpenDetailQuizId] = useState(null);

  const navigate = useNavigate();
  const quizzesPerPage = 5;

  // 1) Глобальный обработчик клика для закрытия дропдаунов и Detail
  useEffect(() => {
    const handleDocumentClick = () => {
      setOpenDropdownQuizId(null);
      setOpenDetailQuizId(null);
    };
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  // 2) Сбрасываем открытый дропдаун при смене viewMode
  useEffect(() => {
    setOpenDropdownQuizId(null);
  }, [viewMode]);

  // Декодируем id пользователя из токена
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.id);
      } catch (error) {
        console.error('Ошибка декодирования токена:', error);
      }
    }
  }, []);

  // Загружаем избранные квизы
  useEffect(() => {
    if (userId) {
      const token = localStorage.getItem('accessToken');
      api
        .get(`/profile/favourites/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setQuizzes(res.data);
        })
        .catch((error) => {
          console.error('Ошибка при загрузке избранных квизов:', error);
          toast.error('Error loading favorites');
        });
    }
  }, [userId]);

  // Фильтрация по названию и категориям
  const filteredQuizzes = quizzes.filter((quiz) => {
    const query = searchTerm.toLowerCase();
    const titleMatches = quiz.title.toLowerCase().includes(query);
    const creatorMatches = quiz.creator 
      ? quiz.creator.username.toLowerCase().includes(query)
      : false;
    const matchesTitleOrCreator = titleMatches || creatorMatches;
    const selectedCatIds = selectedCategories.map((cat) => cat.id);
    const matchesCategory = selectedCatIds.length > 0
      ? selectedCatIds.includes(quiz.category_id)
      : true;
    return matchesTitleOrCreator && matchesCategory;
  });

  // Сортировка по дате создания
  const sortedQuizzes = [...filteredQuizzes].sort((a, b) => {
    return dateSort === 'new'
      ? new Date(b.created_at) - new Date(a.created_at)
      : new Date(a.created_at) - new Date(b.created_at);
  });

  // Пагинация
  const totalPages = Math.ceil(sortedQuizzes.length / quizzesPerPage);
  const indexOfLastQuiz = currentPage * quizzesPerPage;
  const indexOfFirstQuiz = indexOfLastQuiz - quizzesPerPage;
  const currentQuizzes = sortedQuizzes.slice(indexOfFirstQuiz, indexOfLastQuiz);

  // Bulk‑выбор
  const handleSelectAll = () => {
    setAllSelected(!allSelected);
    if (!allSelected) {
      const ids = viewMode === 'table'
        ? currentQuizzes.map((quiz) => quiz.id)
        : sortedQuizzes.map((quiz) => quiz.id);
      setSelectedQuizzes(ids);
    } else {
      setSelectedQuizzes([]);
    }
  };

  const handleSelectQuiz = (quizId) => {
    if (selectedQuizzes.includes(quizId)) {
      setSelectedQuizzes(selectedQuizzes.filter((id) => id !== quizId));
    } else {
      setSelectedQuizzes([...selectedQuizzes, quizId]);
    }
  };

  // Удаление закладки
  const handleToggleFavorite = (quizId) => {
    const token = localStorage.getItem('accessToken');
    api
      .delete(`/profile/favourites/${quizId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        toast.success('Bookmark removed successfully!');
        setQuizzes((prev) => prev.filter((q) => q.id !== quizId));
      })
      .catch((error) => {
        console.error('Ошибка при снятии закладки:', error);
        toast.error('Error removing bookmark');
      });
  };

  // Массовое удаление
  const handleDeleteSelected = () => {
    if (selectedQuizzes.length === 0) return;
    setConfirmModal({
      isOpen: true,
      message: 'Вы точно хотите удалить выбранные квизы из закладок?',
      onConfirm: () => {
        const token = localStorage.getItem('accessToken');
        api
          .delete(`/profile/delete-multiple-favourites`, {
            headers: { Authorization: `Bearer ${token}` },
            data: { quizIds: selectedQuizzes },
          })
          .then(() => {
            toast.success('Bookmarks removed successfully!');
            setQuizzes((prev) => prev.filter((q) => !selectedQuizzes.includes(q.id)));
            setSelectedQuizzes([]);
            setAllSelected(false);
            setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          })
          .catch((error) => {
            console.error('Ошибка при массовом снятии закладок:', error);
            toast.error('Error removing bookmarks');
            setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          });
      },
    });
  };

  // Переход в квиз
  const handleStartQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  // Рендер строки для table‑view
  const renderQuizRow = (quiz) => {
    const shortTitle =
      quiz.title && quiz.title.length > 15
        ? quiz.title.slice(0, 15) + '...'
        : quiz.title || 'No text';
    const isSelected = selectedQuizzes.includes(quiz.id);
    return (
      <tr key={quiz.id} className={isSelected ? 'selected' : ''} onClick={() => handleSelectQuiz(quiz.id)}>
        <td className="checkbox-cell">
          <div className="checkbox-wrapper">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleSelectQuiz(quiz.id)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </td>
        <td>{shortTitle}</td>
        <td>{quiz.category?.name || 'No Category'}</td>
        <td>{quiz.question_quantity}</td>
        <td>{quiz.creator ? quiz.creator.username : 'Unknown'}</td>
        <td>{new Date(quiz.created_at).toLocaleDateString()}</td>
        <td>
          <div className="actions-dropdown-wrapper">
            <button
              className="ellipsis-btn"
              onClick={(e) => {
                e.stopPropagation();
                setOpenDropdownQuizId(openDropdownQuizId === quiz.id ? null : quiz.id);
              }}
            >
              &hellip;
            </button>
            {openDropdownQuizId === quiz.id && (
              <div className="actions-dropdown" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => handleStartQuiz(quiz.id)}>Start Quiz</button>
                <button onClick={() => handleToggleFavorite(quiz.id)}>Remove from BM</button>
              </div>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div>
      {/* Bulk + фильтры */}
      <div className="block-container">
        <div className="filters-row">
          <div className="bulk-actions">
            <button onClick={handleSelectAll}>Select All</button>
            {selectedQuizzes.length > 0 && (
              <button onClick={handleDeleteSelected}>Remove Selected</button>
            )}
          </div>
          <div className="filter-controls">
            <div className="date-sort">
              <label>
                Date:
                <select value={dateSort} onChange={(e) => setDateSort(e.target.value)}>
                  <option value="new">New</option>
                  <option value="old">Old</option>
                </select>
              </label>
            </div>
            <button onClick={() => setIsCategoriesModalOpen(true)}>Categories</button>
            {selectedCategories.length > 0 && (
              <button onClick={() => setSelectedCategories([])}>Clear Categories</button>
            )}
          </div>
        </div>
      </div>

      {/* View toggle */}
      <div className="block-container">
        <div className="filters-row">
          <div className="view-mode-toggle">
            <button
              onClick={() => { setViewMode('table'); setCurrentPage(1); }}
              className={viewMode === 'table' ? 'active' : ''}
            >
              Table View
            </button>
            <button
              onClick={() => { setViewMode('list'); setCurrentPage(1); }}
              className={viewMode === 'list' ? 'active' : ''}
            >
              List View
            </button>
          </div>
        </div>
      </div>

      {/* Отображение квизов */}
      <div className="block-container quizzes-scrollable">
        {viewMode === 'table' ? (
          <div className="table-wrapper">
            <table className="quizzes-table">
              <thead>
                <tr>
                  <th></th>
                  <th>Title</th>
                  <th>Category</th>
                  <th>Questions</th>
                  <th>Creator</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedQuizzes.length > 0 ? (
                  currentQuizzes.map((quiz) => renderQuizRow(quiz))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center' }}>No quizzes</td>
                  </tr>
                )}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="pagination-container">
                <button onClick={() => setCurrentPage(currentPage - 1)}>Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    className={page === currentPage ? 'active-page' : ''}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </button>
                ))}
                <button onClick={() => setCurrentPage(currentPage + 1)}>Next</button>
              </div>
            )}
          </div>
        ) : (
          <div className="list-view">
            {sortedQuizzes.length > 0 ? (
              sortedQuizzes.map((quiz) => (
                <QuizCard
                  key={quiz.id}
                  quiz={quiz}
                  selectedQuizzes={selectedQuizzes}
                  handleSelectQuiz={handleSelectQuiz}
                  openDetailQuizId={openDetailQuizId}
                  setOpenDetailQuizId={setOpenDetailQuizId}
                  openDropdownQuizId={openDropdownQuizId}
                  setOpenDropdownQuizId={setOpenDropdownQuizId}
                  handleStartQuiz={handleStartQuiz}
                  navigate={navigate}
                  isBookmark={true}
                  handleToggleFavorite={handleToggleFavorite}
                />
              ))
            ) : (
              <div style={{ textAlign: 'center' }}>No quizzes</div>
            )}
          </div>
        )}
      </div>

      {/* CategoriesModal */}
      {isCategoriesModalOpen && (
        <CategoriesModal
          isOpen={isCategoriesModalOpen}
          onClose={() => setIsCategoriesModalOpen(false)}
          onAddCategories={setSelectedCategories}
          alreadySelected={selectedCategories}
          availableCategories={Array.from(
            new Map(
              quizzes
                .filter((q) => q.category)
                .map((q) => [q.category.id, q.category])
            ).values()
          )}
        />
      )}

      {/* ConfirmModal */}
      {confirmModal.isOpen && (
        <div
          className="confirmation-overlay"
          onClick={() => setConfirmModal({ isOpen: false, message: '', onConfirm: null })}
        >
          <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
            <p>{confirmModal.message}</p>
            <div className="confirmation-buttons">
              <button className="confirm-btn" onClick={confirmModal.onConfirm}>Yes</button>
              <button className="cancel-btn" onClick={() => setConfirmModal({ isOpen: false, message: '', onConfirm: null })}>No</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

ProfileBookmarkedQuizzes.propTypes = {
  searchTerm: PropTypes.string,
  selectedCategories: PropTypes.array,
  setSelectedCategories: PropTypes.func,
};

ProfileBookmarkedQuizzes.defaultProps = {
  searchTerm: '',
  selectedCategories: [],
  setSelectedCategories: () => {},
};

export default ProfileBookmarkedQuizzes;
