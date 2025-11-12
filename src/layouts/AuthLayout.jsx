import { Outlet } from "react-router-dom";

export default function AuthLayout() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center p-4 bg-black overflow-hidden">
      <div className="absolute top-0 left-0 w-72 h-72 bg-purple-600/30 rounded-full filter blur-3xl opacity-50 animate-pulse"></div>
      <div
        className="absolute bottom-0 right-0 w-72 h-72 bg-blue-600/30 rounded-full filter blur-3xl opacity-50 animate-pulse"
        style={{ animationDelay: "2s" }}
      ></div>

      <div className="relative z-10 w-full max-w-sm bg-[#1a1a1a]/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-zinc-800">
        <Outlet />
      </div>
    </div>
  );
}
