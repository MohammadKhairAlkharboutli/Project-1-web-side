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

  async getSecretaryDeskContext() {
    const { data } = await axiosClient.get("/queues/secretary/context");
    return data;
  },

  async getSecretaryClinicDoctors(clinicId) {
    const { data } = await axiosClient.get(
      `/queues/secretary/clinics/${Number(clinicId)}/doctors`,
    );
    return data;
  },

  async getSecretaryDesk({ clinicId, doctorId }) {
    const { data } = await axiosClient.get("/queues/secretary/desk", {
      params: { clinicId: Number(clinicId), doctorId: Number(doctorId) },
    });
    return data;
  },

  async checkInPatientAsSecretary(appointmentId) {
    const { data } = await axiosClient.patch(
      `/queues/secretary/check-in/${Number(appointmentId)}`,
    );
    return data;
  },

  async skipQueueAsSecretary(queueId) {
    const { data } = await axiosClient.patch(
      `/queues/secretary/${Number(queueId)}/skip`,
    );
    return data;
  },

  async reorderQueueAsSecretary(queueId, newPosition) {
    const { data } = await axiosClient.patch(
      `/queues/secretary/${Number(queueId)}/re-order`,
      { newPosition: Number(newPosition) },
    );
    return data;
  },
};
