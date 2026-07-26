import {
  profileCardBody,
  profileCardLabel,
  profileCardShell,
  profileCardValue,
  sharedSurfaceShell,
} from "@/components/shared/styles";

import {
  formatCurrency,
  formatDoctorStatus,
  formatEnumLabel,
  formatLanguagesSpoken,
} from "../Admin/Doctors/doctorUtils";
import { getCurrentDoctor } from "./doctorPortalData";

function InfoCard({ label, value }) {
  return (
    <div className={profileCardShell}>
      <p className={profileCardLabel}>{label}</p>
      <p className={profileCardValue}>{value}</p>
    </div>
  );
}

export default function DoctorProfile() {
  const doctor = getCurrentDoctor();

  return (
    <div className="space-y-6">
      <section className={sharedSurfaceShell}>
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
              {doctor?.user?.full_name}
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              {doctor?.specialization}
              {doctor?.subSpecialization ? ` - ${doctor.subSpecialization}` : ""}
            </p>
          </div>

          <div className="rounded-lg bg-[var(--color-primary-light)] px-3 py-2 text-sm font-medium text-[var(--color-primary)]">
            {formatDoctorStatus(doctor?.status)}
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <InfoCard label="Email" value={doctor?.user?.email} />
        <InfoCard label="Phone" value={doctor?.user?.phone} />
        <InfoCard label="License Number" value={doctor?.licenseNumber} />
        <InfoCard label="Experience" value={`${doctor?.experienceYears} years`} />
        <InfoCard label="Average Rating" value={doctor?.averageRating?.toFixed(1)} />
        <InfoCard label="Clinics" value={doctor?.clinics_count} />
        <InfoCard
          label="Languages"
          value={formatLanguagesSpoken(doctor?.languagesSpoken)}
        />
        <InfoCard
          label="Initial Visit Fee"
          value={formatCurrency(doctor?.initialVisitFee)}
        />
        <InfoCard
          label="Return Visit Fee"
          value={formatCurrency(doctor?.returnVisitFee)}
        />
        <InfoCard label="Gender" value={formatEnumLabel(doctor?.user?.gender)} />
        <InfoCard label="Age" value={doctor?.user?.age} />
        <InfoCard
          label="Preferred Language"
          value={doctor?.user?.preferredLanguage}
        />

        <div className={`${profileCardShell} md:col-span-2 xl:col-span-3`}>
          <p className={profileCardLabel}>Address</p>
          <p className={profileCardValue}>{doctor?.user?.address}</p>
        </div>

        <div className={`${profileCardShell} md:col-span-2 xl:col-span-3`}>
          <p className={profileCardLabel}>Bio</p>
          <p className={profileCardBody}>{doctor?.bio}</p>
        </div>
      </section>
    </div>
  );
}
