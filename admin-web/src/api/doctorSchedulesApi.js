import axiosClient from "./axiosClient";

export const doctorSchedulesApi = {
  async getAdminDoctorSchedule(doctorId) {
    const { data } = await axiosClient.get(
      `/doctor-schedules/admin/doctor/${doctorId}`,
    );
    return data;
  },

  async getPendingScheduleRequests() {
    const { data } = await axiosClient.get(
      "/doctor-schedules/admin/requests/pending",
    );
    return data;
  },

  async updateScheduleRequestStatus(requestId, status) {
    const { data } = await axiosClient.patch(
      `/doctor-schedules/requests/${Number(requestId)}/status`,
      { status },
    );
    return data;
  },

  /**
   * Create or update weekly template.
   * If schedule exists, it submits a change request for admin approval.
   * @param {Object} data - { clinicId, dayOfWeek, isActive, slots: [{ startTime, endTime, type, notes }] }
   */
  createOrUpdateSchedule: async (data) => {
    const response = await axiosClient.post("/doctor-schedules", data);
    return response.data;
  },

  /**
   * Get current doctor's own schedule
   */
  getOwnSchedule: async () => {
    const response = await axiosClient.get("/doctor-schedules/me");
    return response.data;
  },
};
