import axiosClient from "./axiosClient";

function normalizeSettings(settings) {
  return {
    ...settings,
    lateCancelPenaltyPercent: Number(settings.lateCancelPenaltyPercent),
    createdAt: settings.createdAt ?? settings.created_at,
    updatedAt: settings.updatedAt ?? settings.updated_at,
  };
}

export const systemSettingsApi = {
  async getSettings() {
    const { data } = await axiosClient.get("/system-settings");
    return normalizeSettings(data);
  },

  async updateSettings(settings) {
    const { data } = await axiosClient.patch("/system-settings", settings);
    return normalizeSettings(data);
  },
};
