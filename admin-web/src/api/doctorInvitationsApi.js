import axiosClient from "./axiosClient";

export const doctorInvitationsApi = {
  async create(email) {
    const { data } = await axiosClient.post("/admin/doctor-invitations", {
      email,
    });

    return data;
  },

  async validate(token) {
    const { data } = await axiosClient.get(
      `/auth/doctor-invite/${encodeURIComponent(token)}`,
    );

    return data;
  },

  async register(token, registration) {
    const { data } = await axiosClient.post(
      `/auth/doctor-invite/${encodeURIComponent(token)}/register`,
      registration,
    );

    return data;
  },

  async reject(token) {
    const { data } = await axiosClient.post(
      `/auth/doctor-invite/${encodeURIComponent(token)}/reject`,
    );

    return data;
  },
};
