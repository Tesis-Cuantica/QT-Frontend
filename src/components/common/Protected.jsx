import { Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";

export default function Protected({ children }) {
  const { user, init } = useAuthStore();
  const location = useLocation();

  useEffect(() => {
    init();
  }, [init]);

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }
  return children;
}
