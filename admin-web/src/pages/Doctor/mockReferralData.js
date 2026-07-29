const mockClinics = [
  { id: 1, name: "Central Medical Clinic" },
  { id: 2, name: "Cardiology Center" },
  { id: 3, name: "Specialist Care Clinic" },
];

const mockDoctors = [
  { id: 2, clinicId: 2, user: { full_name: "Dr. Sarah Wilson" } },
  { id: 3, clinicId: 3, user: { full_name: "Dr. Omar Khalil" } },
  { id: 4, clinicId: 1, user: { full_name: "Dr. Lina Haddad" } },
];

const patientNames = {
  1: "Ahmad Mohammad",
  2: "Sara Ibrahim",
  3: "Yousef Ali",
};

let nextReferralId = 3;
let sentReferrals = [
  {
    id: 1,
    patientId: 1,
    patient: { user: { full_name: "Ahmad Mohammad" } },
    fromDoctorId: 1,
    toClinic: mockClinics[1],
    toDoctor: mockDoctors[0],
    type: "EXTERNAL",
    reason: "Specialized cardiac evaluation is recommended.",
    status: "PENDING",
    expiresAt: "2026-08-28T23:59:59.000Z",
    createdAt: "2026-07-28T09:30:00.000Z",
  },
  {
    id: 2,
    patientId: 2,
    patient: { user: { full_name: "Sara Ibrahim" } },
    fromDoctorId: 1,
    toClinic: null,
    toDoctor: null,
    type: "FOLLOW_UP",
    reason: "Review recovery progress after treatment.",
    status: "COMPLETED",
    expiresAt: "2026-08-11T23:59:59.000Z",
    createdAt: "2026-07-25T11:15:00.000Z",
  },
];

function addDays(days) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  date.setHours(23, 59, 59, 999);
  return date.toISOString();
}

export function getMockReferralDestinations(clinicId) {
  return {
    clinics: mockClinics,
    doctors: clinicId
      ? mockDoctors.filter((doctor) => Number(doctor.clinicId) === Number(clinicId))
      : mockDoctors,
  };
}

export function createMockReferral({ patientId, type, reason, toClinicId, toDoctorId }) {
  const toClinic = mockClinics.find((clinic) => Number(clinic.id) === Number(toClinicId)) || null;
  const toDoctor = mockDoctors.find((doctor) => Number(doctor.id) === Number(toDoctorId)) || null;
  const referral = {
    id: nextReferralId++,
    patientId: Number(patientId),
    patient: { user: { full_name: patientNames[patientId] || `Patient #${patientId}` } },
    fromDoctorId: 1,
    toClinic,
    toDoctor,
    type,
    reason,
    status: "PENDING",
    expiresAt: addDays(type === "FOLLOW_UP" ? 14 : 30),
    createdAt: new Date().toISOString(),
  };

  sentReferrals = [referral, ...sentReferrals];
  return referral;
}

export function getMockSentReferrals({ page = 1, limit = 10 } = {}) {
  const start = (page - 1) * limit;
  const data = sentReferrals.slice(start, start + limit);
  return {
    data,
    meta: {
      total: sentReferrals.length,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(sentReferrals.length / limit)),
    },
  };
}
