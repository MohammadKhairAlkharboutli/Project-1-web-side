import axiosClient from "./axiosClient";

export const doctorsApi = {
  async getDoctors(filters = {}) {
    if (filters.clinicId) {
      const { data } = await axiosClient.get(
        `/doctor-clinics/clinics/${filters.clinicId}/doctors`,
      );

      return Promise.all(
        data.map(async (doctor) => {
          if (doctor.user) {
            return doctor;
          }

          const { data: doctorDetails } = await axiosClient.get(
            `/doctors/${doctor.id}`,
          );
          return doctorDetails;
        }),
      );
    }

    const { data } = await axiosClient.get("/doctors");

    return data;
  },

  async getDoctor(doctorId) {
    const { data } = await axiosClient.get(`/doctors/${doctorId}`);
    return data;
  },
};
