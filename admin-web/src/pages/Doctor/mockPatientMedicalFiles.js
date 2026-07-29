const files = {
  1: {
    id: 1,
    user: { fullName: "Ahmad Mohammad Ali", phone: "+963 933 123 456", email: "ahmad.ali@example.com", gender: "Male", birthDate: "1991-05-15" },
    medicalProfile: {
      bloodType: "A+", allergies: ["Penicillin", "Peanuts"], chronicConditions: ["Hypertension"], currentMedications: ["Lisinopril 10 mg once daily"], pastSurgeries: ["Appendectomy (2015)"], familyHistory: ["Diabetes — father"], lifestyleHabits: ["Non-smoker", "Walks three times weekly"], vaccinationStatus: ["Influenza — current", "Tetanus — current"], currentSymptoms: "Intermittent chest discomfort after exertion.", disabilityInfo: "None reported", pregnancyStatus: null,
    },
    medicalHistories: [
      { id: 101, appointmentId: 801, date: "2026-07-12", clinicName: "Central Medical Clinic", doctorName: "Dr. Sarah Wilson", diagnosis: "Hypertension follow-up", treatmentPlan: "Continue current medication and review home blood-pressure readings.", doctorNotes: "No red-flag symptoms reported. Encourage salt reduction.", medicines: ["Lisinopril 10 mg", "Vitamin D 1,000 IU"], attachmentCount: 1 },
      { id: 102, appointmentId: 724, date: "2026-04-28", clinicName: "Central Medical Clinic", doctorName: "Dr. Lina Haddad", diagnosis: "Seasonal allergic rhinitis", treatmentPlan: "Use antihistamine as needed and avoid known triggers.", doctorNotes: "Symptoms expected to improve with seasonal precautions.", medicines: ["Cetirizine 10 mg as needed"], attachmentCount: 0 },
    ],
    attachments: [
      { id: 1, originalName: "blood-pressure-log.pdf", type: "PDF", size: "186 KB", source: "Profile", createdAt: "2026-07-10" },
      { id: 2, originalName: "cardiology-referral.pdf", type: "PDF", size: "240 KB", source: "Consultation", createdAt: "2026-07-12", historyId: 101 },
    ],
    profileChanges: [
      { id: 1, fieldName: "Allergies", oldValue: "Penicillin", newValue: "Penicillin, Peanuts", reason: "Patient reported a confirmed food allergy.", changedBy: "Dr. Sarah Wilson", createdAt: "2026-07-12" },
      { id: 2, fieldName: "Current medications", oldValue: "None", newValue: "Lisinopril 10 mg once daily", reason: "Medication reconciliation during follow-up.", changedBy: "Dr. Sarah Wilson", createdAt: "2026-07-12" },
    ],
  },
  2: {
    id: 2,
    user: { fullName: "Fatima Hassan Ibrahim", phone: "+963 944 987 654", email: "fatima.hassan@example.com", gender: "Female", birthDate: "1998-09-02" },
    medicalProfile: { bloodType: "O+", allergies: [], chronicConditions: [], currentMedications: [], pastSurgeries: [], familyHistory: [], lifestyleHabits: ["Non-smoker"], vaccinationStatus: ["Routine vaccinations reported current"], currentSymptoms: "No active symptoms recorded.", disabilityInfo: "None reported", pregnancyStatus: "NOT_PREGNANT" },
    medicalHistories: [], attachments: [], profileChanges: [],
  },
  3: {
    id: 3,
    user: { fullName: "Omar Khaled Al-Mahmoud", phone: "+963 955 456 789", email: "omar.mahmoud@example.com", gender: "Male", birthDate: "1983-01-20" },
    medicalProfile: { bloodType: "B+", allergies: ["Latex"], chronicConditions: ["Type 2 diabetes"], currentMedications: ["Metformin 500 mg twice daily"], pastSurgeries: [], familyHistory: ["Hypertension — mother"], lifestyleHabits: ["Former smoker"], vaccinationStatus: [], currentSymptoms: "Reports fatigue over the last week.", disabilityInfo: "None reported", pregnancyStatus: null },
    medicalHistories: [{ id: 103, appointmentId: 610, date: "2026-06-03", clinicName: "Specialist Care Clinic", doctorName: "Dr. Omar Khalil", diagnosis: "Type 2 diabetes review", treatmentPlan: "Continue medication and arrange HbA1c test.", doctorNotes: "Discussed diet and activity targets.", medicines: ["Metformin 500 mg twice daily"], attachmentCount: 0 }],
    attachments: [{ id: 3, originalName: "hba1c-result.pdf", type: "PDF", size: "112 KB", source: "Consultation", createdAt: "2026-06-03", historyId: 103 }], profileChanges: [],
  },
  4: {
    id: 4,
    user: { fullName: "Sara Abdullah Khoury", phone: "+963 988 321 654", email: "sara.khoury@example.com", gender: "Female", birthDate: "2001-03-12" },
    medicalProfile: { bloodType: "AB+", allergies: [], chronicConditions: [], currentMedications: [], pastSurgeries: [], familyHistory: [], lifestyleHabits: [], vaccinationStatus: [], currentSymptoms: "No active symptoms recorded.", disabilityInfo: "None reported", pregnancyStatus: "NOT_PREGNANT" },
    medicalHistories: [], attachments: [], profileChanges: [],
  },
  5: {
    id: 5,
    user: { fullName: "Samer Tarek Al-Abdullah", phone: "+963 991 789 123", email: "samer.abdullah@example.com", gender: "Male", birthDate: "1976-11-08" },
    medicalProfile: { bloodType: "O-", allergies: ["Sulfa medication"], chronicConditions: ["Asthma"], currentMedications: ["Salbutamol inhaler as needed"], pastSurgeries: [], familyHistory: [], lifestyleHabits: ["Non-smoker"], vaccinationStatus: [], currentSymptoms: "No active symptoms recorded.", disabilityInfo: "None reported", pregnancyStatus: null },
    medicalHistories: [], attachments: [], profileChanges: [],
  },
};

export function getMockPatientMedicalFile(patientId) {
  return files[Number(patientId)] ?? null;
}
