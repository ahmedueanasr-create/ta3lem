import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import WhatsAppFloat from './components/WhatsAppFloat';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import NotFound from './pages/NotFound';
import TeacherOnboarding from './pages/TeacherOnboarding';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Wallet = lazy(() => import('./pages/Wallet'));
const LiveRoom = lazy(() => import('./pages/LiveRoom'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Profile = lazy(() => import('./pages/Profile'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminTeachers = lazy(() => import('./pages/admin/AdminTeachers'));
const AdminSubjects = lazy(() => import('./pages/admin/AdminSubjects'));
const AdminSessions = lazy(() => import('./pages/admin/AdminSessions'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));
const AdminWhatsApp = lazy(() => import('./pages/admin/AdminWhatsApp'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const TeacherSessions = lazy(() => import('./pages/teacher/TeacherSessions'));
const TeacherCreateSession = lazy(() => import('./pages/teacher/TeacherCreateSession'));
const TeacherHomework = lazy(() => import('./pages/teacher/TeacherHomework'));
const TeacherExams = lazy(() => import('./pages/teacher/TeacherExams'));
const TeacherEarnings = lazy(() => import('./pages/teacher/TeacherEarnings'));
const TeacherCourses = lazy(() => import('./pages/teacher/TeacherCourses'));
const TeacherProfilePage = lazy(() => import('./pages/teacher/TeacherProfile'));
const SessionDetail = lazy(() => import('./pages/teacher/SessionDetail'));
const StudentSessions = lazy(() => import('./pages/student/StudentSessions'));
const StudentRecordings = lazy(() => import('./pages/student/StudentRecordings'));
const StudentExams = lazy(() => import('./pages/student/StudentExams'));
const StudentHomework = lazy(() => import('./pages/student/StudentHomework'));
const ExamHistory = lazy(() => import('./pages/student/ExamHistory'));
const SupervisorStudents = lazy(() => import('./pages/supervisor/SupervisorStudents'));
const AITutor = lazy(() => import('./pages/AITutor'));
const VerifyCertificate = lazy(() => import('./pages/VerifyCertificate'));
const MyCertificates = lazy(() => import('./pages/student/MyCertificates'));
const ParentRegister = lazy(() => import('./pages/parent/ParentRegister'));
const ParentDashboard = lazy(() => import('./pages/parent/ParentDashboard'));
const ParentLinkStudent = lazy(() => import('./pages/parent/ParentLinkStudent'));
const ParentStudentReport = lazy(() => import('./pages/parent/ParentStudentReport'));
const ParentPayments = lazy(() => import('./pages/parent/ParentPayments'));

const ADMIN_ROLES = ['super_admin', 'platform_admin'];
const Protected = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="py-20 text-center">جارٍ التحميل...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role?.name)) return <Navigate to="/dashboard" replace />;
  return children;
};
const L = ({ children }) => <Suspense fallback={<div className="py-20 text-center text-slate-400">جارٍ تحميل الصفحة...</div>}>{children}</Suspense>;

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen">
            <Navbar />
            <WhatsAppFloat />
            <Routes>
              <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/teacher/onboarding" element={<TeacherOnboarding />} />
            <Route path="/parent/register" element={<L><ParentRegister /></L>} />
            <Route path="/verify-certificate/:code" element={<L><VerifyCertificate /></L>} />
            <Route path="/dashboard" element={<Protected><L><Dashboard /></L></Protected>} />
            <Route path="/parent/dashboard" element={<Protected roles={['parent']}><L><ParentDashboard /></L></Protected>} />
            <Route path="/parent/link-student" element={<Protected roles={['parent']}><L><ParentLinkStudent /></L></Protected>} />
            <Route path="/parent/students/:studentId/report" element={<Protected roles={['parent']}><L><ParentStudentReport /></L></Protected>} />
            <Route path="/parent/payments" element={<Protected roles={['parent']}><L><ParentPayments /></L></Protected>} />
              <Route path="/wallet" element={<Protected><L><Wallet /></L></Protected>} />
              <Route path="/live/:id" element={<Protected><L><LiveRoom /></L></Protected>} />
              <Route path="/notifications" element={<Protected><L><Notifications /></L></Protected>} />
              <Route path="/profile" element={<Protected><L><Profile /></L></Protected>} />
              <Route path="/admin/users" element={<Protected roles={ADMIN_ROLES}><L><AdminUsers /></L></Protected>} />
              <Route path="/admin/teachers" element={<Protected roles={[...ADMIN_ROLES, 'teachers_supervisor']}><L><AdminTeachers /></L></Protected>} />
              <Route path="/admin/subjects" element={<Protected roles={ADMIN_ROLES}><L><AdminSubjects /></L></Protected>} />
              <Route path="/admin/sessions" element={<Protected roles={ADMIN_ROLES}><L><AdminSessions /></L></Protected>} />
              <Route path="/admin/reports" element={<Protected roles={[...ADMIN_ROLES, 'teachers_supervisor', 'student_supervisor']}><L><AdminReports /></L></Protected>} />
              <Route path="/admin/whatsapp" element={<Protected roles={[...ADMIN_ROLES, 'teachers_supervisor', 'student_supervisor']}><L><AdminWhatsApp /></L></Protected>} />
            <Route path="/admin/settings" element={<Protected roles={ADMIN_ROLES}><L><AdminSettings /></L></Protected>} />
              <Route path="/teacher/sessions" element={<Protected roles={['teacher', ...ADMIN_ROLES]}><L><TeacherSessions /></L></Protected>} />
              <Route path="/teacher/create" element={<Protected roles={['teacher', ...ADMIN_ROLES]}><L><TeacherCreateSession /></L></Protected>} />
              <Route path="/teacher/homework" element={<Protected roles={['teacher', ...ADMIN_ROLES]}><L><TeacherHomework /></L></Protected>} />
              <Route path="/teacher/exams" element={<Protected roles={['teacher', ...ADMIN_ROLES]}><L><TeacherExams /></L></Protected>} />
              <Route path="/teacher/earnings" element={<Protected roles={['teacher', ...ADMIN_ROLES]}><L><TeacherEarnings /></L></Protected>} />
              <Route path="/teacher/courses" element={<Protected roles={['teacher', ...ADMIN_ROLES]}><L><TeacherCourses /></L></Protected>} />
              <Route path="/teacher/profile" element={<Protected roles={['teacher', ...ADMIN_ROLES]}><L><TeacherProfilePage /></L></Protected>} />
              <Route path="/teacher/session/:id" element={<Protected roles={['teacher', ...ADMIN_ROLES]}><L><SessionDetail /></L></Protected>} />
              <Route path="/student/sessions" element={<Protected roles={['student', ...ADMIN_ROLES]}><L><StudentSessions /></L></Protected>} />
              <Route path="/student/recordings" element={<Protected roles={['student', ...ADMIN_ROLES]}><L><StudentRecordings /></L></Protected>} />
              <Route path="/student/exams" element={<Protected roles={['student', ...ADMIN_ROLES]}><L><StudentExams /></L></Protected>} />
              <Route path="/student/exam-history" element={<Protected roles={['student', ...ADMIN_ROLES]}><L><ExamHistory /></L></Protected>} />
              <Route path="/my-certificates" element={<Protected roles={['student', ...ADMIN_ROLES]}><L><MyCertificates /></L></Protected>} />
              <Route path="/student/homework" element={<Protected roles={['student', ...ADMIN_ROLES]}><L><StudentHomework /></L></Protected>} />
              <Route path="/ai/tutor" element={<Protected><L><AITutor /></L></Protected>} />
              <Route path="/supervisor/students" element={<Protected roles={['student_supervisor', ...ADMIN_ROLES]}><L><SupervisorStudents /></L></Protected>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500 dark:border-slate-800">
              © {new Date().getFullYear()} تعليم — منصة تعليمية احترافية
            </footer>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </ErrorBoundary>
  );
}
