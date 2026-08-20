import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  RefreshCw,
  Star,
  Users,
} from "lucide-react";

import { doctorDashboardApi } from "@/api/doctorDashboardApi";
import { Button } from "@/components/ui/button";

const STAT_CONFIG = [
  {
    key: "appointmentsToday",
    label: "Appointments Today",
    helper: "Today’s booked visits",
    to: "/doctor/appointments",
    actionLabel: "View appointments",
    icon: CalendarDays,
    iconClass: "bg-primary-light text-primary",
    helperClass: "bg-blue-50 text-blue-600",
  },
  {
    key: "appointmentsThisWeek",
    label: "Appointments This Week",
    helper: "Current week",
    to: "/doctor/appointments",
    actionLabel: "View appointments",
    icon: CalendarDays,
    iconClass: "bg-emerald-50 text-emerald-600",
    helperClass: "bg-emerald-50 text-emerald-600",
  },
  {
    key: "patientsWaiting",
    label: "Patients Waiting",
    helper: "In the live queue",
    to: "/doctor/queue",
    actionLabel: "Open queue",
    icon: Users,
    iconClass: "bg-amber-50 text-amber-600",
    helperClass: "bg-amber-50 text-amber-600",
  },
  {
    key: "completedToday",
    label: "Completed Today",
    helper: "Finished consultations",
    to: "/doctor/appointments",
    actionLabel: "View appointments",
    icon: CheckCircle2,
    iconClass: "bg-purple-50 text-purple-600",
    helperClass: "bg-purple-50 text-purple-600",
  },
];

function getErrorMessage(error) {
  const message = error?.response?.data?.message || error?.message;
  return Array.isArray(message)
    ? message.join(" ")
    : message || "We could not load your dashboard. Please try again.";
}

function getInitials(fullName) {
  return String(fullName || "Doctor")
    .replace(/^Dr\.?\s+/i, "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((name) => name[0])
    .join("")
    .toUpperCase();
}

function DoctorAvatar({ doctor, avatarUrl }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (avatarUrl && !imageFailed) {
    return (
      <img
        src={avatarUrl}
        alt=""
        className="h-11 w-11 shrink-0 rounded-xl object-cover"
        onError={() => setImageFailed(true)}
      />
    );
  }

  return (
    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-light text-sm font-semibold text-primary">
      {getInitials(doctor.fullName)}
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="w-full py-2">
      <div className="mx-auto max-w-[1600px] animate-pulse space-y-6">
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="h-44 rounded-3xl bg-primary-light lg:col-span-7" />
          <div className="h-44 rounded-3xl bg-slate-200 lg:col-span-5" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STAT_CONFIG.map((stat) => (
            <div key={stat.key} className="h-[132px] rounded-2xl bg-slate-200" />
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardError({ message, onRetry }) {
  return (
    <div className="w-full py-2">
      <div className="mx-auto flex min-h-[60vh] max-w-xl items-center">
        <section
          className="w-full rounded-lg border border-red-200 bg-card p-8 text-center shadow-surface"
          role="alert"
        >
          <h1 className="text-xl font-bold text-slate-900">
            Dashboard unavailable
          </h1>
          <p className="mt-2 text-sm text-slate-600">{message}</p>
          <Button className="mt-5" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </section>
      </div>
    </div>
  );
}

export default function DoctorDashboard() {
  const { avatarUrl } = useOutletContext();
  const [dashboard, setDashboard] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let isCurrent = true;

    async function loadDashboard() {
      setIsLoading(true);
      setLoadError("");

      try {
        const data = await doctorDashboardApi.getDashboard();

        if (isCurrent) {
          setDashboard(data);
        }
      } catch (error) {
        if (isCurrent) {
          setLoadError(getErrorMessage(error));
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      isCurrent = false;
    };
  }, [loadAttempt]);

  function retryLoad() {
    setLoadAttempt((attempt) => attempt + 1);
  }

  if (isLoading && !dashboard) {
    return <DashboardLoading />;
  }

  if (!dashboard) {
    return <DashboardError message={loadError} onRetry={retryLoad} />;
  }

  const { doctor, stats } = dashboard;
  const rating = Number.isFinite(doctor.averageRating)
    ? doctor.averageRating.toFixed(1)
    : "N/A";

  return (
    <div className="w-full font-sans text-slate-900 antialiased">
      <div className="space-y-6">
        {loadError ? (
          <div
            className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 sm:flex-row sm:items-center sm:justify-between"
            role="alert"
          >
            <span>{loadError} Showing the last available dashboard data.</span>
            <Button type="button" variant="outline" size="sm" onClick={retryLoad}>
              <RefreshCw className="h-4 w-4" />
              Try again
            </Button>
          </div>
        ) : null}

        <div className="grid grid-cols-1 items-stretch gap-5 lg:grid-cols-12">
          <div className="relative flex min-h-[172px] flex-col justify-center overflow-hidden rounded-3xl bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] px-6 py-6 text-primary-foreground shadow-lg shadow-blue-500/20 sm:px-8 sm:py-7 lg:col-span-7">
            <div className="pointer-events-none absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
            <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="space-y-1.5">
                <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-white/30 bg-white/20 px-3 py-0.5 text-[11px] font-bold text-white shadow-xs backdrop-blur-md">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
                  Clinical Dashboard
                </span>
                <h1 className="type-hero-title">
                  Welcome back, {doctor.fullName || "Doctor"}
                </h1>
                <p className="text-xs font-medium text-blue-100">
                  You have {stats.appointmentsToday} appointments today.
                </p>
              </div>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={isLoading}
                onClick={retryLoad}
                className="shrink-0 border border-white/30 bg-white/15 text-white shadow-none hover:bg-white/25 hover:text-white"
              >
                <RefreshCw className={isLoading ? "animate-spin" : ""} />
                Refresh
              </Button>
            </div>
          </div>

          <div className="flex min-h-[172px] flex-col justify-between rounded-3xl border border-slate-200 bg-card p-5 shadow-surface lg:col-span-5 sm:p-6">
            <div className="flex items-center gap-3.5">
              <DoctorAvatar doctor={doctor} avatarUrl={avatarUrl} />
              <div className="min-w-0 flex-1">
                <h2 className="truncate text-xs font-extrabold text-slate-900">
                  {doctor.fullName || "Doctor"}
                </h2>
                <p className="truncate text-[11px] text-slate-400">
                  {doctor.specialization || "Specialization not recorded"}
                </p>
                <Link
                  to="/doctor/profile"
                  className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                >
                  Profile
                  <ArrowUpRight size={11} className="-rotate-90" />
                </Link>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5 text-xs text-slate-500">
              <span className="text-[11px] font-medium">General Rating</span>
              <span className="flex items-center gap-1 text-xs font-bold text-amber-500">
                <Star size={12} className="fill-amber-400 text-amber-400" />
                {rating}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {STAT_CONFIG.map((stat) => {
            const Icon = stat.icon;

            return (
              <Link
                key={stat.key}
                to={stat.to}
                aria-label={`${stat.actionLabel}: ${stats[stat.key]}`}
                className="group flex min-h-[132px] items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-card px-5 py-5 shadow-surface transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              >
                <div className="min-w-0 space-y-1">
                  <p className="text-[11px] font-semibold text-slate-400">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-semibold text-slate-900">
                    {stats[stat.key]}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold ${stat.helperClass}`}
                    >
                      {stat.helper}
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-primary opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100">
                      {stat.actionLabel}
                      <ArrowUpRight size={12} />
                    </span>
                  </div>
                </div>
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl shadow-xs ${stat.iconClass}`}
                >
                  <Icon size={18} />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
