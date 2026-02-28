import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/shared/Layout';
import Dashboard from './pages/teacher/Dashboard';
import CreateExam from './pages/teacher/CreateExam';
import LiveMonitor from './pages/teacher/LiveMonitor';
import Results from './pages/teacher/Results';
import ExamEntry from './pages/student/ExamEntry';
import ExamInterface from './pages/student/ExamInterface';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/teacher/dashboard" replace />} />

        {/* Teacher Layout Routes */}
        <Route path="/teacher" element={<Layout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="create-exam" element={<CreateExam />} />
          <Route path="monitor/:id" element={<LiveMonitor />} />
          <Route path="results" element={<Results />} />
        </Route>

        {/* Student Routes (No Layout / Fullscreen) */}
        <Route path="/exam/:token" element={<ExamEntry />} />
        <Route path="/exam/:token/start" element={<ExamInterface />} />
      </Routes>
    </Router>
  );
}

export default App;
