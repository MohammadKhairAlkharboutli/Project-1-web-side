import axiosClient from "./axiosClient";

const numericId = (value) => Number(value);

export const doctorLeavesApi = {
  async getOwnLeaves() {
    const { data } = await axiosClient.get("/doctor-leaves/me");
    return data;
  },

  async getAdminLeaves(filters = {}) {
    const { data } = await axiosClient.get("/doctor-leaves/admin", {
      params: filters,
    });
    return Array.isArray(data) ? data : [];
  },

  async createLeave(payload) {
    const { data } = await axiosClient.post("/doctor-leaves", payload);
    return data;
  },

  async deleteLeave(leaveId) {
    const { data } = await axiosClient.delete(`/doctor-leaves/${numericId(leaveId)}`);
    return data;
  },
};
