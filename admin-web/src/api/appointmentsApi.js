import axiosClient from "./axiosClient";

export const appointmentsApi = {
  async getAdminAppointments(filters = {}) {
    const { data } = await axiosClient.get("/appointments/admin", {
      params: filters,
    });

    return data;
  },

  async getAppointment(appointmentId) {
    const { data } = await axiosClient.get(`/appointments/${appointmentId}`);
    return data;
  },
};
