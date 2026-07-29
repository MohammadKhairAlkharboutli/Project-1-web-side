import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Search, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { getMockSentReferrals } from "./mockReferralData";

function getErrorMessage(error, fallback) {
  const message = error.response?.data?.message;
  return Array.isArray(message) ? message.join(" ") : message || fallback;
}

function getUserName(profile, fallback) {
  const user = profile?.user;
  return user?.full_name || user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(" ") || fallback;
}

function formatDate(value) {
  if (!value) return "N/A";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "N/A" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export default function ReferralsPage() {
  const [response, setResponse] = useState({ data: [], meta: { page: 1, totalPages: 1, total: 0 } });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadReferrals = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      // Temporary local fixture while the Doctor portal remains mock-driven.
      const data = getMockSentReferrals({ page, limit: 10 });
      setResponse({
        data: data.data ?? [],
        meta: data.meta ?? { page, totalPages: 1, total: 0 },
      });
    } catch (requestError) {
      setError(getErrorMessage(requestError, "Unable to load sent referrals."));
    } finally {
      setIsLoading(false);
    }
  }, [page]);

  useEffect(() => {
    const timer = window.setTimeout(loadReferrals, 0);
    return () => window.clearTimeout(timer);
  }, [loadReferrals]);

  const referrals = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return response.data;
    return response.data.filter((referral) => [
      getUserName(referral.patient, ""),
      referral.reason,
      referral.toClinic?.name,
      getUserName(referral.toDoctor, ""),
      referral.type,
      referral.status,
    ].some((value) => String(value ?? "").toLowerCase().includes(normalizedSearch)));
  }, [response.data, search]);

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Sent referrals</h1>
        <p className="mt-1 text-sm text-slate-600">Review referrals created from your patient consultations.</p>
      </div>

      <div className="relative max-w-xl">
        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search this page of referrals" className="pl-9" />
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          <p>{error}</p>
          <Button variant="outline" className="mt-3" onClick={loadReferrals}>Retry</Button>
        </div>
      ) : isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-14 text-center text-sm text-slate-500">Loading referrals…</div>
      ) : referrals.length ? (
        <div className="space-y-4">
          {referrals.map((referral) => <ReferralCard key={referral.id} referral={referral} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
          <Send className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-3 text-sm font-medium text-slate-700">No sent referrals found.</p>
          <p className="mt-1 text-sm text-slate-500">Create referrals from an active consultation.</p>
        </div>
      )}

      {!error && !isLoading && response.meta.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-slate-200 pt-4">
          <p className="text-sm text-slate-500">Page {response.meta.page} of {response.meta.totalPages} · {response.meta.total} referrals</p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}><ChevronLeft className="h-4 w-4" />Previous</Button>
            <Button variant="outline" size="sm" disabled={page >= response.meta.totalPages} onClick={() => setPage((current) => current + 1)}>Next<ChevronRight className="h-4 w-4" /></Button>
          </div>
        </div>
      )}
    </section>
  );
}

function ReferralCard({ referral }) {
  const statusClass = referral.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700" : referral.status === "PENDING" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600";
  const destination = referral.toClinic?.name || getUserName(referral.toDoctor, "") || "Follow-up with the referring doctor";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-semibold text-slate-900">{getUserName(referral.patient, "Patient")}</h2>
            <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}>{referral.status}</span>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">{referral.type === "FOLLOW_UP" ? "Follow-up" : "External"}</span>
          </div>
          <p className="mt-3 text-sm leading-6 text-slate-700">{referral.reason}</p>
        </div>
        <div className="text-sm text-slate-500 sm:text-right">
          <p className="font-medium text-slate-700">{destination}</p>
          <p className="mt-1 inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />Created {formatDate(referral.createdAt ?? referral.created_at)}</p>
          <p className="mt-1">Expires {formatDate(referral.expiresAt ?? referral.expires_at)}</p>
        </div>
      </div>
    </article>
  );
}
