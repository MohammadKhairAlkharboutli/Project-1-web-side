import axiosClient from "./axiosClient";

export const clinicsApi = {
  async getClinics() {
    const { data } = await axiosClient.get("/clinics");
    return data;
  },

  async getAdminClinics(filters = {}) {
    const { data } = await axiosClient.get("/clinics/admin", {
      params: filters,
    });

    return {
      data: Array.isArray(data?.data) ? data.data : [],
      total: Number(data?.total ?? 0),
      page: Number(data?.page ?? filters.page ?? 1),
      limit: Number(data?.limit ?? filters.limit ?? 10),
    };
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
