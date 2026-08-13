import axiosClient from "./axiosClient";

function normalizeRating(rating) {
  if (!rating) {
    return rating;
  }

  return {
    ...rating,
    createdAt: rating.createdAt ?? rating.created_at,
    updatedAt: rating.updatedAt ?? rating.updated_at,
  };
}

function normalizeReport(report) {
  if (!report) {
    return report;
  }

  return {
    ...report,
    createdAt: report.createdAt ?? report.created_at,
    updatedAt: report.updatedAt ?? report.updated_at,
    resolvedAt: report.resolvedAt ?? report.resolved_at,
    resolvedByAdminId:
      report.resolvedByAdminId ?? report.resolved_by_admin_id,
    rating: normalizeRating(report.rating),
  };
}

function normalizePaginatedResponse(data, filters, normalizeItem) {
  return {
    data: Array.isArray(data?.data) ? data.data.map(normalizeItem) : [],
    total: Number.isFinite(Number(data?.total)) ? Number(data.total) : 0,
    page: Number.isFinite(Number(data?.page))
      ? Number(data.page)
      : Number(filters.page) || 1,
    limit: Number.isFinite(Number(data?.limit))
      ? Number(data.limit)
      : Number(filters.limit) || 10,
  };
}

export const ratingsApi = {
  async getAdminRatings(filters = {}) {
    const { data } = await axiosClient.get("/ratings/admin/all", {
      params: filters,
    });

    return normalizePaginatedResponse(data, filters, normalizeRating);
  },

  async updateRatingStatus(ratingId, status) {
    const { data } = await axiosClient.patch(
      `/ratings/admin/${Number(ratingId)}/status`,
      { status },
    );
    return normalizeRating(data);
  },

  async getAdminReports(filters = {}) {
    const { data } = await axiosClient.get("/ratings/admin/reports", {
      params: filters,
    });

    return normalizePaginatedResponse(data, filters, normalizeReport);
  },

  async resolveReport(reportId, action) {
    const { data } = await axiosClient.patch(
      `/ratings/admin/reports/${Number(reportId)}/resolve`,
      { action },
    );
    return normalizeReport(data);
  },
};
