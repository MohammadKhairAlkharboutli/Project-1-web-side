import axiosClient from "./axiosClient";

export const referralsApi = {
  /**
   * Create a new referral
   * @param {Object} data - { patientId, type, reason, toDoctorId, toClinicId }
   */
  createReferral: async (data) => {
    const response = await axiosClient.post("/referrals", data);
    return response.data;
  },

  /**
   * Get all referrals created by the current doctor
   */
  getDoctorReferrals: async (params) => {
    const response = await axiosClient.get("/referrals/doctor", { params });
    return response.data;
  },

  /**
   * Get all referrals for a specific patient
   */
  getPatientReferrals: async (patientId) => {
    const response = await axiosClient.get(`/referrals/patient/${patientId}`);
    return response.data;
  },

  /**
   * Cancel a referral
   */
  cancelReferral: async (referralId, reason) => {
    const response = await axiosClient.patch(`/referrals/${referralId}/cancel`, { reason });
    return response.data;
  },
};
