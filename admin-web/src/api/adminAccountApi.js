import axiosClient from "./axiosClient";
import { userAvatarApi } from "./userAvatarApi";

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
    return userAvatarApi.upload(file);
  },

  removeAvatar: async () => {
    await userAvatarApi.remove();
  },

  getAvatar: async () => {
    return userAvatarApi.getObjectUrl();
  },
};
