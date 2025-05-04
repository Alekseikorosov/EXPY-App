// QuizModal.jsx
import React from 'react';
import PropTypes from 'prop-types';
import Bookmark from './Bookmark';
import '../styles/QuizModal.css';

function QuizModal({ quiz, isLoggedIn, isFavorite, onToggleFavorite, onClose, onStartQuiz }) {
  return (
    <div className="quiz-modal-overlay" onClick={onClose}>
      <div className="quiz-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="quiz-modal-close" onClick={onClose}>
          ×
        </button>
        <h2 className="quiz-modal-title">{quiz.title}</h2>
        {quiz.cover && (
          <div className="quiz-modal-cover">
            <img src={quiz.cover} alt="Quiz Cover" />
          </div>
        )}
        <p>Creator: {quiz.creator?.username || '—'}</p>
        <p>Questions: {quiz.question_quantity}</p>
        <p>Category: {quiz.category?.name || '—'}</p>
        <p>Date: {new Date(quiz.created_at).toLocaleDateString()}</p>
        <div className="quiz-modal-actions">
          {isLoggedIn && (
            <Bookmark 
              isFavorite={isFavorite} 
              onToggle={onToggleFavorite} 
            />
          )}
          <button 
            onClick={onStartQuiz} 
            className="quiz-modal-start-button"
          >
            Start Quiz
          </button>
        </div>
      </div>
    </div>
  );
}

QuizModal.propTypes = {
  quiz: PropTypes.object.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
  isFavorite: PropTypes.bool,
  onToggleFavorite: PropTypes.func,
  onClose: PropTypes.func.isRequired,
  onStartQuiz: PropTypes.func.isRequired,
};

export default QuizModal;
