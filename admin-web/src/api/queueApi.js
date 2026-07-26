import axiosClient from "./axiosClient";

export const queueApi = {
  async getAdminLiveQueue(filters = {}) {
    const { data } = await axiosClient.get("/queues/admin/live", {
      params: filters,
    });

    return data;
  },

  async checkInPatient(appointmentId) {
    const { data } = await axiosClient.patch(
      `/queues/check-in/${appointmentId}`,
    );

    return data;
  },

  async skipQueue(queueId) {
    const { data } = await axiosClient.patch(`/queues/${queueId}/skip`);

    return data;
  },

  async reorderQueue(queueId, newPosition) {
    const { data } = await axiosClient.patch(`/queues/${queueId}/re-order`, {
      newPosition,
    });

    return data;
  },
};
