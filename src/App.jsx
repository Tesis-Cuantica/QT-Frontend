import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import useAuthStore from "./store/useAuthStore";
import { ROLES } from "./utils/roles";

// Auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Layouts
import StudentLayout from "./layouts/StudentLayout";
import ProfessorLayout from "./layouts/ProfessorLayout";
import AdminLayout from "./layouts/AdminLayout";

// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminCourses from "./pages/admin/Courses";

// Student Pages (temporales)
import StudentDashboard from "./pages/student/Dashboard";

// Professor Pages (temporales)
import ProfessorDashboard from "./pages/professor/Dashboard";
import CreateCourse from "./pages/professor/CreateCourse";
import CourseDetail from "./pages/professor/CourseDetail";
import CreateModule from "./pages/professor/CreateModule";
import CreateExam from "./pages/professor/CreateExam";
import PendingGrades from "./pages/professor/PendingGrades";
import GradeAttempt from "./pages/professor/GradeAttempt";
// Protege rutas por rol
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowedRoles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
};

// Redirige según rol al entrar a "/"
const RoleRedirect = () => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  switch (user.role) {
    case ROLES.STUDENT:
      return <Navigate to="/student" replace />;
    case ROLES.PROFESSOR:
      return <Navigate to="/professor" replace />;
    case ROLES.ADMIN:
      return <Navigate to="/admin" replace />;
    default:
      return <Navigate to="/login" replace />;
  }
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas del ADMIN */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="courses" element={<AdminCourses />} />
        </Route>

        {/* Rutas del PROFESSOR (temporal) */}
        <Route path="/professor" element={<ProfessorLayout />}>
          <Route index element={<ProfessorDashboard />} />
          <Route path="courses/new" element={<CreateCourse />} />
          <Route path="courses/:id" element={<CourseDetail />} />
          <Route path="courses/:id/edit" element={<CreateCourse />} />
          <Route path="courses/:id/modules/new" element={<CreateModule />} />
          <Route
            path="courses/:id/modules/:moduleId/exams/new"
            element={<CreateExam />}
          />
          <Route path="pending" element={<PendingGrades />} />
          <Route path="grade/:id" element={<GradeAttempt />} />
        </Route>

        {/* Rutas del STUDENT (temporal) */}
        <Route
          path="/student"
          element={
            <ProtectedRoute allowedRoles={[ROLES.STUDENT]}>
              <StudentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
        </Route>

        {/* Redirección raíz */}
        <Route path="/" element={<RoleRedirect />} />
      </Routes>
    </BrowserRouter>
  );
}
