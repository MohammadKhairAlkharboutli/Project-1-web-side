import axiosClient from "./axiosClient";

export const authApi = {
  storeSession: ({ accessToken, refreshToken, user }) => {
    if (!accessToken || !refreshToken) {
      throw new Error("The server did not return a complete session.");
    }

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

    if (user) {
      localStorage.setItem("sessionUser", JSON.stringify(user));
    }
  },

  clearSession: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("sessionUser");
  },

  getStoredUser: () => {
    try {
      const storedUser = localStorage.getItem("sessionUser");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  },

  login: async (loginData) => {
    const response = await axiosClient.post("/auth/login", loginData);

    authApi.storeSession(response.data);

    return response.data;
  },

  logout: async () => {
    try {
      await axiosClient.post("/auth/logout");
    } finally {
      authApi.clearSession();
    }
  },

  changePassword: async (passwords) => {
    const response = await axiosClient.post("/auth/change-password", passwords);
    return response.data;
  },
};
