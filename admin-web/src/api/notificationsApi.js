import axiosClient from "./axiosClient";

export const notificationsApi = {
  async getMyNotifications() {
    const { data } = await axiosClient.get("/notifications/me");
    return Array.isArray(data) ? data : [];
  },
};
