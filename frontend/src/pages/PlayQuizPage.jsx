import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axiosInstance';
import '../styles/PlayQuizPage.css';

function PlayQuizPage() {
  const { quizId, attemptId: attemptIdParam } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  // Флаги для контроля состояния
  const hasStartedRef = useRef(false);
  const isFinishedRef = useRef(false);
  const createdAttemptRef = useRef(false);
  const [attemptId, setAttemptId] = useState(attemptIdParam || null);

  // Ключ для хранения текущего индекса в localStorage
  const getIndexKey = (quizId, attemptId) =>
    `quiz_${quizId}_attempt_${attemptId}_currentIndex`;

  // Создание новой попытки
  const createAttempt = async () => {
    try {
      const res = await api.post('/game/start', { quiz_id: quizId });
      setAttempt(res.data.attempt);
      setAttemptId(res.data.attempt.id);
      createdAttemptRef.current = true;
      navigate(`/quiz/${quizId}/attempt/${res.data.attempt.id}`, { replace: true });
    } catch (error) {
      console.error('Error creating attempt:', error);
    }
  };

  // Загрузка вопросов квиза
  const loadQuestions = async () => {
    try {
      const qRes = await api.get(`/game/${quizId}/questions`);
      setQuestions(qRes.data || []);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  // Инициализация: создание попытки, загрузка вопросов и установка сохранённого индекса
  useEffect(() => {
    if (hasStartedRef.current) return;
    hasStartedRef.current = true;

    if (attemptId) {
      setAttempt({ id: attemptId, status: 'active' });
      const savedIndex = localStorage.getItem(getIndexKey(quizId, attemptId));
      if (savedIndex !== null) {
        setCurrentIndex(parseInt(savedIndex, 10));
      }
    } else {
      createAttempt();
    }
    loadQuestions();

    const handleBeforeUnload = () => {
      if (attemptId && !isFinishedRef.current && createdAttemptRef.current) {
        const url = 'http://localhost:5000/api/game/cancel';
        const data = JSON.stringify({ attempt_id: attemptId });
        const blob = new Blob([data], { type: 'application/json' });
        navigator.sendBeacon(url, blob);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (attemptId && !isFinishedRef.current && createdAttemptRef.current) {
        api.post('/game/cancel', { attempt_id: attemptId })
          .catch(err => console.error('Cancel attempt error:', err));
      }
    };
  }, [quizId, attemptId, navigate]);

  // Сохраняем текущий индекс в localStorage
  useEffect(() => {
    if (attemptId) {
      localStorage.setItem(getIndexKey(quizId, attemptId), currentIndex);
    }
  }, [quizId, attemptId, currentIndex]);

  // Проверка активности попытки (запускается только если attempt уже создан)
  useEffect(() => {
    if (!attemptId || !attempt) return;

    const intervalId = setInterval(async () => {
      try {
        const res = await api.get(`/game/checkActive/${attemptId}`);
        if (!res.data.active) {
          navigate('/session-expired', { replace: true });
        }
      } catch (error) {
        console.error('checkActive error:', error);
      }
    }, 10000);

    return () => clearInterval(intervalId);
  }, [attemptId, attempt, navigate]);

  // Обработка выбора ответа
  function handleSelectAnswer(answerId) {
    setSelectedAnswer(answerId);
  }

  // Отправка ответа
  async function submitAnswer(questionId, answerId) {
    if (!attemptId) return;
    console.log('submitAnswer =>', { attempt_id: attemptId, question_id: questionId, answer_id: answerId });
    try {
      await api.post('/game/answer', {
        attempt_id: attemptId,
        question_id: questionId,
        answer_id: answerId,
      });
    } catch (error) {
      console.error('submitAnswer error:', error);
    }
  }

  // Переход к следующему вопросу или завершение квиза
  async function handleNext() {
    if (selectedAnswer === null) {
      console.log('No answer selected for question', questions[currentIndex].id);
      return;
    }
    const currentQuestion = questions[currentIndex];
    console.log('Submitting question_id:', currentQuestion.id, 'answer_id:', selectedAnswer);
    await submitAnswer(currentQuestion.id, selectedAnswer);
    setSelectedAnswer(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishQuiz();
    }
  }

  // Завершение квиза и переход на страницу результата
  async function finishQuiz() {
    if (!attemptId) return;
    isFinishedRef.current = true;
    try {
      const res = await api.post('/game/finish', { attempt_id: attemptId });
      const { resultToken } = res.data;
      if (!resultToken) {
        console.error('No resultToken returned from finishQuiz');
        return;
      }
      localStorage.removeItem(getIndexKey(quizId, attemptId));
      setTimeout(() => {
        navigate(`/attempt/${attemptId}/result?token=${resultToken}`, { replace: true });
      }, 500);
    } catch (error) {
      if (error.response && error.response.data.error === 'Quiz attempt expired') {
        alert('Quiz session is expired');
        navigate('/session-expired', { replace: true });
      } else {
        console.error('finishQuiz error:', error);
      }
    }
  }

  if (!attempt || questions.length === 0) {
    return <div>Loading...</div>;
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="container">
      <h2>Quiz #{quizId}</h2>
      <h3>Attempt ID: {attemptId}</h3>
      <div className="progressContainer">
        <p className="progressText">
          Question {currentIndex + 1} of {questions.length}
        </p>
        <div className="tilesContainer">
          {questions.map((_, index) => {
            let tileClass = 'tile';
            if (index < currentIndex) {
              tileClass += ' tileCompleted';
            } else if (index === currentIndex) {
              tileClass += ' tileCurrent';
            } else {
              tileClass += ' tileFuture';
            }
            return <div key={index} className={tileClass} />;
          })}
        </div>
      </div>

      <div className="question-section">
        <p className="questionText">{currentQuestion.question_text}</p>
        {currentQuestion.question_image && (
          <div className="imageWrapper">
            <img src={currentQuestion.question_image} alt="Question" className="image" />
          </div>
        )}
        <div className="answersContainer">
          {currentQuestion.answers.map((ans) => {
            const isSelected = selectedAnswer === ans.id;
            return (
              <button
                key={ans.id}
                className={`answerButton ${isSelected ? 'selectedAnswer' : ''}`}
                onClick={() => handleSelectAnswer(ans.id)}
              >
                {ans.answer_text}
              </button>
            );
          })}
        </div>
      </div>

      <button type="button" className="nextButton" onClick={handleNext} disabled={selectedAnswer === null}>
        {currentIndex < questions.length - 1 ? 'Next' : 'Finish'}
      </button>
    </div>
  );
}

export default PlayQuizPage;
