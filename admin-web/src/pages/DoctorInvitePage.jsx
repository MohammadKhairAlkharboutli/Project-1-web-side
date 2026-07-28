import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, LoaderCircle, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { z } from "zod";

import { doctorInvitationsApi } from "@/api/doctorInvitationsApi";
import { authApi } from "@/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const doctorRegistrationSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required."),
    lastName: z.string().trim().min(1, "Last name is required."),
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message || error?.message || fallback;
  return Array.isArray(message) ? message.join(" ") : message;
}

function InviteShell({ children }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-8">
      <section className="w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
        <div className="border-b border-slate-200 bg-slate-50 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--color-primary)] font-bold text-white">
              T
            </div>
            <div>
              <p className="font-semibold text-slate-900">Tabibi</p>
              <p className="text-sm text-slate-500">Doctor invitation</p>
            </div>
          </div>
        </div>
        {children}
      </section>
    </main>
  );
}

export default function DoctorInvitePage() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isRejecting = searchParams.get("action") === "reject";
  const [invitation, setInvitation] = useState(null);
  const [validationError, setValidationError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRejectSubmitting, setIsRejectSubmitting] = useState(false);
  const [rejectError, setRejectError] = useState("");
  const [isRejected, setIsRejected] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(doctorRegistrationSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    },
  });
  const [registrationError, setRegistrationError] = useState("");

  useEffect(() => {
    let isMounted = true;

    async function validateInvitation() {
      if (!token) {
        if (isMounted) {
          setValidationError("This invitation link is invalid.");
          setIsLoading(false);
        }
        return;
      }

      try {
        const result = await doctorInvitationsApi.validate(token);
        if (isMounted) {
          setInvitation(result);
        }
      } catch (error) {
        if (isMounted) {
          setValidationError(
            getErrorMessage(error, "This invitation is no longer available."),
          );
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    validateInvitation();

    return () => {
      isMounted = false;
    };
  }, [token]);

  async function registerDoctor({ firstName, lastName, password }) {
    if (!token) {
      return;
    }

    setRegistrationError("");

    try {
      const authResponse = await doctorInvitationsApi.register(token, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        password,
      });
      authApi.storeSession(authResponse);
      navigate("/doctor/profile", { replace: true });
    } catch (error) {
      setRegistrationError(
        getErrorMessage(error, "We could not create your doctor account."),
      );
    }
  }

  async function rejectInvitation() {
    if (!token) {
      return;
    }

    setIsRejectSubmitting(true);
    setRejectError("");

    try {
      await doctorInvitationsApi.reject(token);
      setIsRejected(true);
    } catch (error) {
      setRejectError(
        getErrorMessage(error, "We could not reject this invitation."),
      );
    } finally {
      setIsRejectSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <InviteShell>
        <div className="flex items-center gap-3 px-6 py-10 text-sm text-slate-600">
          <LoaderCircle className="animate-spin text-[var(--color-primary)]" />
          Checking your invitation…
        </div>
      </InviteShell>
    );
  }

  if (validationError) {
    return (
      <InviteShell>
        <div className="space-y-4 px-6 py-8">
          <ShieldCheck className="h-9 w-9 text-red-500" />
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Invitation unavailable</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">{validationError}</p>
          </div>
        </div>
      </InviteShell>
    );
  }

  if (isRejecting) {
    return (
      <InviteShell>
        <div className="space-y-5 px-6 py-7">
          {isRejected ? (
            <>
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Invitation rejected</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  You will not receive an account from this invitation.
                </p>
              </div>
            </>
          ) : (
            <>
              <div>
                <h1 className="text-xl font-semibold text-slate-900">Reject invitation?</h1>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  You are declining the doctor invitation sent to {invitation?.email}.
                </p>
              </div>

              {rejectError ? (
                <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {rejectError}
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" onClick={() => navigate(`/doctor-invite/${token}`, { replace: true })} disabled={isRejectSubmitting}>
                  Go back
                </Button>
                <Button type="button" variant="destructive" onClick={rejectInvitation} disabled={isRejectSubmitting}>
                  {isRejectSubmitting ? <LoaderCircle className="animate-spin" /> : null}
                  {isRejectSubmitting ? "Rejecting..." : "Reject invitation"}
                </Button>
              </div>
            </>
          )}
        </div>
      </InviteShell>
    );
  }

  return (
    <InviteShell>
      <form className="space-y-5 px-6 py-7" onSubmit={handleSubmit(registerDoctor)} noValidate>
        <div>
          <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[var(--color-primary)]">
            <UserRound />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Create your doctor account</h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            You were invited to join Tabibi as a doctor using {invitation?.email}.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            First name
            <Input autoComplete="given-name" aria-invalid={Boolean(errors.firstName)} {...register("firstName")} />
            {errors.firstName?.message ? <span className="text-xs font-normal text-red-600">{errors.firstName.message}</span> : null}
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Last name
            <Input autoComplete="family-name" aria-invalid={Boolean(errors.lastName)} {...register("lastName")} />
            {errors.lastName?.message ? <span className="text-xs font-normal text-red-600">{errors.lastName.message}</span> : null}
          </label>
        </div>

        <label className="grid gap-1.5 text-sm font-medium text-slate-700">
          Password
          <Input type="password" autoComplete="new-password" aria-invalid={Boolean(errors.password)} {...register("password")} />
          {errors.password?.message ? <span className="text-xs font-normal text-red-600">{errors.password.message}</span> : null}
        </label>

        <label className="grid gap-1.5 text-sm font-medium text-slate-700">
          Confirm password
          <Input type="password" autoComplete="new-password" aria-invalid={Boolean(errors.confirmPassword)} {...register("confirmPassword")} />
          {errors.confirmPassword?.message ? <span className="text-xs font-normal text-red-600">{errors.confirmPassword.message}</span> : null}
        </label>

        {registrationError ? (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {registrationError}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? <LoaderCircle className="animate-spin" /> : null}
          {isSubmitting ? "Creating account..." : "Create doctor account"}
        </Button>
      </form>
    </InviteShell>
  );
}
