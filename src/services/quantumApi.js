// frontend/src/services/quantumApi.js
import axios from "axios";

const API_BASE = "https://grover-algoritm.onrender.com";

export const runGrover = async (params) => {
  const response = await axios.post(`${API_BASE}/grover`, params);
  return response.data;
};
