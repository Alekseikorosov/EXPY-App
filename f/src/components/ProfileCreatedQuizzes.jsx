import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
// Убираем Link, так как он не используется
import { jwtDecode } from 'jwt-decode';
import api from '../utils/axiosInstance';
import CategoriesModal from './CategoriesModal';
import '../styles/ProfileCreatedQuizzes.css';
import { toast } from 'react-toastify';
import QuizCard from './profileComp/QuizCard';

function ProfileCreatedQuizzes({ searchTerm, selectedCategories, setSelectedCategories }) {
  const [userId, setUserId] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [openDropdownQuizId, setOpenDropdownQuizId] = useState(null);
  const navigate = useNavigate();
  const [dateSort, setDateSort] = useState('new');
  const [selectedQuizzes, setSelectedQuizzes] = useState([]);
  const [allSelected, setAllSelected] = useState(false);
  const [openDetailQuizId, setOpenDetailQuizId] = useState(null);
  // Для режима таблицы: показываем 7 квизов на страницу
  const tableQuizzesPerPage = 7;
  const [currentPage, setCurrentPage] = useState(1);
  // Режим отображения: 'table' (по умолчанию) или 'list'
  const [viewMode, setViewMode] = useState('table');
  // Модальные окна
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    message: '',
    onConfirm: null,
  });

  // Глобальный обработчик клика для закрытия открытых меню
  useEffect(() => {
    const handleDocumentClick = () => {
      setOpenDetailQuizId(null);
      setOpenDropdownQuizId(null);
    };
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  // Сброс выпадающего меню при изменении viewMode
  useEffect(() => {
    setOpenDropdownQuizId(null);
  }, [viewMode]);

  // Функция для обработки выбранных категорий из CategoriesModal
  const handleAddCategories = (catObjs) => {
    setSelectedCategories(catObjs);
    setIsCategoriesModalOpen(false);
  };

  // Вычисляем список доступных категорий из квизов
  const availableCategories = Array.from(
    new Map(
      quizzes.filter((quiz) => quiz.category)
        .map((quiz) => [quiz.category.id, quiz.category])
    ).values()
  );

  // Получаем userId из токена
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.id);
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  }, []);

  // Загружаем созданные квизы для пользователя
  useEffect(() => {
    if (userId) {
      const token = localStorage.getItem('accessToken');
      api.get(`/profile/created-quizzes/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((response) => {
          setQuizzes(response.data);
        })
        .catch((error) => {
          console.error('Error loading created quizzes:', error);
        });
    }
  }, [userId]);

  // Фильтрация квизов по поисковому запросу и выбранным категориям
  const filteredQuizzes = quizzes.filter((quiz) => {
    const inTitle = quiz.title.toLowerCase().includes(searchTerm.toLowerCase());
    const selectedCatIds = selectedCategories.map((cat) => cat.id);
    const inCategory = selectedCatIds.length > 0
      ? selectedCatIds.includes(quiz.category_id)
      : true;
    return inTitle && inCategory;
  });

  // Сортировка по дате
  const sortedQuizzes = [...filteredQuizzes].sort((a, b) => {
    return dateSort === 'new'
      ? new Date(b.created_at) - new Date(a.created_at)
      : new Date(a.created_at) - new Date(b.created_at);
  });

  // Пагинация для режима таблицы
  const totalPages = viewMode === 'table' ? Math.ceil(sortedQuizzes.length / tableQuizzesPerPage) : 1;
  const currentQuizzes = viewMode === 'table'
    ? sortedQuizzes.slice((currentPage - 1) * tableQuizzesPerPage, currentPage * tableQuizzesPerPage)
    : sortedQuizzes;

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      setAllSelected(false);
      setSelectedQuizzes([]);
    }
  };

  // Bulk выбор квизов
  const handleSelectAll = () => {
    setAllSelected(!allSelected);
    if (!allSelected) {
      const ids = viewMode === 'table'
        ? currentQuizzes.map(quiz => quiz.id)
        : sortedQuizzes.map(quiz => quiz.id);
      setSelectedQuizzes(ids);
    } else {
      setSelectedQuizzes([]);
    }
  };

  // Выбор/снятие выбора одного квиза
  const handleSelectQuiz = (quizId) => {
    if (selectedQuizzes.includes(quizId)) {
      setSelectedQuizzes(selectedQuizzes.filter(id => id !== quizId));
    } else {
      setSelectedQuizzes([...selectedQuizzes, quizId]);
    }
  };

  // При клике на строку таблицы будем переключать чекбокс
  const handleRowClick = (quizId) => {
    handleSelectQuiz(quizId);
  };

  // Удаление одного квиза с подтверждением
  const handleDeleteQuiz = (quizId) => {
    setConfirmModal({
      isOpen: true,
      message: 'Are you sure you want to delete this quiz?',
      onConfirm: () => {
        const token = localStorage.getItem('accessToken');
        api.delete(`/quizzes/${quizId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
          .then(() => {
            setQuizzes(prev => prev.filter(q => q.id !== quizId));
            toast.success('Quiz successfully deleted!');
            setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          })
          .catch((error) => {
            console.error('Error deleting quiz:', error);
            toast.error('Error deleting quiz');
            setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          });
      },
    });
  };

  // Удаление выбранных квизов
  const handleDeleteSelected = () => {
    if (selectedQuizzes.length === 0) return;
    setConfirmModal({
      isOpen: true,
      message: 'Are you sure you want to delete the selected quizzes?',
      onConfirm: () => {
        const token = localStorage.getItem('accessToken');
        api.delete(`/profile/delete-multiple/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
          data: { quizIds: selectedQuizzes },
        })
          .then(() => {
            setQuizzes(prev => prev.filter(q => !selectedQuizzes.includes(q.id)));
            setSelectedQuizzes([]);
            setAllSelected(false);
            toast.success('Quizzes successfully deleted!');
            setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          })
          .catch((error) => {
            console.error('Error deleting quizzes:', error);
            toast.error('Error deleting quizzes');
            setConfirmModal({ isOpen: false, message: '', onConfirm: null });
          });
      },
    });
  };

  // Функция для перехода при нажатии "Start Quiz"
  const handleStartQuiz = (quizId) => {
    navigate(`/quiz/${quizId}`);
  };

  // Рендер строк таблицы для режима "table"
  const renderQuizRow = (quiz) => {
    const isSelected = selectedQuizzes.includes(quiz.id);
    return (
      <tr key={quiz.id} className={isSelected ? 'selected' : ''} onClick={() => handleRowClick(quiz.id)}>
        <td className="checkbox-cell">
          <div className="checkbox-wrapper">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                handleSelectQuiz(quiz.id);
              }}
            />
          </div>
        </td>
        <td>{quiz.title}</td>
        <td>{quiz.category?.name || 'No Category'}</td>
        <td>{quiz.question_quantity}</td>
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
                <button onClick={() => navigate(`/edit-quiz/${quiz.id}`)}>Edit Quiz</button>
                <button onClick={() => handleDeleteQuiz(quiz.id)}>Delete Quiz</button>
              </div>
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="profile-created-quizzes">
      <div className="block-container">
        <div className="filters-row">
          <div className="bulk-actions">
            <button onClick={handleSelectAll}>Select All</button>
            {selectedQuizzes.length > 0 && (
              <button onClick={handleDeleteSelected}>Delete with selected</button>
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

      <div className="block-container">
        <div className="filters-row">
          <div className="view-mode-toggle">
            <button onClick={() => { setViewMode('table'); setCurrentPage(1); }} className={viewMode === 'table' ? 'active' : ''}>
              Table View
            </button>
            <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''}>
              List View
            </button>
          </div>
        </div>
      </div>

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
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedQuizzes.length > 0 ? (
                  currentQuizzes.map((quiz) => renderQuizRow(quiz))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>No quizzes</td>
                  </tr>
                )}
              </tbody>
            </table>
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
                />
              ))
            ) : (
              <div style={{ textAlign: 'center' }}>No quizzes</div>
            )}
          </div>
        )}
      </div>

      {viewMode === 'table' && totalPages > 1 && (
        <div className="pagination-container">
          <button onClick={() => handlePageChange(currentPage - 1)}>Prev</button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              className={page === currentPage ? 'active-page' : ''}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </button>
          ))}
          <button onClick={() => handlePageChange(currentPage + 1)}>Next</button>
        </div>
      )}

      {isCategoriesModalOpen && (
        <CategoriesModal
          isOpen={isCategoriesModalOpen}
          onClose={() => setIsCategoriesModalOpen(false)}
          onAddCategories={handleAddCategories}
          alreadySelected={selectedCategories}
          availableCategories={availableCategories}
        />
      )}

      {confirmModal.isOpen && (
        <div className="confirmation-overlay" onClick={() => setConfirmModal({ isOpen: false, message: '', onConfirm: null })}>
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

ProfileCreatedQuizzes.propTypes = {
  searchTerm: PropTypes.string,
  selectedCategories: PropTypes.array,
  setSelectedCategories: PropTypes.func,
};

ProfileCreatedQuizzes.defaultProps = {
  searchTerm: '',
  selectedCategories: [],
  setSelectedCategories: () => {},
};

export default ProfileCreatedQuizzes;
