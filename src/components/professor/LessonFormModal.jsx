import { useForm } from "react-hook-form";
import api from "@/services/api";

export default function LessonFormModal({
  moduleId,
  lesson,
  onClose,
  onSuccess,
}) {
  const { register, handleSubmit, reset } = useForm({
    defaultValues: lesson || { title: "", content: "" },
  });

  const onSubmit = async (values) => {
    try {
      if (lesson) {
        await api.patch(`/lessons/${lesson.id}`, values);
      } else {
        await api.post(`/lessons/module/${moduleId}`, values);
      }
      onSuccess();
      onClose();
      reset();
    } catch (err) {
      console.error("Error al guardar lección:", err);
      alert("Error al guardar lección");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-qt-panel border border-qt-border p-6 rounded-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4">
          {lesson ? "Editar Lección" : "Nueva Lección"}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input
            {...register("title", { required: true })}
            placeholder="Título de la lección"
            className="w-full p-2 rounded bg-transparent border border-qt-border"
          />
          <textarea
            {...register("content")}
            placeholder="Contenido o descripción"
            className="w-full p-2 rounded bg-transparent border border-qt-border min-h-[100px]"
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
