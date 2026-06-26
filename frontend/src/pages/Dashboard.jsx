import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminDashboard from './admin/AdminDashboard';
import TeacherDashboard from './teacher/TeacherDashboard';
import StudentDashboard from './student/StudentDashboard';

export default function Dashboard() {
  const { user } = useAuth();
  const role = user?.role?.name;

  if (role === 'parent') return <Navigate to="/parent/dashboard" replace />;
  if (role === 'super_admin' || role === 'platform_admin' || role === 'teachers_supervisor' || role === 'student_supervisor') {
    return <AdminDashboard />;
  }
  if (role === 'teacher') return <TeacherDashboard />;
  return <StudentDashboard />;
}
