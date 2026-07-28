import { useParams } from "react-router-dom";

import PrescriptionCard from "@/components/shared/Prescriptions/PrescriptionCard";
import {
  profileCardLabel,
  profileCardShell,
  profileCardValue,
  sharedEmptyStateShell,
} from "@/components/shared/styles";

import { patients } from "../PatientData";
import { formatEnumLabel, formatOptionalValue } from "./patientUtils";
import MedicalAttachmentsTable from "./components/MedicalAttachmentsTable";

export default function PatientMedicalInfo() {
  const { patientId } = useParams();
  const patient = patients.find((item) => String(item.id) === patientId);

  if (!patient) {
    return null;
  }

  const profileMedicines = patient.prescribedMedicines?.profileMedicines || [];
  const profileAttachments = patient.medicalAttachments?.profileAttachments || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Medical Info
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Medical profile details associated with this patient record.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className={profileCardShell}>
          <p className={profileCardLabel}>Blood Type</p>
          <p className={profileCardValue}>
            {formatOptionalValue(patient.medicalProfile?.bloodType)}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>Pregnancy Status</p>
          <p className={profileCardValue}>
            {formatEnumLabel(patient.medicalProfile?.pregnancyStatus)}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>Disability Info</p>
          <p className={profileCardValue}>
            {formatOptionalValue(patient.medicalProfile?.disabilityInfo)}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>Current Symptoms</p>
          <p className={profileCardValue}>
            {formatOptionalValue(patient.medicalProfile?.currentSymptoms)}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>Allergies</p>
          <p className={profileCardValue}>
            {formatOptionalValue(patient.medicalProfile?.allergies)}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>Chronic Conditions</p>
          <p className={profileCardValue}>
            {formatOptionalValue(patient.medicalProfile?.chronicConditions)}
          </p>
        </div>

        <div className={`${profileCardShell} md:col-span-2 xl:col-span-3`}>
          <p className={profileCardLabel}>Past Surgeries</p>
          <p className={profileCardValue}>
            {formatOptionalValue(patient.medicalProfile?.pastSurgeries)}
          </p>
        </div>

        <div className={`${profileCardShell} md:col-span-2 xl:col-span-3`}>
          <p className={profileCardLabel}>Family History</p>
          <p className={profileCardValue}>
            {formatOptionalValue(patient.medicalProfile?.familyHistory)}
          </p>
        </div>

        <div className={`${profileCardShell} md:col-span-2 xl:col-span-3`}>
          <p className={profileCardLabel}>Current Medications</p>
          <p className={profileCardValue}>
            {formatOptionalValue(patient.medicalProfile?.currentMedications)}
          </p>
        </div>

        <div className={`${profileCardShell} md:col-span-2 xl:col-span-3`}>
          <p className={profileCardLabel}>Lifestyle Habits</p>
          <p className={profileCardValue}>
            {formatOptionalValue(patient.medicalProfile?.lifestyleHabits)}
          </p>
        </div>

        <div className={profileCardShell}>
          <p className={profileCardLabel}>Vaccination Status</p>
          <p className={profileCardValue}>
            {formatOptionalValue(patient.medicalProfile?.vaccinationStatus)}
          </p>
        </div>
      </div>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">
            Current Medications
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Profile-level medicines currently associated with this patient.
          </p>
        </div>

        {profileMedicines.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {profileMedicines.map((medicine) => (
              <PrescriptionCard key={medicine.id} medicine={medicine} />
            ))}
          </div>
        ) : (
          <div className={`${sharedEmptyStateShell} p-5`}>
            <p className="text-sm font-medium text-slate-700">
              No current medications.
            </p>
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold tracking-tight text-slate-900">
            Medical Attachments
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Documents attached to this patient&apos;s medical profile.
          </p>
        </div>

        <MedicalAttachmentsTable
          attachments={profileAttachments}
          emptyMessage="No medical profile attachments."
        />
      </section>
    </div>
  );
}
