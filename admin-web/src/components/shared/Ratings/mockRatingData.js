export const mockRatings = [
  {
    id: 8001,
    patientProfileId: 1,
    doctorProfileId: 1,
    appointmentId: 1004,
    score: 5,
    comment:
      "Dr. Jenkins explained the medication changes clearly and answered every question.",
    status: "visible",
    createdAt: "2026-06-18T15:10:00.000Z",
    updatedAt: "2026-06-18T15:10:00.000Z",
    patientProfile: {
      id: 1,
      user: {
        full_name: "Layla Hassan",
        email: "layla.hassan@example.com",
      },
    },
    doctorProfile: {
      id: 1,
      user: {
        full_name: "Dr. Sarah Jenkins",
        email: "sarah.jenkins@clinic.com",
      },
    },
    appointment: {
      id: 1004,
      requestedDate: "2026-06-18",
      type: "Return Visit",
      clinic: {
        id: 4,
        name: "Bayview Clinic",
      },
    },
  },
  {
    id: 8002,
    patientProfileId: 2,
    doctorProfileId: 2,
    appointmentId: 1008,
    score: 4,
    comment: "Helpful follow-up visit. The plan was practical and easy to follow.",
    status: "visible",
    createdAt: "2026-06-10T11:20:00.000Z",
    updatedAt: "2026-06-10T11:20:00.000Z",
    patientProfile: {
      id: 2,
      user: {
        full_name: "Daniel Murphy",
        email: "daniel.murphy@example.com",
      },
    },
    doctorProfile: {
      id: 2,
      user: {
        full_name: "Dr. Robert Chen",
        email: "robert.chen@clinic.com",
      },
    },
    appointment: {
      id: 1008,
      requestedDate: "2026-06-10",
      type: "Return Visit",
      clinic: {
        id: 5,
        name: "Greenfield Clinic",
      },
    },
  },
  {
    id: 8003,
    patientProfileId: 3,
    doctorProfileId: 5,
    appointmentId: 1007,
    score: 3,
    comment: "The visit was fine, but I had to wait longer than expected.",
    status: "visible",
    createdAt: "2026-07-15T16:00:00.000Z",
    updatedAt: "2026-07-15T16:00:00.000Z",
    patientProfile: {
      id: 3,
      user: {
        full_name: "Maya Brooks",
        email: "maya.brooks@example.com",
      },
    },
    doctorProfile: {
      id: 5,
      user: {
        full_name: "Dr. Aisha Khan",
        email: "aisha.khan@clinic.com",
      },
    },
    appointment: {
      id: 1007,
      requestedDate: "2026-07-15",
      type: "Initial Visit",
      clinic: {
        id: 5,
        name: "Greenfield Clinic",
      },
    },
  },
  {
    id: 8004,
    patientProfileId: 4,
    doctorProfileId: 3,
    appointmentId: 1005,
    score: 2,
    comment:
      "This review was hidden during moderation because it included claims that need review.",
    status: "hidden",
    createdAt: "2026-06-24T17:00:00.000Z",
    updatedAt: "2026-06-25T09:00:00.000Z",
    patientProfile: {
      id: 4,
      user: {
        full_name: "Noah Carter",
        email: "noah.carter@example.com",
      },
    },
    doctorProfile: {
      id: 3,
      user: {
        full_name: "Dr. Emily Davis",
        email: "emily.davis@clinic.com",
      },
    },
    appointment: {
      id: 1005,
      requestedDate: "2026-06-24",
      type: "Initial Visit",
      clinic: {
        id: 3,
        name: "Lakeside Clinic",
      },
    },
  },
  {
    id: 8005,
    patientProfileId: 5,
    doctorProfileId: 4,
    appointmentId: 1006,
    score: 1,
    comment: "Deleted review kept for audit visibility in admin tools.",
    status: "deleted",
    createdAt: "2026-06-20T12:30:00.000Z",
    updatedAt: "2026-06-21T08:45:00.000Z",
    patientProfile: {
      id: 5,
      user: {
        full_name: "Ava Thompson",
        email: "ava.thompson@example.com",
      },
    },
    doctorProfile: {
      id: 4,
      user: {
        full_name: "Dr. Michael Brown",
        email: "michael.brown@clinic.com",
      },
    },
    appointment: {
      id: 1006,
      requestedDate: "2026-06-20",
      type: "Return Visit",
      clinic: {
        id: 4,
        name: "Bayview Clinic",
      },
    },
  },
];

export const mockRatingReports = [
  {
    id: 9101,
    ratingId: 8004,
    reporterPatientId: 1,
    reason: "inappropriate",
    explanation: "The review contains personal accusations that should be checked.",
    status: "pending",
    resolvedAt: null,
    resolvedByAdminId: null,
    createdAt: "2026-06-25T10:20:00.000Z",
    updatedAt: "2026-06-25T10:20:00.000Z",
    rating: mockRatings.find((rating) => rating.id === 8004),
    reporterPatient: {
      id: 1,
      user: {
        full_name: "Layla Hassan",
        email: "layla.hassan@example.com",
      },
    },
  },
  {
    id: 9102,
    ratingId: 8003,
    reporterPatientId: 2,
    reason: "spam",
    explanation: "Looks repetitive and not related to the visit.",
    status: "dismissed",
    resolvedAt: "2026-07-16T09:00:00.000Z",
    resolvedByAdminId: 1,
    createdAt: "2026-07-15T18:30:00.000Z",
    updatedAt: "2026-07-16T09:00:00.000Z",
    rating: mockRatings.find((rating) => rating.id === 8003),
    reporterPatient: {
      id: 2,
      user: {
        full_name: "Daniel Murphy",
        email: "daniel.murphy@example.com",
      },
    },
  },
  {
    id: 9103,
    ratingId: 8005,
    reporterPatientId: 3,
    reason: "abusive",
    explanation: "The original review included abusive wording.",
    status: "resolved",
    resolvedAt: "2026-06-21T08:45:00.000Z",
    resolvedByAdminId: 2,
    createdAt: "2026-06-20T15:10:00.000Z",
    updatedAt: "2026-06-21T08:45:00.000Z",
    rating: mockRatings.find((rating) => rating.id === 8005),
    reporterPatient: {
      id: 3,
      user: {
        full_name: "Maya Brooks",
        email: "maya.brooks@example.com",
      },
    },
  },
];
