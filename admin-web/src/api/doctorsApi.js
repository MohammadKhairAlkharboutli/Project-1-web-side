import axiosClient from "./axiosClient";

export const doctorsApi = {
  async getDoctors(filters = {}) {
    if (filters.clinicId) {
      const { data } = await axiosClient.get(
        `/doctor-clinics/clinics/${filters.clinicId}/doctors`,
      );

      return data;
    }

    const { data } = await axiosClient.get("/doctors");

    return data;
  },
};
