import axiosClient from "./axiosClient";

const numericId = (value) => Number(value);

function normalizeMedicalProfile(response) {
  if (!response || typeof response !== "object") return response;

  const profile = response.medicalProfile
    ?? response.medical_profile
    ?? response.data
    ?? response;

  if (!profile || typeof profile !== "object") return response;

  return {
    ...profile,
    bloodType: profile.bloodType
      ?? profile.blood_type
      ?? profile.bloodGroup
      ?? profile.blood_group
      ?? profile.blood?.type
      ?? null,
  };
}

export const doctorAppointmentsApi = {
  async getAppointments(params = {}) {
    const { data } = await axiosClient.get("/appointments/doctor/me", { params });
    return data;
  },

  async getAppointment(appointmentId) {
    const { data } = await axiosClient.get(`/appointments/${numericId(appointmentId)}`);
    return data;
  },

  async checkIn(appointmentId) {
    const { data } = await axiosClient.patch(`/appointments/${numericId(appointmentId)}/check-in`);
    return data;
  },

  async cancel(appointmentId, cancellationReason) {
    const { data } = await axiosClient.patch(`/appointments/${numericId(appointmentId)}/cancel`, {
      ...(cancellationReason?.trim() ? { cancellationReason: cancellationReason.trim() } : {}),
    });
    return data;
  },

  async markNoShow(appointmentId) {
    const { data } = await axiosClient.patch(`/appointments/${numericId(appointmentId)}/no-show`);
    return data;
  },

  async getOperations(params = {}) {
    const { data } = await axiosClient.get("/appointments/doctor/me/operations", { params });
    return data;
  },

  async getOperationDays(clinicId) {
    const { data } = await axiosClient.get("/appointments/doctor/me/operation-days", {
      params: { clinicId: numericId(clinicId) },
    });
    return data;
  },

  async createOperation(payload) {
    const { data } = await axiosClient.post("/appointments/operation", payload);
    return data;
  },

  async startOperation(appointmentId) {
    const { data } = await axiosClient.patch(`/appointments/operation/${numericId(appointmentId)}/start`, {});
    return data;
  },

  async completeOperation(appointmentId) {
    const { data } = await axiosClient.patch(`/appointments/operation/${numericId(appointmentId)}/complete`, {});
    return data;
  },
};

export const doctorQueueApi = {
  async getMyQueue(clinicId) {
    const { data } = await axiosClient.get("/queues/doctor/my-queue", {
      ...(clinicId != null ? { params: { clinicId: numericId(clinicId) } } : {}),
    });
    return data;
  },

  async callNext(clinicId) {
    // This endpoint has no payload. Send an empty JSON object rather than `null`:
    // the backend's strict JSON parser rejects a literal `null` request body.
    const { data } = await axiosClient.patch("/queues/doctor/call-next", {}, {
      params: { clinicId: numericId(clinicId) },
    });
    return data;
  },

  async startConsultation(queueId) {
    const { data } = await axiosClient.patch(`/queues/${numericId(queueId)}/start-consultation`);
    return data;
  },

  async completeConsultation(queueId) {
    const { data } = await axiosClient.patch(`/queues/${numericId(queueId)}/complete`);
    return data;
  },

  async skip(queueId) {
    const { data } = await axiosClient.patch(`/queues/${numericId(queueId)}/skip`);
    return data;
  },
};

export const doctorClinicalApi = {
  async getMedicalProfile(appointmentId) {
    const { data } = await axiosClient.get(`/medical-profiles/appointment/${numericId(appointmentId)}`);
    return normalizeMedicalProfile(data);
  },

  async updateMedicalProfile(appointmentId, payload) {
    const { data } = await axiosClient.patch(`/medical-profiles/appointment/${numericId(appointmentId)}`, payload);
    return normalizeMedicalProfile(data);
  },

  async getMedicalHistories(appointmentId) {
    const { data } = await axiosClient.get(`/medical-histories/appointment/${numericId(appointmentId)}`);
    return data;
  },

  async getMedicines(appointmentId) {
    const { data } = await axiosClient.get(`/prescribed-medicines/appointment/${numericId(appointmentId)}`);
    return data;
  },

  async getAttachments(appointmentId) {
    const { data } = await axiosClient.get(`/medical-attachments/appointment/${numericId(appointmentId)}`);
    return data;
  },

  async downloadAttachment(appointmentId, attachmentId) {
    const { data } = await axiosClient.get(
      `/medical-attachments/appointment/${numericId(appointmentId)}/${numericId(attachmentId)}`,
      { responseType: "blob" },
    );
    return data;
  },

  // Do not use /medical-profile-logs/patient/:patientId here. Its current
  // backend implementation does not verify that the doctor owns a visit for
  // the patient. The appointment-scoped endpoint performs that verification.
  async getMedicalProfileLogs(appointmentId) {
    const { data } = await axiosClient.get(`/medical-profile-logs/appointment/${numericId(appointmentId)}`);
    return data;
  },

  async createMedicalHistory(payload) {
    const { data } = await axiosClient.post("/medical-histories", payload);
    return data;
  },

  async createHistoryMedicine(historyId, payload) {
    const { data } = await axiosClient.post(`/prescribed-medicines/history/${numericId(historyId)}`, payload);
    return data;
  },

  async uploadHistoryAttachments(historyId, files) {
    if (!files?.length) return [];
    const body = new FormData();
    files.forEach((file) => body.append("files", file));
    const { data } = await axiosClient.post(`/medical-attachments/history/${numericId(historyId)}`, body, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },

  async uploadProfileAttachments(appointmentId, files) {
    if (!files?.length) return [];
    const body = new FormData();
    files.forEach((file) => body.append("files", file));
    const { data } = await axiosClient.post(
      `/medical-attachments/profile/appointment/${numericId(appointmentId)}`,
      body,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data;
  },
};
