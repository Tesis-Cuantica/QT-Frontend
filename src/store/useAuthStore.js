import { create } from "zustand";

const storageKey = "qt_auth";

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  loading: false,

  init: () => {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const { user, token } = JSON.parse(raw);
      set({ user, token });
    }
  },

  login: async (api, payload) => {
    set({ loading: true });
    try {
      // POST /api/auth/login → { token, user }
      const { data } = await api.post("/auth/login", payload);
      const { token, user } = data;
      set({ user, token, loading: false });
      localStorage.setItem(storageKey, JSON.stringify({ user, token }));
      return { ok: true };
    } catch (e) {
      set({ loading: false });
      return {
        ok: false,
        message: e?.response?.data?.message || "Error de login",
      };
    }
  },

  register: async (api, payload) => {
    set({ loading: true });
    try {
      await api.post("/auth/register", payload);
      set({ loading: false });
      return { ok: true };
    } catch (e) {
      set({ loading: false });
      return {
        ok: false,
        message: e?.response?.data?.message || "Error de registro",
      };
    }
  },

  logout: () => {
    localStorage.removeItem(storageKey);
    set({ user: null, token: null });
  },
}));

export default useAuthStore;
