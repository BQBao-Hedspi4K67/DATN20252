import { Navigate, Route, Routes } from 'react-router-dom';
import TopNav from './components/TopNav';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import CourseDetailPage from './pages/CourseDetailPage';
import MyLearningPage from './pages/MyLearningPage';
import CertificatesPage from './pages/CertificatesPage';
import AssessmentPage from './pages/AssessmentPage';
import InstructorStudioPage from './pages/InstructorStudioPage';
import AdminConsolePage from './pages/AdminConsolePage';

export default function App() {
  return (
    <>
      <TopNav />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/courses/:slug" element={<CourseDetailPage />} />

        <Route
          path="/student/learning"
          element={<ProtectedRoute roles={['student', 'admin', 'instructor']}><MyLearningPage /></ProtectedRoute>}
        />
        <Route
          path="/student/certificates"
          element={<ProtectedRoute roles={['student']}><CertificatesPage /></ProtectedRoute>}
        />
        <Route
          path="/student/assessments/:assessmentId"
          element={<ProtectedRoute roles={['student']}><AssessmentPage /></ProtectedRoute>}
        />

        <Route
          path="/instructor/studio"
          element={<ProtectedRoute roles={['instructor', 'admin']}><InstructorStudioPage /></ProtectedRoute>}
        />
        <Route
          path="/admin/console"
          element={<ProtectedRoute roles={['admin']}><AdminConsolePage /></ProtectedRoute>}
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
