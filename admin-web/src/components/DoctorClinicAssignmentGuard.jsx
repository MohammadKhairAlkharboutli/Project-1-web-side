import { AlertCircle, Building2, LoaderCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";

import { doctorClinicsApi } from "@/api/doctorClinicsApi";
import { doctorsApi } from "@/api/doctorsApi";
import { DoctorClinicAssignmentContext } from "@/context/DoctorClinicAssignmentContext";
import { Button } from "@/components/ui/button";

function getErrorMessage(error) {
  const message = error?.response?.data?.message || error?.message;
  return Array.isArray(message) ? message.join(" ") : message;
}

export default function DoctorClinicAssignmentGuard() {
  const location = useLocation();
  const [state, setState] = useState({ status: "loading", isAssigned: false, clinic: null, error: "" });

  async function refreshClinicAssignment() {
    setState({ status: "loading", isAssigned: false, clinic: null, error: "" });

    try {
      const { profile } = await doctorsApi.getOwnProfile();
      const clinics = await doctorClinicsApi.getClinicsForDoctor(profile.id);
      setState({ status: "ready", isAssigned: clinics.length > 0, clinic: clinics[0] || null, error: "" });
      return clinics.length > 0;
    } catch (error) {
      setState({
        status: "error",
        isAssigned: false, clinic: null,
        error: getErrorMessage(error) || "We could not verify your clinic assignment.",
      });
      return false;
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialAssignment() {
      try {
        const { profile } = await doctorsApi.getOwnProfile();
        const clinics = await doctorClinicsApi.getClinicsForDoctor(profile.id);
        if (isMounted) {
          setState({ status: "ready", isAssigned: clinics.length > 0, clinic: clinics[0] || null, error: "" });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            status: "error",
            isAssigned: false, clinic: null,
            error: getErrorMessage(error) || "We could not verify your clinic assignment.",
          });
        }
      }
    }

    loadInitialAssignment();
    return () => {
      isMounted = false;
    };
  }, []);

  if (state.status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-sm font-medium text-slate-600">
        <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-blue-600" aria-hidden="true" />
        Checking your clinic assignment…
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
          <AlertCircle className="h-8 w-8 text-amber-500" aria-hidden="true" />
          <h1 className="mt-4 text-lg font-bold text-slate-900">Clinic assignment unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{state.error}</p>
          <Button type="button" className="mt-6" onClick={refreshClinicAssignment}>Try again</Button>
        </section>
      </main>
    );
  }

  const isAllowedWithoutClinic = ["/doctor/profile", "/doctor/settings"].includes(location.pathname);

  if (!state.isAssigned && !isAllowedWithoutClinic) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 text-center shadow-xl shadow-slate-200/60">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <Building2 className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-amber-600">Clinic assignment required</p>
          <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900">Your workspace is not available yet.</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            You must be assigned to a clinic by an administrator before you can use the application.
          </p>
          <Button className="mt-6" asChild>
            <Link to="/doctor/profile">View profile</Link>
          </Button>
        </section>
      </main>
    );
  }

  return (
    <DoctorClinicAssignmentContext.Provider value={{ isClinicAssigned: state.isAssigned, assignedClinic: state.clinic, refreshClinicAssignment }}>
      <Outlet />
    </DoctorClinicAssignmentContext.Provider>
  );
}
