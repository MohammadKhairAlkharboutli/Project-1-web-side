import axiosClient from "./axiosClient";

const EMPTY_SUMMARY = {
  totalPatients: 0,
  newPatientsThisMonth: 0,
  activeDoctors: 0,
  pendingScheduleRequests: 0,
  todaysAppointments: 0,
  liveQueueNow: 0,
  clinicsNeedingAttention: 0,
  monthlyRevenue: 0,
  heldPayments: 0,
};

function asNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function normalizeSummary(summary) {
  return Object.fromEntries(
    Object.keys(EMPTY_SUMMARY).map((key) => [key, asNumber(summary?.[key])]),
  );
}

function normalizeTrend(trend) {
  return {
    period: String(trend?.period ?? ""),
    totalAppointments: asNumber(trend?.totalAppointments),
    completedAppointments: asNumber(trend?.completedAppointments),
    missedOrCancelledAppointments: asNumber(
      trend?.missedOrCancelledAppointments,
    ),
    completedRevenue: asNumber(trend?.completedRevenue),
  };
}

function normalizeStatusBreakdown(item) {
  return {
    status: String(item?.status ?? ""),
    count: asNumber(item?.count),
  };
}

function normalizeTopRatedDoctor(doctor) {
  return {
    doctorId: doctor?.doctorId,
    fullName: String(doctor?.fullName ?? "").trim(),
    specialization: doctor?.specialization ?? null,
    averageRating: asNumber(doctor?.averageRating),
    ratingCount: asNumber(doctor?.ratingCount),
    status: String(doctor?.status ?? "").toLowerCase(),
  };
}

function normalizeDashboardData(payload, requestedRange) {
  if (!payload || typeof payload !== "object") {
    throw new Error("The dashboard returned an invalid response.");
  }

  return {
    range: payload.range ?? requestedRange,
    summary: normalizeSummary(payload.summary),
    trends: Array.isArray(payload.trends) ? payload.trends.map(normalizeTrend) : [],
    appointmentStatusBreakdown: Array.isArray(payload.appointmentStatusBreakdown)
      ? payload.appointmentStatusBreakdown.map(normalizeStatusBreakdown)
      : [],
    topRatedDoctors: Array.isArray(payload.topRatedDoctors)
      ? payload.topRatedDoctors.map(normalizeTopRatedDoctor)
      : [],
  };
}

export const adminDashboardApi = {
  async getDashboard(range) {
    const { data } = await axiosClient.get("/admin/dashboard", {
      params: { range },
    });

    return normalizeDashboardData(data, range);
  },
};
