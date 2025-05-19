// src/components/QuizModal.jsx

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Bookmark } from 'lucide-react';
import '../styles/QuizModal.css';

function QuizModal({ quiz, isLoggedIn, isFavorite, onToggleFavorite, onClose, onStartQuiz }) {
  const [animate, setAnimate] = useState(false);

  if (!quiz) return null;

  const handleFavoriteClick = () => {
    // Запускаем pop-анимацию
    setAnimate(true);
    onToggleFavorite();
    setTimeout(() => setAnimate(false), 400);
  };

  const handleOverlayClick = () => onClose();
  const stopPropagation = (e) => e.stopPropagation();

  return (
    <div className="quiz-modal-overlay show" onClick={handleOverlayClick}>
      <div className="quiz-modal-content" onClick={stopPropagation}>
        <button className="quiz-modal-close" onClick={onClose}>×</button>

        <h2 className="quiz-modal-title">{quiz.title}</h2>

        <div className="quiz-modal-image-wrapper">
          {quiz.cover ? (
            <img src={quiz.cover} alt="Quiz cover" className="quiz-modal-image" />
          ) : (
            <div className="quiz-modal-image-placeholder">No image</div>
          )}
        </div>

        <div className="quiz-modal-info-row">
          <div className="quiz-modal-info-card">
            <h4>Category</h4>
            <p>{quiz.category?.name || '—'}</p>
          </div>
          <div className="quiz-modal-info-card">
            <h4>Questions</h4>
            <p>{quiz.questions?.length || 0}</p>
          </div>
          <div className="quiz-modal-info-card">
            <h4>Creator</h4>
            <p>{quiz.creator?.username || '—'}</p>
          </div>
          <div className="quiz-modal-info-card">
            <h4>Date</h4>
            <p>{new Date(quiz.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="quiz-modal-actions">
          {isLoggedIn && (
            <button
              onClick={handleFavoriteClick}
              className={`quiz-modal-favorite-icon ${animate ? 'animate-bookmark' : ''}`}
            >
              <Bookmark
                color={isFavorite ? "#facc15" : "#9ca3af"}
                fill={isFavorite ? "#facc15" : "none"}
                size={48}
              />
            </button>
          )}
          <button onClick={onStartQuiz} className="quiz-modal-start-button">
            Start quiz
          </button>
        </div>
      </div>
    </div>
  );
}

QuizModal.propTypes = {
  quiz: PropTypes.shape({
    title: PropTypes.string,
    cover: PropTypes.string,
    category: PropTypes.shape({ name: PropTypes.string }),
    questions: PropTypes.array,
    creator: PropTypes.shape({ username: PropTypes.string }),
    created_at: PropTypes.string,
  }).isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  isFavorite: PropTypes.bool.isRequired,
  onToggleFavorite: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  onStartQuiz: PropTypes.func.isRequired,
};

export default QuizModal;
