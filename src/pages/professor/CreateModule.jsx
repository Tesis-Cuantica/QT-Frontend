// src/pages/professor/CreateModule.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../services/api";

export default function CreateModule() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    order: "",
  });

  useEffect(() => {
    const fetchNextOrder = async () => {
      try {
        const res = await api.get(`/api/modules/course/${courseId}`);
        setFormData((prev) => ({ ...prev, order: res.data.length + 1 }));
      } catch (err) {
        console.error("Error al obtener el orden:", err);
      }
    };
    fetchNextOrder();
  }, [courseId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/api/modules", {
        ...formData,
        courseId: parseInt(courseId),
      });
      alert("Módulo creado exitosamente.");
      navigate(`/professor/courses/${courseId}`);
    } catch {
      alert("Error al crear el módulo.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-6">Crear Módulo</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Título *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full p-2 border rounded"
          />
        </div>
        <div>
          <label className="block mb-1">Orden *</label>
          <input
            type="number"
            name="order"
            value={formData.order}
            onChange={handleChange}
            required
            min="1"
            className="w-full p-2 border rounded"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Crear Módulo
        </button>
      </form>
    </div>
  );
}
