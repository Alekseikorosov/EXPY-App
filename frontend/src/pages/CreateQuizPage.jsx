// export default CreateQuizPage;
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import api from '../utils/axiosInstance';
import Header from '../components/Header';
import '../styles/CreateQuizPage.css';
import CategoriesInCreate from '../components/CategoriesInCreate'; 
import 'particles.js';

const DRAFT_KEY     = 'createQuizDraft';    // ключ черновика в localStorage

function debounce(fn, delay = 400) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), delay);
  };
}

// восстанавливаем массив вопросов по умолчанию
function emptyQuestion() {
  return {
    question_text  : '',
    question_image : '',
    // File‑поля не сериализуем — они не попадают в JSON
    answers: Array.from({ length: 4 }, () => ({ answer_text: '', is_correct: false }))
  };
}

function CreateQuizPage() {
  const navigate = useNavigate();
  // Состояния для квиза
  const [title, setTitle] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [setCategories] = useState([]);
  const [questions, setQuestions] = useState([
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
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState(0);
  // const [message, setMessage] = useState('');


  // Состояния для модального окна выбора обложки
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);
  const [coverUrl, setCoverUrl] = useState('');
  const [coverFile, setCoverFile] = useState(null);
  const [tempCoverUrl, setTempCoverUrl] = useState('');
  const [tempCoverFile, setTempCoverFile] = useState(null);

  // Состояния для модального окна выбора картинки вопроса
  const [isQuestionImageModalOpen, setIsQuestionImageModalOpen] = useState(false);
  const [selectedQuestionForImage, setSelectedQuestionForImage] = useState(null);
  const [tempQuestionImageUrl, setTempQuestionImageUrl] = useState('');
  const [tempQuestionImageFile, setTempQuestionImageFile] = useState(null);

  // состояние и колбэки модалки выбора категории
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const openCategoryModal  = () => setIsCategoryModalOpen(true);
  const closeCategoryModal = () => setIsCategoryModalOpen(false);
  const handleAddCategories = cats => setSelectedCategories(cats);

  // Максимальный размер файла — 5 МБ
  const MAX_FILE_SIZE = 5 * 1024 * 1024;


  // Состояния для drag and drop вопросов
  const [dragging, setDragging] = useState(false);
  const [dragIndex, setDragIndex] = useState(null);
  const pressTimerRef = useRef(null);


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

  // Проверяет, что строка — валидный URL и имеет «изображенческое» расширение
function isValidImageUrl(url) {
  try {
    new URL(url);
  } catch {
    return false;
  }
  return /\.(jpe?g|png|bmp|webp)(\?.*)?$/i.test(url);
}


  // Восстанавливаем сохранённое состояние формы из localStorage (если есть)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (!saved) return;
      const draft = JSON.parse(saved);

      setTitle(draft.title ?? '');
      setCoverUrl(draft.coverUrl ?? '');
      setSelectedCategories(draft.selectedCategories ?? []);
      setQuestions(draft.questions?.length ? draft.questions : [ emptyQuestion() ]);
      setSelectedQuestionIndex(draft.selectedQuestionIndex ?? 0);
    } catch (err) {
      console.warn('[CreateQuiz] corrupted draft — clearing', err);
      localStorage.removeItem(DRAFT_KEY);
    }
  }, []);

  const saveDraftRef = useRef(null);
  if (!saveDraftRef.current) {
    saveDraftRef.current = debounce((draft) => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
      } catch (err) {
        console.error('[CreateQuiz] unable to save draft:', err);
      }
    });
  }

  // Сохраняем состояние формы в localStorage при его изменении
  useEffect(() => {
    saveDraftRef.current({ title, coverUrl, selectedCategories, questions, selectedQuestionIndex });
  }, [title, coverUrl, selectedCategories, questions, selectedQuestionIndex]);
  
  const clearDraft = useCallback(() => localStorage.removeItem(DRAFT_KEY), []);

  // Логика для вопросов
  const addQuestion = () => {
    if (questions.length >= 30) {
      toast.error('Maximum 30 questions!');
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
      toast.error('The last question cannot be deleted!');
      return;
    }
    const newArr = [...questions];
    newArr.splice(selectedQuestionIndex, 1);
    setQuestions(newArr);
    setSelectedQuestionIndex(Math.max(0, selectedQuestionIndex - 1));
  };

  const cancelCreation = () => {
    clearDraft();
    navigate('/');
  };

  // Рендер мини-превью вопросов с поддержкой drag-and-drop
  const renderQuestionPreview = (question, index) => {
    const shortText = question.question_text
      ? question.question_text.slice(0, 15) + (question.question_text.length > 15 ? '...' : '')
      : 'No text';
    const correctCount = question.answers.reduce((sum, a) => sum + (a.is_correct ? 1 : 0), 0);

    const handleMouseDown = () => {
      pressTimerRef.current = setTimeout(() => {
        setDragging(true);
        setDragIndex(index);
      }, 500);
    };
    const handleMouseUpOrLeave = () => clearTimeout(pressTimerRef.current);
    const handleDragStart = e => { setDragIndex(index); e.dataTransfer.effectAllowed = 'move'; };
    const handleDragOver = e => e.preventDefault();
    const handleDrop = e => {
      e.preventDefault();
      if (dragIndex === null || dragIndex === index) return;
      setQuestions(prev => {
        const arr = [...prev];
        const [moved] = arr.splice(dragIndex, 1);
        arr.splice(index, 0, moved);
        return arr;
      });
      setDragging(false);
      setDragIndex(null);
    };
    const handleDragEnd = () => { setDragging(false); setDragIndex(null); };

    return (
      <div
        key={index}
        className={`question-preview ${index === selectedQuestionIndex ? 'active' : ''}`}
        onClick={() => !dragging && setSelectedQuestionIndex(index)}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        draggable={dragging}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onDragEnd={handleDragEnd}
      >
        <div><strong>Q{index + 1}</strong> - {shortText}</div>
        {question.question_image && <div className="image-indicator"></div>}
        <div className="correct-count">{correctCount} correct</div>
      </div>
    );
  };

  // Обработка глобальных полей
  const handleTitleChange = (e) => setTitle(e.target.value);

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
  const saveCover = () => {
    if (tempCoverFile) {
      setCoverFile(tempCoverFile);
      setCoverUrl('');
    } else {
      setCoverUrl(tempCoverUrl.trim());
      setCoverFile(null);
    }
    closeCoverModal();
  };

  const handleCoverFileChange = e => { if(e.target.files?.[0]) { setTempCoverFile(e.target.files[0]); setTempCoverUrl(''); } };

  // Модалка изображения вопроса
  const openQuestionImageModal = index => {
    setSelectedQuestionForImage(index);
    const q = questions[index];
    setTempQuestionImageUrl(q.question_image || '');
    setTempQuestionImageFile(null);           // сбрасываем файл
    setIsQuestionImageModalOpen(true);
  };

  const handleTempQuestionImageUrlChange = e => {
     setTempQuestionImageUrl(e.target.value);
     if (tempQuestionImageFile) setTempQuestionImageFile(null); // если ввели URL – убираем файл
    };
  
  const closeQuestionImageModal = () => { setIsQuestionImageModalOpen(false); setTempQuestionImageUrl(''); setTempQuestionImageFile(null); setSelectedQuestionForImage(null); };
  const handleQuestionImageFileChange = e => {
    if (e.target.files?.[0]) {
      setTempQuestionImageFile(e.target.files[0]);
      setTempQuestionImageUrl('');
    }
  };
  const applyQuestionImage = () => {
    setQuestions(prev =>
      prev.map((q, idx) => {
        if (idx !== selectedQuestionForImage) return q;
        if (tempQuestionImageFile) {
          return {
            ...q,
            questionFile: tempQuestionImageFile,
            question_image: ''
          };
        }
        return {
          ...q,
          question_image: tempQuestionImageUrl.trim(),
          questionFile: null
        };
      })
    );
    closeQuestionImageModal();
  };

  // const coverButtonLabel = () => {
  //   if (coverFile) return 'Change File';
  //   if (coverUrl) return 'Change URL';
  //   return 'Select Cover';
  // };
  // Редактирование вопросов
  const handleQuestionTextChange = (val) => {
    const updated = [...questions];
    updated[selectedQuestionIndex].question_text = val;
    setQuestions(updated);
  };
  // const handleQuestionImageChange = (val) => {
  //   const updated = [...questions];
  //   updated[selectedQuestionIndex].question_image = val;
  //   setQuestions(updated);
  // };
  const handleAnswerChange = (answerIndex, field, value) => {
    const updated = [...questions];
    if (field === 'answer_text') {
      updated[selectedQuestionIndex].answers[answerIndex].answer_text = value;
    } else if (field === 'is_correct') {
      if (value === true) {
        const correctCount = updated[selectedQuestionIndex].answers.reduce(
          (acc, ans) => acc + (ans.is_correct ? 1 : 0),
          0
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

  // Отправка данных квиза (создание)
  const handleFinish = async () => {
    // Сбрасываем предыдущее сообщение об ошибке
    // setMessage('');

     if (!coverUrl && !coverFile) {
         toast.error('Need a cover: Upload a file or provide a URL');
         return;
       }
       if (selectedCategories.length === 0) {
        toast.error('Please, choose category');
        return;
      }
      
    // Валидация: title, cover (URL или файл) и категория обязательны
    if (!title.trim() || (!coverUrl.trim() && !coverFile) || selectedCategories.length === 0) {
        toast.error('Quiz title, cover and category are required');
       }
  
    // Валидация: минимум 5 вопросов
     if (questions.length < 5) {
      toast.error('Minimum 5 questions!');
      return;
    }
  
    // Валидация каждого вопроса
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question_text.trim()) {
        toast.error(`Question №${i + 1} is empty`);
        return;
      }
      if (q.answers.length !== 4) {
        toast.error(`Question №${i + 1}- not exactly 4 answers`);
        return;
      }
      const correctCount = q.answers.reduce((acc, ans) => acc + (ans.is_correct ? 1 : 0), 0);
      if (correctCount < 1 || correctCount > 2) {
        toast.error(`Question №${i + 1} must have 1 to 2 correct answers`);
        return;
      }
      for (let j = 0; j < 4; j++) {
        if (!q.answers[j].answer_text.trim()) {
          toast.error(`For question №${i + 1}, option №${j + 1} is empty!`);
          return;
        }
      }
    }

     if (coverUrl && !isValidImageUrl(coverUrl)) {
        toast.error('Обложка должна быть ссылкой на изображение JPG, PNG, BMP или WEBP');
        return;
      }

        if (coverFile && coverFile.size > MAX_FILE_SIZE) {
           toast.error('The cover file must not exceed 5 MB.');
           return;
         }

    for (let idx = 0; idx < questions.length; idx++) {
      const q = questions[idx];
      if (q.question_image && !isValidImageUrl(q.question_image)) {
        toast.error(`Question #${idx+1}: the link should lead to an image`);
        return;
      }
      if (q.questionFile && q.questionFile.size > MAX_FILE_SIZE) {
        toast.error(`Question #${idx+1}: the file must not exceed 5 MB`);
        return;
      }
    }
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('category_id', selectedCategories[0].id);
    const questionsForServer = questions.map(({ question_text, question_image, answers }) => ({
            question_text,
            question_image,
            answers,
          }));
          formData.append('questions', JSON.stringify(questionsForServer));
  
      // отправляем либо файл, либо URL
    if (coverFile) {
        formData.append('cover', coverFile);
       } else {
        formData.append('cover', coverUrl);
       }

    questions.forEach((q, idx) => {
      if (q.questionFile) {
        formData.append('questionImages', q.questionFile);
        formData.append('questionIndexes', idx);
      }
    });
  
    try {
      const token = localStorage.getItem('accessToken');
       await api.post('/quizzes', formData, {
           headers: { Authorization: `Bearer ${token}` }
         });
      toast.success('Quiz successfully created!');
      clearDraft();
      navigate('/profile');
    } catch (err) {
      console.error('Error creating quiz:', err);
      toast.error(err.response?.data?.error || 'Quiz creation error');
    }
  };
  

  return (
    <>
    <div id="particles-js" className="particles-bg" />
    <div className="create-quiz-page">
      <Header />
      {/* {message && <p className="message">{message}</p>} */}
      <div className="quiz-creation-container">
        {/* Sidebar */}
        <div className="quiz-sidebar">
          <h3>Questions</h3>
          <div className="questions-list">{questions.map(renderQuestionPreview)}</div>
          <div className="sidebar-buttons">
            <button onClick={addQuestion}>+ Add Question</button>
            <button onClick={deleteSelectedQuestion}>Delete Selected</button>
            <button onClick={cancelCreation}>Cancel</button>
            <button onClick={handleFinish}>Finish</button>
          </div>
        </div>
        {/* Editor */}
        <div className="quiz-editor">
          <div className="quiz-global-fields">
            <h2>Quiz Settings</h2>
            <label>Title:</label>
            <div className="field-with-counter-title">
              <input type="text" value={title} onChange={handleTitleChange} maxLength={50}/>
              <span className="char-counter">{title.length}/50</span>
            </div>
            <label>Category:</label>
            <button type="button"
                    onClick={openCategoryModal}
                    className="category-button">
              {selectedCategories.length
                ? selectedCategories.map(c => c.name).join(', ')
                : 'Select Category'}
            </button>
            <div className="form-group">
              <label>Cover Image</label>
               <div className="cover-container">
              {coverUrl || coverFile ? (
                <div className="cover-wrapper">
                  <img
                    src={coverUrl || URL.createObjectURL(coverFile)}
                    alt="Cover"
                    className="cover-img"
                  />
                  <button
                    type="button"
                    className="cover-change-btn"
                    onClick={openCoverModal}
                  >
                    Change Cover
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="cover-select-btn"
                  onClick={openCoverModal}
                >
                  Select Cover
                </button>
              )}
            </div>
            </div>
          </div>
          <div className="question-editor">
            <h2>Question #{selectedQuestionIndex+1}</h2>
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
                <button type="button" onClick={()=>openQuestionImageModal(selectedQuestionIndex)}>{questions[selectedQuestionIndex].questionFile||questions[selectedQuestionIndex].question_image? 'Change Image':'Select Image'}</button>
                {(questions[selectedQuestionIndex].questionFile||questions[selectedQuestionIndex].question_image) && <div className="cover-preview">{questions[selectedQuestionIndex].questionFile?<img src={URL.createObjectURL(questions[selectedQuestionIndex].questionFile)} alt="question preview" style={{maxWidth:'100px'}}/>:<img src={questions[selectedQuestionIndex].question_image} alt="question preview" style={{maxWidth:'100px'}}/>}</div>}
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
              <input type="text" value={tempCoverUrl} onChange={e=>setTempCoverUrl(e.target.value)} placeholder="https://example.com/image.png" disabled={!!tempCoverFile} />
            </div>
            <div className="modal-group">
              <label>2) Or Upload File</label>
              <input type="file" accept="image/*" onChange={handleCoverFileChange} />
              {tempCoverFile && <p>{tempCoverFile.name}</p>}
            </div>
            <div className="modal-actions">
              <button className="btn btn-success" onClick={saveCover}>Save</button>
              <button className="btn btn-secondary" onClick={closeCoverModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Question Image Modal */}
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
              <button className="btn btn-success" onClick={applyQuestionImage}>Save</button>
              <button className="btn btn-secondary" onClick={closeQuestionImageModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  );
}

export default CreateQuizPage;
