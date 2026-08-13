import axiosClient from "./axiosClient";

function asNumber(value, fallback = null) {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getFullName(user) {
  if (user?.fullName || user?.full_name) {
    return String(user.fullName ?? user.full_name).trim();
  }

  return [user?.firstName, user?.fatherName, user?.lastName]
    .filter(Boolean)
    .join(" ");
}

function calculateAge(birthDate) {
  if (!birthDate) {
    return null;
  }

  const date = new Date(birthDate);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - date.getFullYear();
  const hasHadBirthday =
    today.getMonth() > date.getMonth() ||
    (today.getMonth() === date.getMonth() && today.getDate() >= date.getDate());

  if (!hasHadBirthday) {
    age -= 1;
  }

  return Math.max(age, 0);
}

function normalizeUser(user) {
  if (!user || typeof user !== "object") {
    return null;
  }

  const birthDate = user.birthDate ?? user.birth_date ?? null;

  return {
    id: asNumber(user.id),
    firstName: user.firstName ?? "",
    fatherName: user.fatherName ?? "",
    lastName: user.lastName ?? "",
    fullName: getFullName(user),
    full_name: getFullName(user),
    email: user.email ?? null,
    phone: user.phone ?? null,
    birthDate,
    gender: user.gender ?? null,
    status: user.status ?? null,
    avatarUrl: user.avatarUrl ?? user.avatar_url ?? null,
    age: calculateAge(birthDate),
  };
}

function normalizePatient(patientProfile, responseUser) {
  const profile = patientProfile ?? {};

  return {
    id: asNumber(profile.id),
    userId: asNumber(profile.userId ?? profile.user_id),
    occupation: profile.occupation ?? null,
    maritalStatus: profile.maritalStatus ?? profile.marital_status ?? null,
    emergencyContactName:
      profile.emergencyContactName ?? profile.emergency_contact_name ?? null,
    emergencyContactPhone:
      profile.emergencyContactPhone ?? profile.emergency_contact_phone ?? null,
    noShowCount: asNumber(profile.noShowCount ?? profile.no_show_count, 0),
    user: normalizeUser(responseUser ?? profile.user),
  };
}

function normalizeDoctor(doctor) {
  if (!doctor) {
    return null;
  }

  const fullName = String(
    doctor.fullName ?? doctor.full_name ?? getFullName(doctor.user) ?? "",
  ).trim();

  return {
    ...doctor,
    id: asNumber(doctor.id),
    fullName,
    user: {
      ...(doctor.user ?? {}),
      fullName,
      full_name: fullName,
    },
  };
}

function normalizeAppointment(appointment) {
  const doctor = normalizeDoctor(appointment?.doctor);

  return {
    ...appointment,
    id: asNumber(appointment?.id),
    patientId: asNumber(appointment?.patientId ?? appointment?.patient_id),
    doctorId: asNumber(appointment?.doctorId ?? appointment?.doctor_id ?? doctor?.id),
    clinicId: asNumber(
      appointment?.clinicId ?? appointment?.clinic_id ?? appointment?.clinic?.id,
    ),
    requestedDate: appointment?.requestedDate ?? appointment?.requested_date ?? null,
    startTime: appointment?.startTime ?? appointment?.start_time ?? null,
    endTime: appointment?.endTime ?? appointment?.end_time ?? null,
    doctor,
    clinic: appointment?.clinic ?? null,
  };
}

function normalizeMedicine(medicine) {
  return {
    ...medicine,
    id: asNumber(medicine?.id),
    medicineName: medicine?.medicineName ?? medicine?.medicine_name ?? null,
    startDate: medicine?.startDate ?? medicine?.start_date ?? null,
    endDate: medicine?.endDate ?? medicine?.end_date ?? null,
  };
}

function normalizeAttachment(attachment) {
  const uploader = attachment?.uploader ?? attachment?.uploadedBy ?? null;

  return {
    ...attachment,
    id: asNumber(attachment?.id),
    createdAt: attachment?.createdAt ?? attachment?.created_at ?? null,
    medicalProfileId: asNumber(
      attachment?.medicalProfileId ?? attachment?.medical_profile_id,
    ),
    medicalHistoryId: asNumber(
      attachment?.medicalHistoryId ?? attachment?.medical_history_id,
    ),
    appointmentId: asNumber(attachment?.appointmentId ?? attachment?.appointment_id),
    uploadedBy: uploader
      ? {
          fullName: uploader.fullName ?? uploader.full_name ?? uploader.name ?? "",
          role: uploader.role ?? null,
        }
      : null,
  };
}

function normalizeMedicalHistory(history) {
  return {
    ...history,
    id: asNumber(history?.id),
    appointmentId: asNumber(
      history?.appointmentId ?? history?.appointment_id ?? history?.appointment?.id,
    ),
    createdAt: history?.createdAt ?? history?.created_at ?? null,
    appointment: history?.appointment
      ? normalizeAppointment(history.appointment)
      : null,
    doctor: normalizeDoctor(history?.doctor),
    medicines: Array.isArray(history?.medicines)
      ? history.medicines.map(normalizeMedicine)
      : [],
    attachments: Array.isArray(history?.attachments)
      ? history.attachments.map(normalizeAttachment)
      : [],
  };
}

function normalizeProfileLog(log) {
  const changedBy = log?.changedBy ?? log?.user ?? null;
  const fullName = getFullName(changedBy);

  return {
    ...log,
    id: asNumber(log?.id),
    createdAt: log?.createdAt ?? log?.created_at ?? null,
    appointmentId: asNumber(log?.appointmentId ?? log?.appointment_id),
    changedBy: changedBy
      ? {
          id: asNumber(changedBy.id),
          role: changedBy.role ?? null,
          fullName,
        }
      : null,
  };
}

function getDownloadName(response, fallbackName) {
  const header = response.headers?.["content-disposition"];
  const match = header?.match(/filename\*?=(?:UTF-8''|")?([^;"]+)/i);

  if (match?.[1]) {
    return decodeURIComponent(match[1].trim());
  }

  return fallbackName || "medical-attachment";
}

