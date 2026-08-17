import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import { useParams } from "react-router-dom";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const DEMO_INVITED_EMAIL = "doctor@example.com";

const doctorInviteSignupSchema = z
  .object({
    firstName: z.string().trim().min(1, "First name is required"),
    lastName: z.string().trim().min(1, "Last name is required"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine(({ password, confirmPassword }) => password === confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

function FieldError({ message }) {
  if (!message) {
    return null;
  }

  return <p className="mt-1.5 text-xs font-medium text-rose-600">{message}</p>;
}

function PasswordField({ id, label, error, registration }) {
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-xs font-bold text-slate-700">
        {label}
      </label>
      <div className="relative">
        <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          id={id}
          type={visible ? "text" : "password"}
          autoComplete={id === "password" ? "new-password" : "new-password"}
          aria-invalid={Boolean(error)}
          className="bg-muted py-2 pl-10 pr-11"
          {...registration}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => setVisible((current) => !current)}
          aria-label={visible ? "Hide password" : "Show password"}
          className="absolute right-1 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
        >
          {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
      </div>
      <FieldError message={error?.message} />
    </div>
  );
}

function SignupSuccess() {
  return (
    <div className="w-full max-w-lg rounded-lg border border-emerald-100 bg-card p-8 text-center shadow-raised sm:p-10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-lg bg-success-soft text-success">
        <CheckCircle2 className="h-9 w-9" />
      </div>
      <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-success">
        Signup form complete
      </p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        Your account setup is ready.
      </h1>
      <p className="mt-4 text-sm leading-6 text-slate-600">
        This preview does not create an account yet. The invitation and account-creation connection will be enabled when the backend integration is added.
      </p>
      <div className="mt-7 rounded-lg border border-blue-100 bg-primary-light p-4 text-left">
        <p className="text-xs font-bold text-blue-900">What happens after connection?</p>
        <p className="mt-1 text-xs leading-5 text-blue-700">
          You will be signed in automatically and guided to complete your doctor profile.
        </p>
      </div>
    </div>
  );
}

export default function DoctorInviteSignupPage() {
  const { token } = useParams();
  const [isComplete, setIsComplete] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(doctorInviteSignupSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  function handleValidSubmit() {
    // Backend connection will validate token and create the doctor account here.
    setIsComplete(true);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 text-foreground sm:px-6">
      <div className="w-full max-w-5xl">
        <div className="mb-6 flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Stethoscope className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xl font-semibold tracking-tight text-slate-900">Tabibi</p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Clinical Systems</p>
          </div>
        </div>

        {isComplete ? (
          <div className="flex justify-center">
            <SignupSuccess />
          </div>
        ) : (
          <div className="grid overflow-hidden rounded-xl border border-slate-200 bg-card shadow-raised lg:grid-cols-[0.9fr_1.1fr]">
            <section className="relative overflow-hidden bg-primary p-8 text-primary-foreground sm:p-10">
              <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
              <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full border-[28px] border-white/10" />
              <div className="relative flex h-full flex-col">
                <div className="flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold backdrop-blur-sm">
                  <ShieldCheck className="h-4 w-4" />
                  Secure doctor invitation
                </div>
                <div className="my-auto py-12 lg:py-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">Welcome to Tabibi</p>
                  <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">
                    Create your doctor account.
                  </h1>
                  <p className="mt-5 max-w-sm text-sm leading-6 text-blue-100">
                    Set up your secure account now. You will complete your personal and professional profile after signup.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/15 bg-slate-950/10 p-4 backdrop-blur-sm">
                  <p className="text-xs font-bold text-white">Invitation link detected</p>
                  <p className="mt-1 text-xs leading-5 text-blue-100">
                    This preview recognizes the invitation route. Token validation will be added with the backend connection.
                  </p>
                  <span className="sr-only">Invitation token present: {Boolean(token)}</span>
                </div>
              </div>
            </section>

            <section className="p-7 sm:p-10">
              <div className="max-w-md">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Doctor signup</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Set your account details</h2>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Your invitation is tied to the email address below.
                </p>

                <div className="mt-6 rounded-lg border border-blue-100 bg-primary-light/70 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-card text-primary shadow-sm">
                      <Mail className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600">Invited email</p>
                      <p className="truncate text-sm font-bold text-slate-800">{DEMO_INVITED_EMAIL}</p>
                    </div>
                  </div>
                </div>

                <form className="mt-7 space-y-5" onSubmit={handleSubmit(handleValidSubmit)} noValidate>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label htmlFor="firstName" className="mb-1.5 block text-xs font-bold text-slate-700">
                        First name
                      </label>
                      <Input
                        id="firstName"
                        type="text"
                        autoComplete="given-name"
                        aria-invalid={Boolean(errors.firstName)}
                        className="bg-muted"
                        {...register("firstName")}
                      />
                      <FieldError message={errors.firstName?.message} />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="mb-1.5 block text-xs font-bold text-slate-700">
                        Last name
                      </label>
                      <Input
                        id="lastName"
                        type="text"
                        autoComplete="family-name"
                        aria-invalid={Boolean(errors.lastName)}
                        className="bg-muted"
                        {...register("lastName")}
                      />
                      <FieldError message={errors.lastName?.message} />
                    </div>
                  </div>

                  <PasswordField
                    id="password"
                    label="Create password"
                    error={errors.password}
                    registration={register("password")}
                  />
                  <PasswordField
                    id="confirmPassword"
                    label="Confirm password"
                    error={errors.confirmPassword}
                    registration={register("confirmPassword")}
                  />

                  <p className="text-xs leading-5 text-slate-500">
                    Use at least eight characters. You will be able to finish your doctor profile after account creation.
                  </p>

                  <Button
                    type="submit"
                    size="lg"
                    disabled={isSubmitting}
                    className="w-full"
                  >
                    {isSubmitting ? "Preparing account…" : "Create doctor account"}
                  </Button>
                </form>
              </div>
            </section>
          </div>
        )}
      </div>
    </main>
  );
}
