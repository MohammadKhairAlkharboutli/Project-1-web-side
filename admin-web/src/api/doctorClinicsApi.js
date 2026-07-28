import axiosClient from "./axiosClient";

export const doctorClinicsApi = {
  async getClinicsForDoctor(doctorId) {
    const { data } = await axiosClient.get(
      `/doctor-clinics/doctors/${doctorId}/clinics`,
    );
    return data;
  },

  async getDoctorsForClinic(clinicId) {
    const { data } = await axiosClient.get(
      `/doctor-clinics/clinics/${clinicId}/doctors`,
    );
    return data;
  },

  async assignDoctor({ clinicId, doctorId }) {
    const { data } = await axiosClient.post("/doctor-clinics", {
      clinicId: Number(clinicId),
      doctorId: Number(doctorId),
    });
    return data;
  },

  async unassignDoctor({ clinicId, doctorId }) {
    const { data } = await axiosClient.delete(
      `/doctor-clinics/clinics/${clinicId}/doctors/${doctorId}`,
    );
    return data;
  },
};
