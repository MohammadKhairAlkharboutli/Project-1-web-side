import axiosClient from "./axiosClient";

function normalizeLookup(lookup) {
  return {
    ...lookup,
    createdAt: lookup.createdAt ?? lookup.created_at,
    updatedAt: lookup.updatedAt ?? lookup.updated_at,
  };
}

export const lookupsApi = {
  async getActiveLookups(params = {}) {
    const { data } = await axiosClient.get("/lookups", { params });
    return (data ?? []).map(normalizeLookup);
  },

  async getAdminLookups(params = {}) {
    const { data } = await axiosClient.get("/lookups/admin", { params });
    return (data ?? []).map(normalizeLookup);
  },

  async createLookup(lookup) {
    const { data } = await axiosClient.post("/lookups", lookup);
    return normalizeLookup(data);
  },

  async updateLookup(lookupId, lookup) {
    const { data } = await axiosClient.patch(`/lookups/${Number(lookupId)}`, lookup);
    return normalizeLookup(data);
  },

  async toggleLookupStatus(lookupId) {
    const { data } = await axiosClient.patch(
      `/lookups/${Number(lookupId)}/toggle-status`,
    );
    return normalizeLookup(data);
  },

  async deleteLookup(lookupId) {
    await axiosClient.delete(`/lookups/${Number(lookupId)}`);
  },
};
