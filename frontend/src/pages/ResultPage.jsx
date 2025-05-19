import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import api from '../utils/axiosInstance';
import '../styles/ResultPage.css';
import 'particles.js';

function ResultPage() {
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [resultData, setResultData] = useState(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  const [searchParams] = useSearchParams();
  const hasLoadedResult = useRef(false);


  useEffect(() => {
  const tryInitParticles = () => {
    const container = document.getElementById('particles-js');
    if (container && window.particlesJS?.load) {
      window.particlesJS.load(
        'particles-js',
        '/particlesjs-config.json',
        () => console.log('Particles.js loaded on ResultPage')
      );
    } else {
      setTimeout(tryInitParticles, 100);
    }
  };

  tryInitParticles();
}, []);


  useEffect(() => {
    async function loadResult() {
      if (hasLoadedResult.current) return; // не дергаться дважды
      hasLoadedResult.current = true;

      const token = searchParams.get('token');
      try {
        const res = await api.get(`/game/result/${attemptId}`, {
          params: { token }
        });
        setResultData(res.data);
      } catch (error) {
        console.error('loadResult error:', error);
        // если нет доступа — вернуть на главную
        if (error.response?.status === 403) {
          navigate('/', { replace: true });
        }
      }
    }

    loadResult();
  }, [attemptId, searchParams, navigate]);

  const handleLeave = () => {
    navigate('/', { replace: true });
  };

  const handleAgain = () => {
    if (!resultData) return;
    navigate(`/quiz/${resultData.quizId}`, { replace: true });
  };

  // определяем CSS‑класс для боковой навигации
  const getNavClass = (question) => {
    const chosen = question.answers.find(a => a.chosen);
    if (!chosen) return '';
    return chosen.is_correct ? 'nav-correct' : 'nav-incorrect';
  };

  if (!resultData) {
    return <div>Loading result...</div>;
  }

        const { details, final_score } = resultData;
        const current = details[selectedQuestionIndex];

        return (
          <>
          <div id="particles-js" className="particles-bg" />
          <div className="result-container">
            <h2 className="result-title">Quiz Completed!</h2>
      <div className="result-progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${(final_score / details.length) * 100}%` }}
        />
        <span className="progress-text">
          {final_score} / {details.length}
        </span>
      </div>

      <div className="result-content">
        <div className="questions-nav-wrapper">
          <div className="questions-nav">
            {details.map((q, i) => (
              <div
                key={q.question_id}
                className={`nav-item ${getNavClass(q)} ${i === selectedQuestionIndex ? 'selected' : ''}`}
                onClick={() => setSelectedQuestionIndex(i)}
              >
                {i + 1}
              </div>
            ))}
          </div>
        </div>


        <div className="question-detail">
          <h3 className="question-text">{current.question_text}</h3>
          {current.question_image && (
            <img src={current.question_image} alt="" className="question-image" />
          )}
          <div className="answers-list">
            {current.answers.map(ans => {
              const correct = ans.is_correct ? 'correct-answer' : '';
              const wrong = ans.chosen && !ans.is_correct ? 'user-answer' : '';
              return (
                <div key={ans.id} className={`answer-item ${correct} ${wrong}`}>
                  {ans.answer_text}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="result-actions">
        <button className="leave-button" onClick={handleLeave}>
          Leave
        </button>
        <button className="again-button" onClick={handleAgain}>
          Again
        </button>
      </div>
    </div>
    </>
  );
}

export default ResultPage;
