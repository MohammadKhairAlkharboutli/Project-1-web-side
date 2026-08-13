import axiosClient from "./axiosClient";

const EMPTY_STATS = {
  appointmentsToday: 0,
  appointmentsThisWeek: 0,
  patientsWaiting: 0,
  completedToday: 0,
};

function asNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function normalizeStats(stats) {
  return Object.fromEntries(
    Object.keys(EMPTY_STATS).map((key) => [key, asNumber(stats?.[key])]),
  );
}

function normalizeUpcomingAppointment(appointment) {
  const patientName = String(appointment?.patient?.fullName ?? "").trim();

  return {
    id: appointment?.id,
    requestedDate: appointment?.date ?? null,
    startTime: appointment?.startTime ?? null,
    endTime: appointment?.endTime ?? null,
    type: appointment?.type ?? null,
    status: appointment?.status ?? null,
    patient: {
      id: appointment?.patient?.id ?? null,
      user: {
        fullName: patientName,
        full_name: patientName,
      },
    },
  };
}

function normalizeDashboard(payload) {
  if (!payload || typeof payload !== "object") {
    throw new Error("The doctor dashboard returned an invalid response.");
  }

  const doctor = payload.doctor;

  if (!doctor || typeof doctor !== "object") {
    throw new Error("The doctor dashboard did not include doctor details.");
  }

  return {
    doctor: {
      id: doctor.id ?? null,
      fullName: String(doctor.fullName ?? doctor.full_name ?? "").trim(),
      specialization: doctor.specialization ?? null,
      averageRating: asNumber(doctor.averageRating, null),
      avatarUrl: doctor.avatarUrl ?? doctor.avatar_url ?? null,
    },
    stats: normalizeStats(payload.stats),
    upcomingAppointments: Array.isArray(payload.upcomingAppointments)
      ? payload.upcomingAppointments.map(normalizeUpcomingAppointment)
      : [],
  };
}

export const doctorDashboardApi = {
  async getDashboard() {
    const { data } = await axiosClient.get("/doctors/me/dashboard");
    return normalizeDashboard(data);
  },
};
