import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-qt-panel border border-qt-border rounded-2xl p-6 shadow-xl">
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold">QuantumTec LMS</h1>
          <p className="text-sm text-qt-muted">
            Inicia sesión o crea tu cuenta
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
