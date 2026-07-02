export const mockDoctorClinicAssignments = {
  1: [1, 2, 4],
  2: [2, 5],
  3: [3],
  4: [1, 4],
  5: [1, 2, 4, 5],
  6: [3],
};

export function getClinicIdsForDoctor(doctorId) {
  return mockDoctorClinicAssignments[doctorId] ?? [];
}

export function getDoctorIdsForClinic(clinicId) {
  return Object.entries(mockDoctorClinicAssignments)
    .filter(([, clinicIds]) => clinicIds.includes(Number(clinicId)))
    .map(([doctorId]) => Number(doctorId));
}
