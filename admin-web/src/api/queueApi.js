import axiosClient from "./axiosClient";

export const queueApi = {
  async getAdminLiveQueue(filters = {}) {
    const { data } = await axiosClient.get("/queues/admin/live", {
      params: {
        ...filters,
        clinicId: filters.clinicId ? Number(filters.clinicId) : undefined,
        doctorId: filters.doctorId ? Number(filters.doctorId) : undefined,
      },
    });

    return data;
  },

  async checkInPatient(appointmentId) {
    const { data } = await axiosClient.patch(
      `/queues/check-in/${Number(appointmentId)}`,
    );

    return data;
  },

  async skipQueue(queueId) {
    const { data } = await axiosClient.patch(`/queues/${Number(queueId)}/skip`);

    return data;
  },

  async reorderQueue(queueId, newPosition) {
    const { data } = await axiosClient.patch(`/queues/${Number(queueId)}/re-order`, {
      newPosition: Number(newPosition),
    });

    return data;
  },
};
