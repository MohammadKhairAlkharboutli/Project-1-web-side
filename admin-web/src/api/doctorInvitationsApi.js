import axiosClient from "./axiosClient";

function normalizeInvitation(invitation) {
  return {
    ...invitation,
    createdAt: invitation.createdAt ?? invitation.created_at,
    expiresAt: invitation.expiresAt ?? invitation.expires_at,
  };
}

export const doctorInvitationsApi = {
  async create(email) {
    const { data } = await axiosClient.post("/admin/doctor-invitations", {
      email,
    });

    return data;
  },

  async list() {
    const { data } = await axiosClient.get("/admin/doctor-invitations");
    return (data ?? []).map(normalizeInvitation);
  },

  async cancel(invitationId) {
    await axiosClient.post(
      `/admin/doctor-invitations/${Number(invitationId)}/cancel`,
    );
  },

  async validate(token) {
    const { data } = await axiosClient.get(
      `/auth/doctor-invite/${encodeURIComponent(token)}`,
    );

    return data;
  },

  async register(token, registration) {
    const { data } = await axiosClient.post(
      `/auth/doctor-invite/${encodeURIComponent(token)}/register`,
      registration,
    );

    return data;
  },

  async reject(token) {
    const { data } = await axiosClient.post(
      `/auth/doctor-invite/${encodeURIComponent(token)}/reject`,
    );

    return data;
  },
};
