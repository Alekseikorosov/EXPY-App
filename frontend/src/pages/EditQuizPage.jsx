import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/axiosInstance';
import Header from '../components/Header';
import '../styles/CreateQuizPage.css';
import CategoriesInCreate from '../components/CategoriesInCreate';
import 'particles.js';


function EditQuizPage() {
  const { quizId } = useParams();
  const navigate = useNavigate();


  // Состояния для квиза
  const [loading, setLoading] = useState(true);
  // const [message, setMessage] = useState('');
  const [title, setTitle] = useState('');
  const [coverUrl, setCoverUrl] = useState('');
  const [coverFile, setCoverFile] = useState(null);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [quizCategoryId, setQuizCategoryId] = useState(null);
  // колбэки модалки
  const openCategoryModal  = () => setIsCategoryModalOpen(true);
  const closeCategoryModal = () => setIsCategoryModalOpen(false);
  const handleAddCategories = cats => setSelectedCategories(cats);

  const [categories, setCategories] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);

  // Состояния для модального окна выбора обложки
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [tempCoverUrl, setTempCoverUrl] = useState('');
  const [tempCoverFile, setTempCoverFile] = useState(null);

  const [isQuestionImageModalOpen, setIsQuestionImageModalOpen] = useState(false);
  const [tempQuestionImageUrl, setTempQuestionImageUrl] = useState('');
  const [tempQuestionImageFile, setTempQuestionImageFile] = useState(null);
  const [selectedQuestionForImage, setSelectedQuestionForImage] = useState(null); 

  const openQuestionImageModal = (index) => {
    setSelectedQuestionForImage(index);
    const question = questions[index];
    setTempQuestionImageUrl(question.question_image || '');
    setTempQuestionImageFile(null);
    setIsQuestionImageModalOpen(true);
  };

  // Cover URL change
  const handleTempCoverUrlChange = e => {
    setTempCoverUrl(e.target.value);
    if (tempCoverFile) setTempCoverFile(null);   // сброс файла
  };
  
  // Question-image URL change
  const handleTempQuestionImageUrlChange = e => {
    setTempQuestionImageUrl(e.target.value);
    if (tempQuestionImageFile) setTempQuestionImageFile(null); // сброс файла
  };
  
  // Закрытие модального окна
  const closeQuestionImageModal = () => {
    setIsQuestionImageModalOpen(false);
    setTempQuestionImageUrl('');
    setTempQuestionImageFile(null);
  };


  const q = questions[selectedQuestionIndex];
  
  // Обработка выбора файла
  const handleQuestionImageFileChange = e => {
    if (e.target.files?.[0]) {
      setTempQuestionImageFile(e.target.files[0]);
      setTempQuestionImageUrl('');   
    }
  };

  const applyQuestionImage = () => {
    const updatedQuestions = [...questions];
    const selectedQuestion = updatedQuestions[selectedQuestionForImage];
  
    if (tempQuestionImageFile) {
      selectedQuestion.questionFile = tempQuestionImageFile;
      selectedQuestion.question_image = '';
    } else {
      selectedQuestion.question_image = tempQuestionImageUrl.trim();
      selectedQuestion.questionFile = null;
    }
  
    setQuestions(updatedQuestions);
    closeQuestionImageModal();
  };

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  function isValidImageUrl(url) {
    try { new URL(url); }
    catch { return false; }
    return /\.(jpe?g|png|bmp|webp)(\?.*)?$/i.test(url);
  }

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


  // Загружаем категории
  useEffect(() => {
    api.get('/categories/all')
      .then(res => setCategories(res.data))
      .catch(err => console.error('Error loading categories:', err));
  }, []);

  // Загружаем данные квиза для редактирования с проверкой прав
  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem('accessToken');
    api.get(`/quizzes/${quizId}?mode=edit`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        const data = res.data;
        setTitle(data.title);
        setCoverUrl(data.cover);            
        setCoverFile(null);
        setQuizCategoryId(data.category_id);
        setQuestions(data.questions.map(q => ({ ...q, questionFile: null })));
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        navigate('/');
      });
  }, [quizId, navigate]);

      useEffect(() => {
        if (quizCategoryId && categories.length && selectedCategories.length === 0) {
        const catObj = categories.find(c => c.id === quizCategoryId);
          if (catObj) setSelectedCategories([catObj]);
        }
      }, [quizCategoryId, categories]);

  // Функции для управления вопросами
  const addQuestion = () => {
    if (questions.length >= 30) {
      toast.error('Maximum 30 questions');
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
      toast.error('The last question cannot be deleted');
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
          toast.error('You cannot choose more than 2 correct answers');
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
    setTempCoverUrl(coverUrl);
    setTempCoverFile(null);
    setIsCoverModalOpen(true);
 };
  const closeCoverModal = () => {
    setIsCoverModalOpen(false);
    setTempCoverUrl('');
    setTempCoverFile(null);
  };
  const handleFileChange = e => {
    if (e.target.files?.[0]) {
      setTempCoverFile(e.target.files[0]);
      setTempCoverUrl('');           
    }
  };
  
  const applyCover = () => {
    if (tempCoverFile) {
      setCoverFile(tempCoverFile);
      setCoverUrl('');
    } else {
      setCoverUrl(tempCoverUrl.trim());
      setCoverFile(null);
    }
    closeCoverModal();
  };

  // Отправка обновлённых данных квиза
  const handleFinish = async () => {
    // Сброс ошибок
    // setMessage('');
    if (selectedCategories.length === 0) {
     toast.error('[Please, choose category');
     return;
   }
  
    // === 1. Валидация обязательных полей ===
    if (!title.trim() || (!coverUrl.trim() && !coverFile) || selectedCategories.length === 0) {
        toast.error('Quiz title, cover and category are required!');
       }

    // Обложка: если введён текст, проверяем URL, иначе – допустим файл
    if (coverUrl.trim() && !isValidImageUrl(coverUrl.trim()) && !coverFile) {
      toast.error('The cover must be a valid URL image or file.');
      return;
    }
    if (coverFile && coverFile.size > MAX_FILE_SIZE) {
      toast.error('The cover file must not exceed 5 MB.');
      return;
    }
  
    // Количество вопросов
    if (questions.length < 5) {
   toast.error('Minimum 5 questions!');
   return;
 }
  
    // === 2. Валидация каждого вопроса и его изображений/файлов ===
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
  
      // Текст вопроса
      if (!q.question_text.trim()) {
        toast.error(`Question №${i + 1} is empty`);
        return;
      }
  
      // Ответы
      if (q.answers.length !== 4) {
        toast.error(`Question №${i + 1} - not exactly 4 answers`);
        return;
      }
      const correctCount = q.answers.reduce((sum, ans) => sum + (ans.is_correct ? 1 : 0), 0);
      if (correctCount < 1 || correctCount > 2) {
        toast.error(`Question №${i + 1} must have 1 to 2 correct answers`);
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!q.answers[j].answer_text.trim()) {
          toast.error(`Question №${i + 1} option №${j + 1} is empty!`);
          return;
        }
      }
  
      // Изображение вопроса: либо валидный URL, либо файл
      if (q.question_image && !isValidImageUrl(q.question_image) && !q.questionFile) {
        toast.error(`Question №${i + 1}: Invalid image URL`);
        return;
      }
      if (q.questionFile && q.questionFile.size > MAX_FILE_SIZE) {
        toast.error(`Question №${i + 1}: the file must not exceed 5 MB`);
        return;
      }
    }
  
    // === 3. Собираем FormData ===
    const formData = new FormData();
    formData.append('title', title.trim());
    formData.append('category_id', selectedCategories[0].id);
  
    // Обложка: file или URL
    if (coverFile) {
      formData.append('cover', coverFile);
    } else {
      formData.append('cover', coverUrl.trim());  
    }
  
    // JSON-часть вопросов (без File)
    const questionsPayload = questions.map(({ question_id, question_text, question_image, answers }) => ({
      question_id,            // для существующих вопросов
      question_text,
      question_image: question_image || '',
      answers,
    }));
    formData.append('questions', JSON.stringify(questionsPayload));
  
    // Прикладываем файлы вопросов
    questions.forEach((q, idx) => {
      if (q.questionFile) {
        formData.append('questionImages', q.questionFile);
        formData.append('questionIndexes', idx);
      }
    });
  
    // === 4. Отправка запроса ===
    try {
      const token = localStorage.getItem('accessToken');
      await api.put(
        `/quizzes/${quizId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      toast.success('Quiz successful updated!');
      navigate('/profile');
    } catch (err) {
      console.error('Error updating quiz:', err);
      toast.error(
        err.response?.data?.error ||
        err.message ||
        'Failed to update quiz'
      );
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
        <div><strong>Q{index + 1}</strong> - {shortText}</div>
        {question.question_image && (
          <div style={{ fontSize: '12px', color: '#888' }}></div>
        )}
        <div style={{ fontSize: '12px', color: '#555' }}>
          {correctCount} correct
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="create-quiz-page">
        <Header />
        <p style={{ textAlign: 'center' }}>Loading...</p>
      </div>
    );
  }

    return (
      <>
      <div id="particles-js" className="particles-bg" />
      <div className="create-quiz-page">
        <Header />
{/*     
        {message && <p className="message">{message}</p>} */}
    
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
              <div className="field-with-counter-title">
                <input type="text" value={title} onChange={handleTitleChange} maxLength={50}/>
                <span className="char-counter">{title.length}/50</span>
              </div>
              <label>Cover:</label>
              <button
                type="button"
                onClick={openCoverModal}
                style={{
                  display: 'inline-block',
                  padding: '8px 14px',
                  borderRadius: '6px',
                  background: '#2ca192',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  border: 'none',
                  transition: 'background-color .2s',
                  marginBottom: '1rem',
                }}
              >
                {(coverUrl || coverFile) ? 'Change Cover' : 'Select Cover'}
              </button>

              {(coverUrl || coverFile) && (
                <div style={{ marginBottom: '1rem' }}>
                  {coverFile
                    ? (
                      <img
                        src={URL.createObjectURL(coverFile)}
                        alt="Cover Preview"
                        style={{
                          width: '100%',
                          height: '350px',      // подберите нужную вам высоту
                          objectFit: 'cover',
                          display: 'block',
                          borderRadius: '8px'
                        }}
                      />
                    )
                    : (
                      <img
                        src={coverUrl}
                        alt="Cover Preview"
                        style={{
                          width: '100%',
                          height: '350px',
                          objectFit: 'cover',
                          display: 'block',
                          borderRadius: '8px'
                        }}
                      />
                    )
                  }
                  <small>
                    {coverFile ? coverFile.name : coverUrl}
                  </small>
                </div>
              )}
              <label>Category:</label>
              <button
                type="button"
                onClick={openCategoryModal}
                className="category-button"
              >
                {selectedCategories.length
                  ? selectedCategories.map(c => c.name).join(', ')
                  : 'Select Category'}
              </button>
            </div>
    
            <div className="question-editor">
              <h2>Question #{selectedQuestionIndex + 1}</h2>
              {questions[selectedQuestionIndex] && (
                <>
                  <label>Question Text</label>
                  <div className="field-with-counter">
                  <textarea value={questions[selectedQuestionIndex].question_text}
                      onChange={e => handleQuestionTextChange(e.target.value)}
                      style={{display: 'block', width: '100%', height: '80px'}} maxLength={100}/>
                  <span className="char-counter">{questions[selectedQuestionIndex].question_text.length}/100</span>
                </div>
                  <label>Question Image (optional)</label>
                  <button onClick={() => openQuestionImageModal(selectedQuestionIndex)}>
                    {questions[selectedQuestionIndex].question_image ? 'Change Image' : 'Add Image'}
                  </button>
                  {(q.question_image || q.questionFile) && (
                    <div style={{ marginBottom: '1rem' }}>
                      {q.questionFile
                        ? (
                          <img
                            src={URL.createObjectURL(q.questionFile)}
                            alt="Question Preview"
                            style={{
                              width: '100%',
                              height: '350px',      // можно другой размер для вопроса
                              objectFit: 'cover',
                              display: 'block',
                              borderRadius: '8px'
                            }}
                          />
                        )
                        : (
                          <img
                            src={q.question_image}
                            alt="Question Preview"
                            style={{
                              width: '100%',
                              height: '350px',
                              objectFit: 'cover',
                              display: 'block',
                              borderRadius: '8px'
                            }}
                          />
                        )
                      }
                      <small>
                        {q.questionFile ? q.questionFile.name : q.question_image}
                      </small>
                    </div>
                  )}
                  <h4>Answers (4 options, up to 2 correct)</h4>
                  <div className="answers-grid">
                    {questions[selectedQuestionIndex].answers.map((ans, aIndex) => (
                      <div key={aIndex} className="answer-option">
                        <label htmlFor={`answer-${aIndex}`}>Option {String.fromCharCode(65 + aIndex)}</label>
                        <div className="field-with-counter">
                    <input type="text" className="answer-input" value={ans.answer_text}
                           onChange={e => handleAnswerChange(aIndex, 'answer_text', e.target.value)}
                           placeholder={`Enter option ${String.fromCharCode(65 + aIndex)}`} maxLength={50}/>
                    <span className="char-counter">{ans.answer_text.length}/50</span>
                  </div>
                        <button
                          type="button"
                          className={`toggle-correct-btn ${ans.is_correct ? 'active' : ''}`}
                          onClick={() => handleAnswerChange(aIndex, 'is_correct', !ans.is_correct)}
                        >
                          {ans.is_correct ? 'Correct' : 'Mark Correct'}
                        </button>
                      </div>
                    ))}
                  </div>

                </>
              )}
            </div>
          </div>
        </div>

        <CategoriesInCreate
          isOpen={isCategoryModalOpen}
          onClose={closeCategoryModal}
          onAddCategories={handleAddCategories}
          alreadySelected={selectedCategories}
        />

    
        {/* Модальное окно для выбора обложки */}
        {isCoverModalOpen && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>Select Cover</h3>

      <div className="modal-group">
        <label>1) Enter Image URL</label>
        <input
          type="text"
          value={tempCoverUrl}
          onChange={handleTempCoverUrlChange}
          placeholder="https://example.com/image.png"
          disabled={!!tempCoverFile}
        />
      </div>

      <div className="modal-group">
        <label>2) Or Upload File</label>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        {tempCoverFile && <p>{tempCoverFile.name}</p>}
      </div>

      <div className="modal-actions">
        <button className="btn btn-success" onClick={applyCover}>
          Save
        </button>
        <button className="btn btn-secondary" onClick={closeCoverModal}>
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

    
        {/* Модальное окно для выбора изображения вопроса */}
        {isQuestionImageModalOpen && (
  <div className="modal-overlay">
    <div className="modal-content">
      <h3>Select Question Image</h3>

      <div className="modal-group">
        <label>1) Enter Image URL</label>
        <input
          type="text"
          value={tempQuestionImageUrl}
          onChange={handleTempQuestionImageUrlChange}
          placeholder="https://example.com/image.png"
          disabled={!!tempQuestionImageFile}
        />
      </div>

      <div className="modal-group">
        <label>2) Or Upload File</label>
        <input type="file" accept="image/*" onChange={handleQuestionImageFileChange} />
        {tempQuestionImageFile && <p>{tempQuestionImageFile.name}</p>}
      </div>

      <div className="modal-actions">
        <button className="btn btn-success" onClick={applyQuestionImage}>
          Save
        </button>
        <button className="btn btn-secondary" onClick={closeQuestionImageModal}>
          Cancel
        </button>
      </div>
    </div>
  </div>
)}

      </div>
      </>
    );
    
}

export default EditQuizPage;

