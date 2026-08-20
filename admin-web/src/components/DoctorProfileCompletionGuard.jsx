import { AlertCircle, LoaderCircle, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";

import { authApi } from "@/api/authApi";
import { doctorsApi } from "@/api/doctorsApi";
import { Button } from "@/components/ui/button";
import { DoctorProfileCompletionContext } from "@/context/DoctorProfileCompletionContext";
import { normalizeDoctorProfileCompletionStatus } from "@/lib/doctorProfileCompletion";

function getErrorMessage(error) {
  const message = error?.response?.data?.message || error?.message;
  return Array.isArray(message) ? message.join(" ") : message;
}

export default function DoctorProfileCompletionGuard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [state, setState] = useState({ status: "loading", isComplete: false, error: "" });

  async function checkCompletion() {
    setState({ status: "loading", isComplete: false, error: "" });
    try {
      const result = await doctorsApi.getOwnProfile();
      const completionStatus = normalizeDoctorProfileCompletionStatus(result?.completionStatus);
      setState({
        status: "ready",
        isComplete: completionStatus.isComplete,
        error: "",
      });
      return completionStatus.isComplete;
    } catch (error) {
      setState({
        status: "error",
        isComplete: false,
        error: getErrorMessage(error) || "We could not verify your profile status.",
      });
      return false;
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialCompletion() {
      try {
        const result = await doctorsApi.getOwnProfile();
        const completionStatus = normalizeDoctorProfileCompletionStatus(result?.completionStatus);
        if (isMounted) {
          setState({
            status: "ready",
            isComplete: completionStatus.isComplete,
            error: "",
          });
        }
      } catch (error) {
        if (isMounted) {
          setState({
            status: "error",
            isComplete: false,
            error: getErrorMessage(error) || "We could not verify your profile status.",
          });
        }
      }
    }

    loadInitialCompletion();
    return () => {
      isMounted = false;
    };
  }, []);

  async function signOut() {
    try {
      await authApi.logout();
    } finally {
      navigate("/login", { replace: true });
    }
  }

  if (state.status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 text-sm font-medium text-slate-600">
        <LoaderCircle className="mr-3 h-5 w-5 animate-spin text-blue-600" aria-hidden="true" />
        Checking your profile…
      </main>
    );
  }

  if (state.status === "error") {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60">
          <AlertCircle className="h-8 w-8 text-amber-500" aria-hidden="true" />
          <h1 className="mt-4 text-lg font-bold text-slate-900">Profile status unavailable</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">{state.error}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button type="button" onClick={checkCompletion}>Try again</Button>
            <Button type="button" variant="outline" onClick={signOut}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Sign out
            </Button>
          </div>
        </section>
      </main>
    );
  }

  if (!state.isComplete && location.pathname !== "/doctor/profile") {
    return <Navigate to="/doctor/profile" replace state={{ completionRequired: true }} />;
  }

  return (
    <DoctorProfileCompletionContext.Provider value={{ refreshProfileCompletion: checkCompletion }}>
      <Outlet />
    </DoctorProfileCompletionContext.Provider>
  );
}
