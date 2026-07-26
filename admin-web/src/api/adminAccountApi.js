import axiosClient from "./axiosClient";

export const adminAccountApi = {
  getCurrentAccount: async () => {
    const { data: session } = await axiosClient.get("/auth/me");
    const { data: account } = await axiosClient.get(`/users/${session.sub}`);

    return account;
  },

  updateAccount: async (userId, updates) => {
    const { data } = await axiosClient.patch(`/users/${userId}`, updates);
    return data;
  },

  uploadAvatar: async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await axiosClient.patch("/users/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data;
  },

  removeAvatar: async () => {
    await axiosClient.delete("/users/me/avatar");
  },

  getAvatar: async () => {
    const { data } = await axiosClient.get("/users/me/avatar", {
      responseType: "blob",
    });

    return URL.createObjectURL(data);
  },
};
