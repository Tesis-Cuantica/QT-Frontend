import { Navigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";

/**
 * Permite el acceso sólo a los roles especificados
 * @param {string[]} allow
 */
export default function RoleGuard({ allow = [], children }) {
  const { user } = useAuthStore();
  if (!user || !allow.includes(user.role)) {
    // Redirección suave según rol del usuario
    if (user?.role === "ADMIN") return <Navigate to="/admin" replace />;
    if (user?.role === "PROFESSOR") return <Navigate to="/professor" replace />;
    if (user?.role === "STUDENT") return <Navigate to="/student" replace />;
    return <Navigate to="/login" replace />;
  }
  return children;
}
