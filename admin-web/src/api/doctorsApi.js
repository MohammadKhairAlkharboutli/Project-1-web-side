import axiosClient from "./axiosClient";

function asNumber(value, fallback = null) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getFullName(user) {
  if (user?.full_name || user?.fullName) {
    return String(user.full_name ?? user.fullName).trim();
  }

  return [user?.firstName, user?.fatherName, user?.lastName]
    .filter(Boolean)
    .join(" ");
}

function normalizeAdminDoctor(doctor) {
  const user = doctor?.user ?? null;
  const fullName = getFullName(user);

  return {
    ...doctor,
    id: asNumber(doctor?.id),
    user: user
      ? {
          ...user,
          fullName,
          full_name: fullName,
        }
      : null,
    experienceYears: asNumber(
      doctor?.experienceYears ?? doctor?.experience_years,
    ),
    averageRating: asNumber(doctor?.averageRating ?? doctor?.average_rating),
    initialVisitFee: doctor?.initialVisitFee ?? doctor?.initial_visit_fee ?? null,
    returnVisitFee: doctor?.returnVisitFee ?? doctor?.return_visit_fee ?? null,
    languagesSpoken: Array.isArray(doctor?.languagesSpoken)
      ? doctor.languagesSpoken
      : Array.isArray(doctor?.languages_spoken)
        ? doctor.languages_spoken
        : [],
  };
}

export const doctorsApi = {
  async getAdminDoctors(filters = {}) {
    const { data } = await axiosClient.get("/admin/doctors", {
      params: filters,
    });

    return {
      data: Array.isArray(data?.data)
        ? data.data.map(normalizeAdminDoctor)
        : [],
      total: asNumber(data?.total, 0),
      page: asNumber(data?.page, asNumber(filters.page, 1)),
      limit: asNumber(data?.limit, asNumber(filters.limit, 10)),
    };
  },

  async updateDoctorStatus(doctorId, status) {
    const { data } = await axiosClient.patch(
      `/doctors/${Number(doctorId)}/status`,
      { status },
    );
    return normalizeAdminDoctor(data);
  },

  async getOwnProfile() {
    const { data } = await axiosClient.get("/doctors/me");
    return data;
  },

  async updateOwnProfile(profile) {
    const { data } = await axiosClient.patch("/doctors/me", profile);
    return data;
  },

  async getDoctors(filters = {}) {
    if (filters.clinicId) {
      const { data } = await axiosClient.get(
        `/doctor-clinics/clinics/${filters.clinicId}/doctors`,
      );

      return Promise.all(
        data.map(async (doctor) => {
          if (doctor.user) {
            return doctor;
          }

          const { data: doctorDetails } = await axiosClient.get(
            `/doctors/${doctor.id}`,
          );
          return doctorDetails;
        }),
      );
    }

    const { data } = await axiosClient.get("/doctors");

    return data;
  },

  async getDoctor(doctorId) {
    const { data } = await axiosClient.get(`/doctors/${doctorId}`);
    return data;
  },
};
