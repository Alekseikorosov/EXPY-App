import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/axiosInstance';
import Header from '../components/Header';
import '../styles/CreateQuizPage.css';

function EditQuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();

  // Состояния для квиза
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [cover, setCover] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

  // Состояния для модального окна выбора обложки
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [tempCoverUrl, setTempCoverUrl] = useState('');
  const [tempCoverFile, setTempCoverFile] = useState(null);

  // Загружаем категории
  useEffect(() => {
    api.get('/categories')
      .then(res => setCategories(res.data))
      .catch(err => console.error('Ошибка при загрузке категорий:', err));
  }, []);

  // Загружаем данные квиза для редактирования с проверкой прав
  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('accessToken');
    // Используем параметр mode=edit для запроса, чтобы сервер проверял права
    api.get(`/quizzes/${quizId}?mode=edit`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => {
        const data = res.data;
        setTitle(data.title);
        setCover(data.cover);
        setCategoryId(data.category_id);
        setQuestions(
          data.questions.length ? data.questions : [{
            question_text: '',
            question_image: '',
            answers: [
              { answer_text: '', is_correct: false },
              { answer_text: '', is_correct: false },
              { answer_text: '', is_correct: false },
              { answer_text: '', is_correct: false },
            ],
          }]
        );
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        navigate('/');
      });
      
  }, [quizId, navigate]);

  // Функции для управления вопросами
  const addQuestion = () => {
    if (questions.length >= 30) {
      setMessage('Максимум 30 вопросов!');
      return;
    }
    setQuestions(prev => [
      ...prev,
      {
        question_text: '',
        question_image: '',
        answers: [
          { answer_text: '', is_correct: false },
          { answer_text: '', is_correct: false },
          { answer_text: '', is_correct: false },
          { answer_text: '', is_correct: false },
        ],
      },
    ]);
    setSelectedQuestionIndex(questions.length);
  };

  const deleteSelectedQuestion = () => {
    if (questions.length <= 1) {
      setMessage('Нельзя удалить последний вопрос!');
      return;
    }
    const newArr = [...questions];
    newArr.splice(selectedQuestionIndex, 1);
    setQuestions(newArr);
    setSelectedQuestionIndex(Math.max(0, selectedQuestionIndex - 1));
  };

  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleQuestionTextChange = (val) => {
    const updated = [...questions];
    updated[selectedQuestionIndex].question_text = val;
    setQuestions(updated);
  };
  const handleQuestionImageChange = (val) => {
    const updated = [...questions];
    updated[selectedQuestionIndex].question_image = val;
    setQuestions(updated);
  };
  const handleAnswerChange = (answerIndex, field, value) => {
    const updated = [...questions];
    if (field === 'answer_text') {
      updated[selectedQuestionIndex].answers[answerIndex].answer_text = value;
    } else if (field === 'is_correct') {
      if (value === true) {
        const correctCount = updated[selectedQuestionIndex].answers.reduce(
          (acc, ans) => acc + (ans.is_correct ? 1 : 0), 0
        );
        if (correctCount >= 2) {
          setMessage('Нельзя выбрать более 2 правильных ответов!');
          return;
        }
        updated[selectedQuestionIndex].answers[answerIndex].is_correct = true;
      } else {
        updated[selectedQuestionIndex].answers[answerIndex].is_correct = false;
      }
    }
    setQuestions(updated);
  };

  // Модальное окно для выбора обложки
  const openCoverModal = () => {
    setTempCoverUrl(cover);
    setTempCoverFile(null);
    setIsCoverModalOpen(true);
  };
  const closeCoverModal = () => {
    setIsCoverModalOpen(false);
    setTempCoverUrl('');
    setTempCoverFile(null);
  };
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setTempCoverFile(e.target.files[0]);
    }
  };
  const applyCover = () => {
    if (tempCoverFile) {
      const fileUrl = URL.createObjectURL(tempCoverFile);
      setCover(fileUrl);
    } else {
      setCover(tempCoverUrl.trim());
    }
    closeCoverModal();
  };

  // Отправка обновлённых данных квиза
  const handleFinish = async () => {
    setMessage('');
    if (!title.trim() || !cover.trim() || !categoryId) {
      setMessage('Название квиза, обложка и категория обязательны!');
      return;
    }
    if (questions.length < 5) {
      setMessage('Минимум 5 вопросов!');
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim()) {
        setMessage(`Вопрос №${i + 1} пустой!`);
        return;
      }
      if (q.answers.length !== 4) {
        setMessage(`Вопрос №${i + 1} — не ровно 4 ответа!`);
        return;
      }
      const correctCount = q.answers.reduce((acc, ans) => acc + (ans.is_correct ? 1 : 0), 0);
      if (correctCount < 1 || correctCount > 2) {
        setMessage(`В вопросе №${i + 1} должно быть от 1 до 2 правильных ответов!`);
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!q.answers[j].answer_text.trim()) {
          setMessage(`У вопроса №${i + 1} вариант №${j + 1} пуст!`);
          return;
        }
      }
    }
    try {
      const token = localStorage.getItem('accessToken');
      await api.put(`/quizzes/${quizId}`, {
        title,
        cover,
        category_id: categoryId,
        questions,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Quiz has been successfully updated!');
      navigate('/profile');
    } catch (err) {
      console.error('Ошибка при обновлении квиза:', err);
      setMessage(err.response?.data?.error || 'Ошибка обновления квиза');
    }
  };

  // Рендер мини-превью вопросов
  const renderQuestionPreview = (question, index) => {
    const shortText = question.question_text
      ? question.question_text.slice(0, 15) + (question.question_text.length > 15 ? '...' : '')
      : 'No text';
    const correctCount = question.answers.reduce((acc, ans) => acc + (ans.is_correct ? 1 : 0), 0);
    return (
      <div
        key={index}
        className={`question-preview ${index === selectedQuestionIndex ? 'active' : ''}`}
        onClick={() => setSelectedQuestionIndex(index)}
      >
        <div><strong>Q{index + 1}</strong> — {shortText}</div>
        {question.question_image && (
          <div style={{ fontSize: '12px', color: '#888' }}>[Image]</div>
        )}
        <div style={{ fontSize: '12px', color: '#555' }}>
          {correctCount} правильных
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="create-quiz-page">
        <Header />
        <p style={{ textAlign: 'center' }}>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="create-quiz-page">
      <Header />

      {message && <p className="message">{message}</p>}

      <div className="quiz-creation-container">
        {/* Сайдбар слева */}
        <div className="quiz-sidebar">
          <h3>Questions</h3>
          <div className="questions-list">
            {questions.map((q, i) => renderQuestionPreview(q, i))}
          </div>
          <div className="sidebar-buttons">
            <button onClick={addQuestion}>+ Add Question</button>
            <button onClick={deleteSelectedQuestion}>Delete Selected</button>
            <button onClick={() => navigate(-1)}>Cancel</button>
            <button onClick={handleFinish}>Save Changes</button>
          </div>
        </div>

        {/* Основная часть справа */}
        <div className="quiz-editor">
          <div className="quiz-global-fields">
            <h2>Quiz Settings</h2>
            <label>Title:</label>
            <input 
              type="text"
              value={title}
              onChange={handleTitleChange}
            />
            <label>Cover:</label>
            <button 
              type="button"
              onClick={openCoverModal}
              style={{ marginBottom: '0.5rem' }}
            >
              {cover ? 'Change Cover' : 'Select Cover'}
            </button>
            {cover && (
              <div style={{ marginBottom: '1rem' }}>
                <img 
                  src={cover} 
                  alt="Cover Preview" 
                  style={{ maxWidth: '300px', maxHeight: '200px', display: 'block', marginTop: '0.5rem' }}
                />
                <small>{cover.startsWith('blob:') ? 'Local file' : cover}</small>
              </div>
            )}
            <label>Category:</label>
            <select 
              value={categoryId}
              onChange={e => setCategoryId(e.target.value)}
            >
              <option value="">-- Select --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="question-editor">
            <h2>Question #{selectedQuestionIndex + 1}</h2>
            {questions[selectedQuestionIndex] && (
              <>
                <label>Question Text</label>
                <textarea
                  value={questions[selectedQuestionIndex].question_text}
                  onChange={e => handleQuestionTextChange(e.target.value)}
                  style={{ display: 'block', width: '100%', height: '80px' }}
                />
                <label>Question Image (optional)</label>
                <input
                  type="text"
                  value={questions[selectedQuestionIndex].question_image}
                  onChange={e => handleQuestionImageChange(e.target.value)}
                  placeholder="URL for question image"
                  style={{ display: 'block', marginBottom: '0.75rem' }}
                />
                <h4>Answers (4 options, up to 2 correct)</h4>
                {questions[selectedQuestionIndex].answers.map((ans, aIndex) => (
                  <div key={aIndex} style={{ marginBottom: '0.5rem' }}>
                    <label>Option {String.fromCharCode(65 + aIndex)}: </label>
                    <input
                      type="text"
                      value={ans.answer_text}
                      onChange={e => handleAnswerChange(aIndex, 'answer_text', e.target.value)}
                      style={{ width: '200px', marginRight: '1rem' }}
                    />
                    <label style={{ marginLeft: '5px' }}>
                      Correct?
                      <input
                        type="checkbox"
                        checked={ans.is_correct}
                        onChange={e => handleAnswerChange(aIndex, 'is_correct', e.target.checked)}
                        style={{ marginLeft: '5px' }}
                      />
                    </label>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Модальное окно для выбора обложки */}
      {isCoverModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Select Cover</h2>
            <div className="modal-section">
              <h3>1) Enter URL</h3>
              <input
                type="text"
                value={tempCoverUrl}
                onChange={e => setTempCoverUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                style={{ width: '100%' }}
              />
            </div>
            <div className="modal-section">
              <h3>2) Or upload a file</h3>
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange} 
              />
              {tempCoverFile && (
                <p style={{ fontSize: '0.9rem', color: '#333' }}>
                  Selected file: {tempCoverFile.name}
                </p>
              )}
            </div>
            <div style={{ textAlign: 'right', marginTop: '1rem' }}>
              <button onClick={applyCover}>Apply</button>
              <button onClick={closeCoverModal} style={{ marginLeft: '1rem' }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditQuizPage;

