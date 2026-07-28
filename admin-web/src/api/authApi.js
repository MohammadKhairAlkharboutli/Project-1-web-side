import axiosClient from "./axiosClient";

export const authApi = {
  clearSession: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },

  login: async (loginData) => {
    const response = await axiosClient.post("/auth/login", loginData);

    const { accessToken, refreshToken } = response.data;

    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);

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
