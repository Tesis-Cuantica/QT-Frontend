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
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="text-sm">Nombre</label>
        <input
          className="mt-1 w-full rounded-lg bg-transparent border border-qt-border p-2"
          placeholder="Tu nombre"
          {...reg("name", { required: true })}
        />
      </div>
      <div>
        <label className="text-sm">Email</label>
        <input
          className="mt-1 w-full rounded-lg bg-transparent border border-qt-border p-2"
          type="email"
          placeholder="correo@ejemplo.com"
          {...reg("email", { required: true })}
        />
      </div>
      <div>
        <label className="text-sm">Contraseña</label>
        <input
          className="mt-1 w-full rounded-lg bg-transparent border border-qt-border p-2"
          type="password"
          placeholder="********"
          {...reg("password", { required: true, minLength: 6 })}
        />
      </div>
      <button
        disabled={loading}
        className="w-full rounded-lg bg-qt-primary hover:opacity-90 transition p-2 font-semibold"
      >
        {loading ? "Creando cuenta..." : "Crear cuenta"}
      </button>
      <p className="text-center text-sm text-qt-muted">
        ¿Ya tienes cuenta?{" "}
        <a className="text-qt-accent" href="/login">
          Inicia sesión
        </a>
      </p>
    </form>
  );
}
