// src/App.js
import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import RequireAuth     from './components/RequireAuth'
import RequireRole     from './components/RequireRole'
import RequireEnergy   from './components/RequireEnergy';

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

import TwoFaLogin           from './pages/TwoFaLogin';
import AlternativeMethods   from './pages/AlternativeMethods';
import RecoveryCodePage     from './pages/RecoveryCodePage';
import NewRecoveryCodePage  from './pages/NewRecoveryCodePage';
import EmailConfirmationPage from './pages/EmailConfirmationPage';

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App() {
  return (
    <Router>
      <Routes>
        {/* public */}
        <Route path="/"                         element={<HomePage/>} />

        {/* auth flows */}
        <Route path="/login"                    element={<LoginPage/>} />
        <Route path="/register"                 element={<RegisterPage/>} />
        <Route path="/resetpass"                element={<ResetPassPage/>} />
        <Route path="/session-expired"          element={<SessionExpiredPage/>} />

        {/* 2FA and recovery */}
        <Route path="/2fa-login"                element={<TwoFaLogin/>} />
        <Route path="/alternative-methods"      element={<AlternativeMethods/>} />
        <Route path="/recovery-code"            element={<RecoveryCodePage/>} />
        <Route path="/new-recovery-code"        element={<NewRecoveryCodePage/>} />
        <Route path="/email-confirmation"       element={<EmailConfirmationPage/>} />

        {/* public game/result */}
        <Route path="/quiz/:quizId"             element={<PlayQuizPage/>} />
        <Route path="/quiz/:quizId/attempt/:attemptId" element={<PlayQuizPage/>} />
        <Route path="/attempt/:attemptId/result"      element={<ResultPage/>} />

        {/* protected: any authenticated */}
        <Route element={<RequireAuth/>}>
          <Route path="/profile"              element={<ProfilePage/>} />
          <Route path="/create-quiz" element={
            <RequireEnergy>
              <CreateQuizPage/>
            </RequireEnergy>
          } />
          <Route path="/edit-quiz/:quizId"    element={<EditQuizPage/>} />
        </Route>

        {/* admin only */}
        <Route element={<RequireRole allowed="admin"/>}>
          <Route path="/admin/users"         element={<div>Users management</div>} />
        </Route>
      </Routes>
      <ToastContainer/>
    </Router>
  );
}

export default App;
