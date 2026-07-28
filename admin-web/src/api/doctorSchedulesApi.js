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
};
