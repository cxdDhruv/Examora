import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ExamProvider } from './context/ExamContext'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import TeacherDashboard from './pages/TeacherDashboard'
import StudentDashboard from './pages/StudentDashboard'
import ExamBuilder from './pages/ExamBuilder'
import DocumentUpload from './pages/DocumentUpload'
import TakeExam from './pages/TakeExam'
import Analytics from './pages/Analytics'
import AdminPanel from './pages/AdminPanel'
import JoinExam from './pages/JoinExam'
import PublishedExam from './pages/PublishedExam'

function App() {
  return (
    <ExamProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/teacher" element={<TeacherDashboard />} />
          <Route path="/student" element={<StudentDashboard />} />
          <Route path="/teacher/exam-builder" element={<ExamBuilder />} />
          <Route path="/teacher/upload" element={<DocumentUpload />} />
          <Route path="/teacher/published/:examId" element={<PublishedExam />} />
          <Route path="/student/exam/:id" element={<TakeExam />} />
          <Route path="/join" element={<JoinExam />} />
          <Route path="/join/:code" element={<JoinExam />} />
          <Route path="/teacher/analytics" element={<Analytics />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </Router>
    </ExamProvider>
  )
}

export default App
