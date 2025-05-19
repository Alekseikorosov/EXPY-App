import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';
import QuizModal from '../QuizModal';
import '../../styles/QuizCard.css';

export default function QuizCard({
  quiz,
  attempt,
  selectedQuizzes,
  handleSelectQuiz,
  openDetailQuizId,
  setOpenDetailQuizId,
  openDropdownQuizId,
  setOpenDropdownQuizId,
  handleStartQuiz,
  navigate,
  isHistory,
  isBookmark,
  handleToggleFavorite,
}) {
  const isSelected = selectedQuizzes.includes(quiz.id);
  const [longPressFired, setLongPressFired] = useState(false);
  const pressTimerRef = useRef(null);
  const justToggledRef = useRef(false);
  const [showModal, setShowModal] = useState(false);

  const startPress = () => {
    pressTimerRef.current = setTimeout(() => {
      setLongPressFired(true);
      handleSelectQuiz(quiz.id);
    }, 500);
  };
  const clearPress = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };
  const handlePointerDown = e => {
    e.stopPropagation();
    if (selectedQuizzes.length === 0) startPress();
  };
  const handlePointerUp = e => {
    e.stopPropagation();
    clearPress();
    if (!longPressFired && selectedQuizzes.length > 0) {
      handleSelectQuiz(quiz.id);
      justToggledRef.current = true;
    }
    setLongPressFired(false);
  };
  const handlePointerLeave = e => {
    e.stopPropagation();
    clearPress();
  };

  // в начале компонента, сразу после деструктуризации props
const fullTitle = quiz.title || '';
const shortTitle =
  fullTitle.length > 15
    ? fullTitle.slice(0, 15) + '…'
    : fullTitle;


  return (
    <div
      className={`quiz-card-new${isSelected ? ' selected' : ''}`}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerLeave}
      tabIndex={0}
    >
          <h3
            className="quiz-card-new-title"
            title={fullTitle}
          >
            {shortTitle}
          </h3>


      <div
        className="quiz-card-new-cover-wrap"
        onClick={e => {
          e.stopPropagation();
          if (justToggledRef.current) {
            justToggledRef.current = false;
            return;
          }
          if ((isBookmark || isHistory) && selectedQuizzes.length === 0) {
            setShowModal(true);
          }
        }}
      >
        <img
          src={quiz.cover}
          alt={quiz.title}
          className="quiz-card-new-cover"
        />
      </div>

      <div className="quiz-card-new-footer">
        <div
          className="quiz-card-new-detail"
          onClick={e => {
            e.stopPropagation();
            setOpenDropdownQuizId(null);
            setOpenDetailQuizId(openDetailQuizId === quiz.id ? null : quiz.id);
          }}
        >
          Detail
          {openDetailQuizId === quiz.id && (
            <div className="detail-info" style={{ display: 'block' }}>
              {isHistory && attempt ? (
                <>
                  <p>Score: {attempt.final_score} / {quiz.question_quantity}</p>
                  <p>
                    Percent: {((attempt.final_score / quiz.question_quantity) * 100).toFixed(1)}%
                  </p>
                  <p>Date: {new Date(attempt.end_time).toLocaleDateString()}</p>
                  <p>
                    Duration:{' '}
                    {(() => {
                      const ms = new Date(attempt.end_time) - new Date(attempt.start_time);
                      const m = Math.floor(ms / 60000);
                      const s = Math.floor((ms % 60000) / 1000);
                      return `${m}m ${s}s`;
                    })()}
                  </p>
                </>
              ) : (
                <>
                  <p>Category: {quiz.category?.name || 'No Category'}</p>
                  <p>Questions: {quiz.question_quantity || 0}</p>
                  <p>{new Date(quiz.created_at).toLocaleDateString()}</p>
                  {isBookmark && <p>Creator: {quiz.creator?.username || 'Unknown'}</p>}
                </>
              )}
            </div>
          )}
        </div>

        <div className="actions-dropdown-wrapper">
          <button
            className="ellipsis-btn"
            onClick={e => {
              e.stopPropagation();
              setOpenDetailQuizId(null);
              setOpenDropdownQuizId(openDropdownQuizId === quiz.id ? null : quiz.id);
            }}
          >
            &hellip;
          </button>
          {openDropdownQuizId === quiz.id && (
            <div className="actions-dropdown" onClick={e => e.stopPropagation()}>
              {isHistory ? (
                <>
                  <button onClick={() => handleSelectQuiz(quiz.id)}>Retake</button>
                  <button onClick={() => navigate(`/attempt/${quiz.id}/result`)}>
                    Results
                  </button>
                </>
              ) : isBookmark ? (
                <>
                  <button onClick={() => handleStartQuiz(quiz.id)}>Start Quiz</button>
                  <button onClick={() => handleToggleFavorite(quiz.id)}>
                    Remove from BM
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => handleStartQuiz(quiz.id)}>Start Quiz</button>
                  <button onClick={() => navigate(`/edit-quiz/${quiz.id}`)}>
                    Edit Quiz
                  </button>
                  <button onClick={() => handleSelectQuiz(quiz.id)}>Delete Quiz</button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <QuizModal
          quiz={quiz}
          isLoggedIn
          isFavorite={isBookmark}
          onToggleFavorite={() => handleToggleFavorite(quiz.id)}
          onClose={() => setShowModal(false)}
          onStartQuiz={() => handleStartQuiz(quiz.id)}
        />
      )}
    </div>
  );
}

QuizCard.propTypes = {
  quiz: PropTypes.object.isRequired,
  attempt: PropTypes.shape({
    final_score: PropTypes.number,
    start_time: PropTypes.string,
    end_time: PropTypes.string,
  }),
  selectedQuizzes: PropTypes.array.isRequired,
  handleSelectQuiz: PropTypes.func.isRequired,
  openDetailQuizId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setOpenDetailQuizId: PropTypes.func.isRequired,
  openDropdownQuizId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  setOpenDropdownQuizId: PropTypes.func.isRequired,
  handleStartQuiz: PropTypes.func.isRequired,
  navigate: PropTypes.func.isRequired,
  isBookmark: PropTypes.bool,
  isHistory: PropTypes.bool,
  handleToggleFavorite: PropTypes.func,
};

QuizCard.defaultProps = {
  isBookmark: false,
  isHistory: false,
  handleToggleFavorite: () => {},
  attempt: null,
};