export const adminPatientsApi = {
  async getPatients(filters = {}) {
    const { data } = await axiosClient.get("/admin/patients", { params: filters });

    return {
      data: Array.isArray(data?.data)
        ? data.data.map((patient) => normalizePatient(patient))
        : [],
      total: asNumber(data?.total, 0),
      page: asNumber(data?.page, asNumber(filters.page, 1)),
      limit: asNumber(data?.limit, asNumber(filters.limit, 10)),
    };
  },

  async getPatient(patientId) {
    const { data } = await axiosClient.get(`/admin/patients/${Number(patientId)}`);
    return normalizePatient(data?.patientProfile, data?.user);
  },

  async getAppointments(patientId) {
    const { data } = await axiosClient.get(
      `/admin/patients/${Number(patientId)}/appointments`,
    );

    return Array.isArray(data?.appointments)
      ? data.appointments.map(normalizeAppointment)
      : [];
  },

  async getMedicalProfile(patientId) {
    const { data } = await axiosClient.get(
      `/admin/patients/${Number(patientId)}/medical-profile`,
    );

    return data?.medicalProfile ?? null;
  },

  async getMedicalHistories(patientId) {
    const { data } = await axiosClient.get(
      `/admin/patients/${Number(patientId)}/medical-histories`,
    );

    return Array.isArray(data?.medicalHistories)
      ? data.medicalHistories.map(normalizeMedicalHistory)
      : [];
  },

  async getMedicalProfileLogs(patientId) {
    const { data } = await axiosClient.get(
      `/admin/patients/${Number(patientId)}/medical-profile-logs`,
    );

    return Array.isArray(data?.logs) ? data.logs.map(normalizeProfileLog) : [];
  },

  async getAttachments(patientId) {
    const { data } = await axiosClient.get(
      `/admin/patients/${Number(patientId)}/attachments`,
    );

    return {
      profileAttachments: Array.isArray(data?.profileAttachments)
        ? data.profileAttachments.map(normalizeAttachment)
        : [],
      historyAttachments: Array.isArray(data?.historyAttachments)
        ? data.historyAttachments.map(normalizeAttachment)
        : [],
    };
  },

  async downloadAttachment(attachmentId, originalName) {
    const response = await axiosClient.get(
      `/admin/medical-attachments/${Number(attachmentId)}/download`,
      { responseType: "blob" },
    );
    const href = URL.createObjectURL(response.data);
    const link = document.createElement("a");

    link.href = href;
    link.download = getDownloadName(response, originalName);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(href);
  },
};
