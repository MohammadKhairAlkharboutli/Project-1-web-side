import { LoaderCircle, ShieldCheck, Stethoscope } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { authApi } from "@/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isPhone = (value) => /^\+?[0-9\s-]{7,15}$/.test(value);
const cleanPhone = (value) => value.replace(/\s/g, "").replace(/-/g, "");
const homeRouteByRole = {
  admin: "/admin",
  doctor: "/doctor",
  // Disabled for the older backend, which has no secretary role or routes.
  // secretary: "/secretary",
};

function getStoredSessionRoute() {
  const token = localStorage.getItem("accessToken");
  if (!token) {
    return null;
  }

  try {
    const payload = token.split(".")[1];
    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, "=")));
    return homeRouteByRole[String(decoded.usertype || "").toLowerCase()] || null;
  } catch {
    return null;
  }
}

export default function LoginPage() {
  const [loginValue, setLoginValue] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const sessionRoute = getStoredSessionRoute();
    if (sessionRoute) {
      navigate(sessionRoute, { replace: true });
    }
  }, [navigate]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const trimmedLoginValue = loginValue.trim();
    if (!trimmedLoginValue) {
      setError("Please enter your email or phone number.");
      return;
    }
    if (!password) {
      setError("Please enter your password.");
      return;
    }
    if (password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }

    let loginData;
    if (isEmail(trimmedLoginValue)) {
      loginData = { email: trimmedLoginValue, password };
    } else if (isPhone(trimmedLoginValue)) {
      loginData = { phone: cleanPhone(trimmedLoginValue), password };
    } else {
      setError("Please enter a valid email address or phone number.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authApi.login(loginData);
      const destination = homeRouteByRole[String(response?.user?.role || "").toLowerCase()];
      if (!destination) {
        authApi.clearSession();
        setError("This sign-in is available to authorized staff accounts only.");
        return;
      }
      navigate(destination, { replace: true });
    } catch (requestError) {
      const backendMessage = requestError.response?.data?.message;
      setError(
        Array.isArray(backendMessage)
          ? backendMessage.join(" ")
          : backendMessage || "We could not sign you in. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8 text-foreground sm:px-6">
      <div className="w-full max-w-5xl">
        <header className="mb-6 flex items-center justify-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Stethoscope className="h-5 w-5" aria-hidden="true" />
          </div>
          <div>
            <p className="text-xl font-black tracking-tight text-slate-900">Tabibi</p>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Clinical Systems</p>
          </div>
        </header>

        <section className="grid overflow-hidden rounded-xl border border-slate-200 bg-card shadow-raised lg:grid-cols-[0.9fr_1.1fr]">
          <div className="relative overflow-hidden bg-primary p-8 text-primary-foreground sm:p-10">
            <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10" />
            <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full border-[28px] border-white/10" />
            <div className="relative flex h-full flex-col">
              <div className="flex w-fit items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold backdrop-blur-sm">
                <ShieldCheck className="h-4 w-4" aria-hidden="true" />
                Secure staff access
              </div>

              <div className="my-auto py-12 lg:py-0">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-blue-100">Welcome to Tabibi</p>
                <h1 className="mt-3 text-3xl font-semibold leading-tight tracking-tight sm:text-4xl">Your clinic, in one secure place.</h1>
                <p className="mt-5 max-w-sm text-sm leading-6 text-blue-100">
                  Doctors, administrators, and reception staff can securely sign in to their assigned workspace.
                </p>
              </div>

              <div className="rounded-2xl border border-white/15 bg-slate-950/10 p-4 backdrop-blur-sm">
                <p className="text-xs font-bold text-white">For authorized clinic staff</p>
                <p className="mt-1 text-xs leading-5 text-blue-100">You will be taken to the right workspace automatically after signing in.</p>
              </div>
            </div>
          </div>

          <div className="p-7 sm:p-10">
            <div className="max-w-md">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Staff sign in</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Welcome back</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">Enter your details to access your Tabibi workspace.</p>

              <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
                <div>
                  <label htmlFor="admin-login" className="mb-1.5 block text-xs font-bold text-slate-700">Email or phone number</label>
              <Input
                id="admin-login"
                type="text"
                placeholder="name@clinic.com or 09XXXXXXXX"
                autoComplete="username"
                aria-invalid={Boolean(error)}
                className="bg-muted"
                value={loginValue}
                onChange={(event) => setLoginValue(event.target.value)}
              />
            </div>

                <div>
                  <label htmlFor="admin-password" className="mb-1.5 block text-xs font-bold text-slate-700">Password</label>
              <Input
                id="admin-password"
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                aria-invalid={Boolean(error)}
                className="bg-muted"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </div>

                {error && <p className="rounded-xl border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">{error}</p>}

                {location.state?.passwordChanged && !error && (
                  <p className="rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                    Password changed successfully. Please sign in again.
                  </p>
                )}

                <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <><LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> Signing in…</> : "Sign in to dashboard"}
                </Button>
              </form>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
