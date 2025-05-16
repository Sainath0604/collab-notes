import { useAuth } from "../context/AuthContext";

export const useApi = () => {
  const { token } = useAuth();

  const apiFetch = async (url: string, options: RequestInit = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "API Error");
    }
    return response.json();
  };

  return { apiFetch };
};
