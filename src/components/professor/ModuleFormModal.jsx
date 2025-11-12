import { useForm } from "react-hook-form";
import { X, Save } from "lucide-react";
import api from "@/services/api";
import { useState } from "react";

export default function ModuleFormModal({
  courseId,
  module,
  onClose,
  onSuccess,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: module || { title: "", order: "" },
  });

  const [error, setError] = useState(null);

  const onSubmit = async (data) => {
    try {
      setError(null);
      if (module) {
        await api.patch(`/modules/${module.id}`, data);
      } else {
        await api.post(`/modules/courses/${courseId}`, data);
      }
      onSuccess();
      onClose();
    } catch {
      setError("Error al guardar el módulo");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[#111114] border border-gray-800 rounded-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-white">
            {module ? "Editar Módulo" : "Nuevo Módulo"}
          </h2>
          <button onClick={onClose}>
            <X className="text-gray-400 hover:text-white" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-gray-300">Título</label>
            <input
              {...register("title", { required: true })}
              className="w-full bg-transparent border border-gray-700 rounded p-2 text-white"
              placeholder="Ej. Introducción Cuántica"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-gray-300">Orden</label>
            <input
              type="number"
              {...register("order")}
              className="w-full bg-transparent border border-gray-700 rounded p-2 text-white"
              placeholder="1"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded border border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded bg-qt-primary text-black font-semibold hover:opacity-90 flex items-center gap-2"
            >
              <Save size={16} />
              {isSubmitting ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
