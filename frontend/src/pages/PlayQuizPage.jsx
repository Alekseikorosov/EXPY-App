import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/axiosInstance';
import '../styles/PlayQuizPage.css';
import 'particles.js';



function PlayQuizPage() {
  const { quizId, attemptId: attemptIdParam } = useParams();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  const hasStartedRef = useRef(false);
  const isFinishedRef = useRef(false);
  const createdAttemptRef = useRef(false);
  const [attemptId, setAttemptId] = useState(attemptIdParam || null);

  const getIndexKey = (quizId, attemptId) =>
    `quiz_${quizId}_attempt_${attemptId}_currentIndex`;

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

  const loadQuestions = async () => {
    try {
      const qRes = await api.get(`/game/${quizId}/questions`);
      setQuestions(qRes.data || []);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };


  useEffect(() => {
  const tryInitParticles = () => {
    const container = document.getElementById('particles-js');
    if (container && window.particlesJS?.load) {
      window.particlesJS.load(
        'particles-js',
        '/particlesjs-config.json',
        () => console.log('Particles.js loaded on PlayQuizPage')
      );
    } else {
      setTimeout(tryInitParticles, 100); // Подождём, если элемент ещё не в DOM
    }
  };

  tryInitParticles();
}, []);


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

  useEffect(() => {
    if (attemptId) {
      localStorage.setItem(getIndexKey(quizId, attemptId), currentIndex);
    }
  }, [quizId, attemptId, currentIndex]);

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

  function handleSelectAnswer(answerId) {
    setSelectedAnswer(answerId);
  }

  async function submitAnswer(questionId, answerId) {
    if (!attemptId) return;
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

  async function handleNext() {
    if (selectedAnswer === null) return;

    const currentQuestion = questions[currentIndex];
    await submitAnswer(currentQuestion.id, selectedAnswer);
    setSelectedAnswer(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      finishQuiz();
    }
  }

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
  const isLastQuestion = currentIndex === questions.length - 1;

  return (
    <>
    <div id="particles-js" className="particles-bg" />

    <div className="playquizbody">
      <div className="playQuizPageContainer">
        {/* Левый блок: вопрос, фото, ответы, кнопка */}
        <div className="leftSide">
          <div className="questionBlock">
            <h2 className="questionTitle">{currentQuestion.question_text}</h2>
            {currentQuestion.question_image && (
              <div className="photoContainer">
                <img
                  src={currentQuestion.question_image}
                  alt="Question"
                  className="questionImage"
                />
              </div>
            )}
          </div>

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

          <div className="finishButtonWrapper">
          <button
            type="button"
            className="finishButton"
            onClick={handleNext}
            disabled={selectedAnswer === null}
          >
            {isLastQuestion ? 'Finish' : 'Next'}
          </button>
        </div>

        </div>

        {/* Правый блок: прогресс-бар */}
        <div className="progressContainer">
          <span className="progressText">
            {currentIndex + 1}/{questions.length}
          </span>
          <div className="tilesContainer">
            {questions.map((_, index) => {
              let tileClass = 'tile';
              if (index < currentIndex) tileClass += ' tileCompleted';
              else if (index === currentIndex) tileClass += ' tileCurrent';
              return <div key={index} className={tileClass} />;
            })}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

export default PlayQuizPage;
