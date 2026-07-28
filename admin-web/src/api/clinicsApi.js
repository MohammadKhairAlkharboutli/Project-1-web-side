import axiosClient from "./axiosClient";

export const clinicsApi = {
  async getClinics() {
    const { data } = await axiosClient.get("/clinics");
    return data;
  },
};
