export default function Loader({ text = "Cargando..." }) {
  return (
    <div className="w-full py-10 text-center text-qt-muted">
      <div className="mx-auto mb-3 h-5 w-5 animate-spin rounded-full border-2 border-qt-accent border-t-transparent"></div>
      {text}
    </div>
  );
}
