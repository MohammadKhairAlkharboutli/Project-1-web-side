import axiosClient from "./axiosClient";

export const referralsApi = {
  async createReferral(data) {
    const { data: referral } = await axiosClient.post("/referrals", data);
    return referral;
  },

  async getSentReferrals(params = {}) {
    const { data } = await axiosClient.get("/referrals/doctor/sent", { params });
    return data;
  },

  async getReceivedReferrals(params = {}) {
    const { data } = await axiosClient.get("/referrals/doctor/received", { params });
    return data;
  },

  async getSelfReferrals(params = {}) {
    const { data } = await axiosClient.get("/referrals/doctor/self", { params });
    return data;
  },
};
