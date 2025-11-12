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
    <>
      <h2 className="text-white text-3xl font-bold text-center mb-8">
        Inicio de Sesión
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Correo electrónico
          </label>
          <input
            className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            type="email"
            placeholder="ejemplo@tecsu.edu.pe"
            {...register("email", { required: true })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Contraseña
          </label>
          <input
            className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            type="password"
            placeholder="••••••"
            {...register("password", { required: true })}
          />
        </div>

        <button
          disabled={loading}
          className="w-full p-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Ingresando..." : "Ingresar"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-400 mt-6">
        ¿No tienes cuenta?{" "}
        <a
          className="font-medium text-purple-400 hover:underline"
          href="/register"
        >
          Regístrate
        </a>
      </p>
    </>
  );
}
