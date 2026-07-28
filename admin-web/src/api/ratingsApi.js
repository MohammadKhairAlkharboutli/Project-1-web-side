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

export const ratingsApi = {
  async getAdminRatings(filters = {}) {
    const { data } = await axiosClient.get("/ratings/admin/all", {
      params: { limit: 100, ...filters },
    });

    return {
      ...data,
      data: (data.data ?? []).map(normalizeRating),
    };
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
      params: { limit: 100, ...filters },
    });

    return {
      ...data,
      data: (data.data ?? []).map(normalizeReport),
    };
  },

  async resolveReport(reportId, action) {
    const { data } = await axiosClient.patch(
      `/ratings/admin/reports/${Number(reportId)}/resolve`,
      { action },
    );
    return normalizeReport(data);
  },
};
