// ⬇️ ESTE ES TU ARCHIVO PRINCIPAL REAL
import { Routes, Route, Navigate } from "react-router-dom";
import AuthLayout from "@/layouts/AuthLayout";
import AdminLayout from "@/layouts/AdminLayout";
import ProfessorLayout from "@/layouts/ProfessorLayout";
import StudentLayout from "@/layouts/StudentLayout";

import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import AdminDashboard from "@/pages/admin/AdminDashboard";
import UsersPage from "@/pages/admin/UsersPage";
import CoursesPage from "@/pages/admin/CoursesPage";
import AdminReportsPage from "@/pages/admin/AdminReportsPage";

import ProfessorDashboard from "@/pages/professor/ProfessorDashboard";
import CourseModulesPage from "@/pages/professor/CourseModulesPage";
import ModuleLessonsPage from "@/pages/professor/ModuleLessonsPage";
import ModuleLabsPage from "@/pages/professor/ModuleLabsPage";
import ModuleExamsPage from "@/pages/professor/ModuleExamsPage";
import ExamDetailPage from "@/pages/professor/ExamDetailPage";
import ModuleAttemptsPage from "@/pages/professor/ModuleAttemptsPage";
import QuantumLabDesigner from "@/pages/professor/QuantumLabDesigner";
import ProfessorReportsPage from "@/pages/professor/ProfessorReportsPage";
import Algoritmos from "@/pages/professor/Algoritmos";

import StudentDashboard from "@/pages/student/StudentDashboard";
import StudentCoursesPage from "@/pages/student/StudentCoursesPage";
import StudentModulesPage from "@/pages/student/StudentModulesPage";
import StudentLessonsPage from "@/pages/student/StudentLessonsPage";
import StudentLabsPage from "@/pages/student/StudentLabsPage";
import StudentExamsPage from "@/pages/student/StudentExamsPage";
import StudentExamDetailPage from "@/pages/student/StudentExamDetailPage";
import StudentAttemptsPage from "@/pages/student/StudentAttemptsPage";
import StudentReportsPage from "@/pages/student/StudentReportsPage";

import NotFound from "@/pages/common/NotFound";
import Protected from "@/components/common/Protected";
import RoleGuard from "@/components/common/RoleGuard";

export default function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      <Route
        path="/admin/*"
        element={
          <Protected>
            <RoleGuard allow={["ADMIN"]}>
              <AdminLayout />
            </RoleGuard>
          </Protected>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="courses" element={<CoursesPage />} />
        <Route path="reports" element={<AdminReportsPage />} />
      </Route>

      <Route
        path="/professor/*"
        element={
          <Protected>
            <RoleGuard allow={["PROFESSOR"]}>
              <ProfessorLayout />
            </RoleGuard>
          </Protected>
        }
      >
        <Route index element={<ProfessorReportsPage />} />
        <Route path="courses" element={<ProfessorDashboard />} />
        <Route
          path="courses/:courseId/modules"
          element={<CourseModulesPage />}
        />
        <Route
          path="modules/:moduleId/lessons"
          element={<ModuleLessonsPage />}
        />
        <Route path="modules/:moduleId/labs" element={<ModuleLabsPage />} />
        <Route path="modules/:moduleId/exams" element={<ModuleExamsPage />} />
        <Route path="exams/:examId" element={<ExamDetailPage />} />
        <Route path="attempts" element={<ModuleAttemptsPage />} />
        <Route path="lab-designer" element={<QuantumLabDesigner />} />
        <Route path="algorithms" element={<Algoritmos />} />
      </Route>

      <Route
        path="/student/*"
        element={
          <Protected>
            <RoleGuard allow={["STUDENT"]}>
              <StudentLayout />
            </RoleGuard>
          </Protected>
        }
      >
        <Route index element={<StudentDashboard />} />
        <Route path="courses" element={<StudentCoursesPage />} />
        <Route
          path="courses/:courseId/modules"
          element={<StudentModulesPage />}
        />
        <Route
          path="modules/:moduleId/lessons"
          element={<StudentLessonsPage />}
        />
        <Route path="modules/:moduleId/labs" element={<StudentLabsPage />} />
        <Route path="modules/:moduleId/exams" element={<StudentExamsPage />} />
        <Route path="exams/:examId" element={<StudentExamDetailPage />} />
        <Route path="attempts" element={<StudentAttemptsPage />} />
        <Route path="reports" element={<StudentReportsPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
