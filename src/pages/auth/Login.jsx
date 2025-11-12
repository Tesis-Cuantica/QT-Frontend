import { useForm } from "react-hook-form";
import api from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";

export default function Login() {
  const { register, handleSubmit } = useForm();
  const { login, user, init, loading } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (user?.role === "ADMIN") navigate("/admin", { replace: true });
    if (user?.role === "PROFESSOR") navigate("/professor", { replace: true });
    if (user?.role === "STUDENT") navigate("/student", { replace: true });
  }, [user, navigate]);

  const onSubmit = async (values) => {
    const res = await login(api, values);
    if (res.ok) {
      const from = location.state?.from?.pathname;
      if (from) return navigate(from, { replace: true });
      // Redirección por rol
      const role = useAuthStore.getState().user.role;
      if (role === "ADMIN") return navigate("/admin", { replace: true });
      if (role === "PROFESSOR")
        return navigate("/professor", { replace: true });
      if (role === "STUDENT") return navigate("/student", { replace: true });
    } else {
      alert(res.message || "Error al iniciar sesión");
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-sm">Email</label>
        <input
          className="mt-1 w-full rounded-lg bg-transparent border border-qt-border p-2"
          type="email"
          placeholder="correo@ejemplo.com"
          {...register("email", { required: true })}
        />
      </div>
      <div>
        <label className="text-sm">Contraseña</label>
        <input
          className="mt-1 w-full rounded-lg bg-transparent border border-qt-border p-2"
          type="password"
          placeholder="********"
          {...register("password", { required: true })}
        />
      </div>
      <button
        disabled={loading}
        className="w-full rounded-lg bg-qt-primary hover:opacity-90 transition p-2 font-semibold"
      >
        {loading ? "Ingresando..." : "Ingresar"}
      </button>
      <p className="text-center text-sm text-qt-muted">
        ¿No tienes cuenta?{" "}
        <a className="text-qt-accent" href="/register">
          Regístrate
        </a>
      </p>
    </form>
  );
}
