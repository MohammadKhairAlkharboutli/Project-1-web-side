import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

import { createMockReferral, getMockReferralDestinations } from "./mockReferralData";

function getErrorMessage(error, fallback) {
  const message = error.response?.data?.message;
  return Array.isArray(message) ? message.join(" ") : message || fallback;
}

function getDoctorName(doctor) {
  const user = doctor?.user;
  return user?.full_name || user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || "Unnamed doctor";
}

const EMPTY_FORM = {
  type: "EXTERNAL",
  reason: "",
  toClinicId: "",
  toDoctorId: "",
};

export default function ReferralDialog({ open, onOpenChange, appointment, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [clinics, setClinics] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return undefined;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setIsLoadingOptions(true);
      setError("");
      try {
        const { clinics: nextClinics, doctors: nextDoctors } = getMockReferralDestinations();
        if (!cancelled) {
          setClinics(nextClinics);
          setDoctors(nextDoctors);
        }
      } catch (requestError) {
        if (!cancelled) setError(getErrorMessage(requestError, "Unable to load referral destinations."));
      } finally {
        if (!cancelled) setIsLoadingOptions(false);
      }
    }, 0);

    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [open]);

  async function handleClinicChange(clinicId) {
    setForm((current) => ({ ...current, toClinicId: clinicId, toDoctorId: "" }));
    if (!clinicId) return;

    setIsLoadingOptions(true);
    setError("");
    try {
      setDoctors(getMockReferralDestinations(clinicId).doctors);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load doctors for this clinic."));
    } finally {
      setIsLoadingOptions(false);
    }
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (!appointment?.patientId) {
      setError("This consultation does not have a valid patient.");
      return;
    }
    if (!form.reason.trim()) {
      setError("Referral reason is required.");
      return;
    }
    if (form.type === "EXTERNAL" && !form.toClinicId && !form.toDoctorId) {
      setError("Choose a target clinic or doctor for an external referral.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        patientId: Number(appointment.patientId),
        type: form.type,
        reason: form.reason.trim(),
      };
      if (form.type === "EXTERNAL" && form.toClinicId) payload.toClinicId = Number(form.toClinicId);
      if (form.type === "EXTERNAL" && form.toDoctorId) payload.toDoctorId = Number(form.toDoctorId);

      const referral = createMockReferral(payload);
      onCreated(referral);
      setForm(EMPTY_FORM);
      onOpenChange(false);
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to create this referral."));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!isSubmitting) onOpenChange(nextOpen); }}>
      <DialogContent className="sm:max-w-lg" showCloseButton={!isSubmitting}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create referral</DialogTitle>
            <DialogDescription>
              This referral is linked to the patient in the current consultation.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 p-5">
            {error && <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Referral type
              <NativeSelect value={form.type} disabled={isSubmitting} onChange={(event) => setForm({ ...EMPTY_FORM, type: event.target.value })}>
                <NativeSelectOption value="EXTERNAL">External referral</NativeSelectOption>
                <NativeSelectOption value="FOLLOW_UP">Follow-up with me</NativeSelectOption>
              </NativeSelect>
            </label>
            {form.type === "EXTERNAL" && <>
              <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                Target clinic <span className="font-normal text-slate-500">(optional if doctor is selected)</span>
                <NativeSelect value={form.toClinicId} disabled={isSubmitting || isLoadingOptions} onChange={(event) => handleClinicChange(event.target.value)}>
                  <NativeSelectOption value="">Choose a clinic</NativeSelectOption>
                  {clinics.map((clinic) => <NativeSelectOption key={clinic.id} value={String(clinic.id)}>{clinic.name}</NativeSelectOption>)}
                </NativeSelect>
              </label>
              <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                Target doctor <span className="font-normal text-slate-500">(optional if clinic is selected)</span>
                <NativeSelect value={form.toDoctorId} disabled={isSubmitting || isLoadingOptions} onChange={(event) => setForm((current) => ({ ...current, toDoctorId: event.target.value }))}>
                  <NativeSelectOption value="">Choose a doctor</NativeSelectOption>
                  {doctors.map((doctor) => <NativeSelectOption key={doctor.id} value={String(doctor.id)}>{getDoctorName(doctor)}</NativeSelectOption>)}
                </NativeSelect>
              </label>
            </>}
            <label className="grid gap-1.5 text-sm font-medium text-slate-700">
              Reason
              <textarea rows={4} value={form.reason} disabled={isSubmitting} onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value }))} placeholder="Clinical reason for this referral" className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-[var(--color-primary)] focus:ring-3 focus:ring-blue-100" />
            </label>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={isSubmitting} onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || isLoadingOptions}>{isSubmitting ? "Creating…" : "Create referral"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
