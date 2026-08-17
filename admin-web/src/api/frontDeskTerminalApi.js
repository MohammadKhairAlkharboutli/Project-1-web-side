import axiosClient from "./axiosClient";

function normalizeTerminal(data) {
  return {
    email: data?.email || "",
    isConfigured: Boolean(data?.isConfigured),
    isActive: Boolean(data?.isActive),
  };
}

export const frontDeskTerminalApi = {
  async getTerminal() {
    const { data } = await axiosClient.get("/admin/front-desk-terminal");
    return normalizeTerminal(data);
  },

  async setup(password) {
    const { data } = await axiosClient.post("/admin/front-desk-terminal/setup", { password });
    return normalizeTerminal(data);
  },

  async resetPassword(password) {
    const { data } = await axiosClient.patch("/admin/front-desk-terminal/password", { password });
    return normalizeTerminal(data);
  },

  async setStatus(isActive) {
    const { data } = await axiosClient.patch("/admin/front-desk-terminal/status", { isActive });
    return normalizeTerminal(data);
  },
};
