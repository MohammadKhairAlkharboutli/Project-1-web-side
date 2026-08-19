import axiosClient from "./axiosClient";

export const appointmentsApi = {
  async getAdminAppointments(filters = {}) {
    const { data } = await axiosClient.get("/appointments/admin", {
      params: filters,
    });

    return {
      data: Array.isArray(data?.data) ? data.data : [],
      total: Number(data?.total ?? 0),
      page: Number(data?.page ?? filters.page ?? 1),
      limit: Number(data?.limit ?? filters.limit ?? 10),
    };
  },

  async getAppointment(appointmentId) {
    const { data } = await axiosClient.get(`/appointments/${appointmentId}`);
    return data;
  },

  async cancelAppointment(appointmentId, cancellationReason) {
    const { data } = await axiosClient.patch(
      `/appointments/${Number(appointmentId)}/cancel`,
      {
        ...(cancellationReason?.trim()
          ? { cancellationReason: cancellationReason.trim() }
          : {}),
      },
    );
    return data;
  },
};
