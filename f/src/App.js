// src/App.js
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import RequireAuth     from './components/RequireAuth'
import RequireRole     from './components/RequireRole'

import HomePage        from './pages/HomePage'
import LoginPage       from './pages/LoginPage'
import RegisterPage    from './pages/RegisterPage'
import ProfilePage     from './pages/ProfilePage'
import CreateQuizPage  from './pages/CreateQuizPage'
import EditQuizPage    from './pages/EditQuizPage'
import ResetPassPage   from './pages/ResetPassPage'
import PlayQuizPage    from './pages/PlayQuizPage'
import ResultPage      from './pages/ResultPage'
import SessionExpiredPage from './pages/SessionExpiredPage'

import RequireEnergy   from './components/RequireEnergy'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <Router>
      <Routes>
        {/* public */}
        <Route path="/"                         element={<HomePage/>} />
        <Route path="/login"                    element={<LoginPage/>} />
        <Route path="/register"                 element={<RegisterPage/>} />
        <Route path="/resetpass"                element={<ResetPassPage/>} />
        <Route path="/session-expired"          element={<SessionExpiredPage/>} />

        {/* публичная игра/просмотр результата */}
        <Route path="/quiz/:quizId"             element={<PlayQuizPage/>} />
        <Route path="/quiz/:quizId/attempt/:attemptId" element={<PlayQuizPage/>} />
        <Route path="/attempt/:attemptId/result"      element={<ResultPage/>} />

        {/* только для любых аутентифицированных */}
        <Route element={<RequireAuth/>}>
          <Route path="/profile"              element={<ProfilePage/>} />
          {/* <Route path="/create-quiz"          element={<CreateQuizPage/>} /> */}
          <Route path="/create-quiz" element={
            <RequireEnergy>
              <CreateQuizPage/>
            </RequireEnergy>
            }
          />
          <Route path="/edit-quiz/:quizId"    element={<EditQuizPage/>} />
        </Route>

        {/* только для админа */}
        <Route element={<RequireRole allowed="admin"/>}>
          {/* сюда добавьте страницы админ-панели, например: */}
          <Route path="/admin/users"         element={<div>Users management</div>} />
        </Route>
      </Routes>

      <ToastContainer/>
    </Router>
  )
}

export default App
