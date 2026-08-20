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

function normalizeRatingDetails(data) {
  const rating = data?.rating ?? data;

  return normalizeRating({
    ...rating,
    patientProfile: rating?.patientProfile ?? data?.patientProfile ?? null,
    doctorProfile: rating?.doctorProfile ?? data?.doctorProfile ?? null,
    appointment: rating?.appointment ?? data?.appointment ?? null,
  });
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

function normalizeReportDetails(data) {
  const report = data?.report ?? data;

  return normalizeReport({
    ...report,
    reporterPatient: report?.reporterPatient ?? data?.reporterPatient ?? null,
    rating: report?.rating ?? data?.rating ?? null,
  });
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

  async findVisibleRatingForAppointment(rating) {
    const patientId = Number(rating?.patientProfileId);
    const appointmentId = Number(rating?.appointmentId);

    if (!Number.isInteger(patientId) || patientId <= 0 || !Number.isInteger(appointmentId) || appointmentId <= 0) {
      return null;
    }

    const limit = 100;
    let page = 1;

    while (true) {
      const response = await this.getAdminRatings({
        page,
        limit,
        patientId,
        status: "visible",
      });
      const conflictingRating = response.data.find((item) => (
        String(item.id) !== String(rating.id)
        && String(item.appointmentId) === String(rating.appointmentId)
      ));

      if (conflictingRating) {
        return conflictingRating;
      }

      if (page * limit >= response.total) {
        return null;
      }

      page += 1;
    }
  },

  async getAdminRatingDetails(ratingId) {
    const { data } = await axiosClient.get(`/admin/ratings/${Number(ratingId)}`);
    return normalizeRatingDetails(data);
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

  async getAdminReportDetails(reportId) {
    const { data } = await axiosClient.get(`/admin/reports/${Number(reportId)}`);
    return normalizeReportDetails(data);
  },
};
