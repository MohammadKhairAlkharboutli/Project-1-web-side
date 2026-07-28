import axiosClient from "./axiosClient";

export const clinicsApi = {
  async getClinics() {
    const { data } = await axiosClient.get("/clinics");
    return data;
  },

  async getClinic(clinicId) {
    const { data } = await axiosClient.get(`/clinics/${clinicId}`);
    return data;
  },

  async createClinic(clinic) {
    const { data } = await axiosClient.post("/clinics", clinic);
    return data;
  },

  async updateClinic(clinicId, updates) {
    const { data } = await axiosClient.patch(`/clinics/${clinicId}`, updates);
    return data;
  },

  async closeClinic(clinicId) {
    const { data } = await axiosClient.delete(`/clinics/${clinicId}`);
    return data;
  },
};
