import { useForm } from "react-hook-form";
import api from "@/services/api";

export default function LabFormModal({ moduleId, onClose, onSuccess }) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: { title: "", description: "", resources: "" },
  });

  const onSubmit = async (values) => {
    try {
      await api.post(`/labs/modules/${moduleId}`, values);
      onSuccess();
      onClose();
      reset();
    } catch (err) {
      console.error("Error al crear laboratorio:", err);
      alert("Error al crear laboratorio");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-qt-panel border border-qt-border p-6 rounded-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">Nuevo laboratorio</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            {...register("title", { required: true })}
            placeholder="Título del laboratorio"
            className="w-full p-2 rounded bg-transparent border border-qt-border"
          />
          <textarea
            {...register("description")}
            placeholder="Descripción o instrucciones"
            className="w-full p-2 rounded bg-transparent border border-qt-border min-h-[100px]"
          />
          <input
            {...register("resources")}
            placeholder="Enlace o recursos del lab (opcional)"
            className="w-full p-2 rounded bg-transparent border border-qt-border"
          />
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="text-qt-muted hover:text-white"
            >
              Cancelar
            </button>
            <button className="bg-qt-primary px-4 py-1 rounded hover:opacity-90">
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
