import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "@/services/api";
import { BookOpen, Loader2, Play, FileText } from "lucide-react";

export default function StudentLessonsPage() {
  const { moduleId } = useParams();
  const [lessons, setLessons] = useState([]);
  const [moduleInfo, setModuleInfo] = useState(null);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchLessons = async () => {
    try {
      const res = await api.get(`/lessons/module/${moduleId}`);
      const data = res.data;

      // Estructura esperada:
      // {
      //   module: { id, title },
      //   lessons: [ { id, title, content, type, order } ]
      // }

      setModuleInfo(data.module || null);
      setLessons(data.lessons || []);
      if (data.lessons && data.lessons.length > 0) {
        setSelectedLesson(data.lessons[0]);
      }
    } catch (err) {
      console.error("Error al cargar lecciones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLessons();
  }, [moduleId]);

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-gray-400">
        <Loader2 className="animate-spin mr-2" /> Cargando lecciones...
      </div>
    );

  if (lessons.length === 0)
    return (
      <div className="p-6 text-center text-gray-400">
        No hay lecciones disponibles en este módulo.
      </div>
    );

  return (
    <div className="p-6 grid lg:grid-cols-[300px_1fr] gap-6">
      {/* Sidebar con lista de lecciones */}
      <aside className="bg-[#111114] border border-gray-800 rounded-xl p-4 overflow-y-auto">
        <h2 className="text-lg font-semibold text-purple-400 mb-4">
          {moduleInfo ? moduleInfo.title : "Módulo"}
        </h2>

        <ul className="space-y-2">
          {lessons.map((lesson) => (
            <li
              key={lesson.id}
              onClick={() => setSelectedLesson(lesson)}
              className={`p-3 rounded-md cursor-pointer flex items-center gap-2 transition ${
                selectedLesson?.id === lesson.id
                  ? "bg-purple-600/20 border border-purple-600/30 text-purple-300"
                  : "hover:bg-gray-800 text-gray-300"
              }`}
            >
              {lesson.type === "VIDEO" ? (
                <Play size={16} />
              ) : (
                <FileText size={16} />
              )}
              <span className="text-sm">{lesson.title}</span>
            </li>
          ))}
        </ul>
      </aside>

      {/* Contenido principal */}
      <section className="bg-[#111114] border border-gray-800 rounded-xl p-6">
        {selectedLesson ? (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-100">
              {selectedLesson.title}
            </h2>
            <p className="text-sm text-gray-500">
              Tipo:{" "}
              <span className="font-semibold text-purple-400">
                {selectedLesson.type}
              </span>
            </p>

            <div className="mt-4 text-gray-300 leading-relaxed">
              {selectedLesson.type === "VIDEO" ? (
                <video
                  controls
                  className="rounded-lg w-full max-h-[400px] border border-gray-700"
                >
                  <source src={selectedLesson.content} type="video/mp4" />
                  Tu navegador no soporta la reproducción de video.
                </video>
              ) : selectedLesson.type === "PDF" ? (
                <iframe
                  src={selectedLesson.content}
                  title={selectedLesson.title}
                  className="w-full h-[500px] rounded-md border border-gray-700"
                ></iframe>
              ) : (
                <div
                  className="prose prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: selectedLesson.content }}
                />
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-400">Selecciona una lección para verla.</p>
        )}
      </section>
    </div>
  );
}
