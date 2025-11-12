import { useForm } from "react-hook-form";
import api from "@/services/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const { register: reg, handleSubmit } = useForm();
  const { register: registerAction, loading } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (values) => {
    const res = await registerAction(api, values);
    if (res.ok) {
      alert("Registro exitoso. Ahora inicia sesión.");
      navigate("/login");
    } else {
      alert(res.message || "Error al registrar");
    }
  };

  return (
    <>
      <h2 className="text-white text-3xl font-bold text-center mb-8">
        Crear Cuenta
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Nombre
          </label>
          <input
            className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            placeholder="Tu nombre"
            {...reg("name", { required: true })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Correo electrónico
          </label>
          <input
            className="w-full p-3 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
            type="email"
            placeholder="correo@ejemplo.com"
            {...reg("email", { required: true })}
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
            {...reg("password", { required: true, minLength: 6 })}
          />
        </div>

        <button
          disabled={loading}
          className="w-full p-3 rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-400 mt-6">
        ¿Ya tienes cuenta?{" "}
        <a
          className="font-medium text-purple-400 hover:underline"
          href="/login"
        >
          Inicia sesión
        </a>
      </p>
    </>
  );
}
