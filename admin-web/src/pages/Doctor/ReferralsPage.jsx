import { useCallback, useEffect, useMemo, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { CalendarDays, ChevronLeft, ChevronRight, Inbox, Search, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { referralsApi } from "@/api/referralsApi";

const VIEW_DETAILS = {
  sent: { heading: "Sent referrals", description: "Referrals you created for patients, including external and follow-up care.", empty: "Create a referral from an active consultation.", icon: Send },
  received: { heading: "Received referrals", description: "External referrals another doctor sent to you.", empty: "New external referrals addressed to you will appear here.", icon: Inbox },
};

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message || error?.message;
  return Array.isArray(message) ? message.join(" ") : message || fallback;
}

function getUserName(profile, fallback) {
  const user = profile?.user;
  return user?.full_name || user?.fullName || [user?.firstName, user?.fatherName, user?.lastName].filter(Boolean).join(" ") || fallback;
}

function formatDate(value) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not recorded" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

export default function ReferralsPage() {
  const {
    acknowledgeReceivedReferrals,
    hasReceivedReferralAttention,
  } = useOutletContext();
  const [view, setView] = useState("sent");
  const [response, setResponse] = useState({ data: [], meta: { page: 1, totalPages: 1, total: 0 } });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const details = VIEW_DETAILS[view];

  const loadReferrals = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const params = { page, limit: 10 };
      const data = view === "sent"
        ? await referralsApi.getSentReferrals(params)
        : await referralsApi.getReceivedReferrals(params);
      setResponse({ data: data.data ?? [], meta: data.meta ?? { page, totalPages: 1, total: 0 } });
    } catch (requestError) {
      setError(getErrorMessage(requestError, `Unable to load ${details.heading.toLowerCase()}.`));
    } finally {
      setIsLoading(false);
    }
  }, [details.heading, page, view]);

  useEffect(() => {
    const timer = window.setTimeout(loadReferrals, 0);
    return () => window.clearTimeout(timer);
  }, [loadReferrals]);

  function changeView(nextView) {
    setView(nextView);
    setPage(1);
    setSearch("");

    if (nextView === "received") {
      acknowledgeReceivedReferrals?.();
    }
  }

  const referrals = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) return response.data;
    return response.data.filter((referral) => [getUserName(referral.patient, ""), referral.reason, referral.toClinic?.name, getUserName(referral.toDoctor, ""), getUserName(referral.fromDoctor, ""), referral.type, referral.status].some((value) => String(value ?? "").toLowerCase().includes(normalizedSearch)));
  }, [response.data, search]);

  const EmptyIcon = details.icon;

  return <section className="space-y-6"><div><h1 className="text-2xl font-bold tracking-tight text-slate-900">Referrals</h1><p className="mt-1 text-sm text-slate-600">{details.description}</p></div><div className="flex w-full gap-1 overflow-x-auto rounded-2xl border border-slate-200 bg-slate-50 p-1 sm:w-fit">{[["sent", Send, "Sent"], ["received", Inbox, "Received"]].map(([value, Icon, label]) => <button key={value} type="button" onClick={() => changeView(value)} className={`relative inline-flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold ${view === value ? "bg-white text-blue-700 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}><Icon size={15} /> {label}{value === "received" && hasReceivedReferralAttention ? <span aria-label="Attention required" className="absolute right-2 top-2 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-slate-50" /> : null}</button>)}</div><div className="relative max-w-xl"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" /><Input appearance="filter" value={search} onChange={(event) => setSearch(event.target.value)} placeholder={`Search this page of ${details.heading.toLowerCase()}`} className="pl-9" /></div>{error ? <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700"><p>{error}</p><Button variant="outline" className="mt-3" onClick={loadReferrals}>Retry</Button></div> : isLoading ? <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-14 text-center text-sm text-slate-500">Loading referrals…</div> : referrals.length ? <div className="space-y-4">{referrals.map((referral) => <ReferralCard key={referral.id} referral={referral} view={view} />)}</div> : <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center"><EmptyIcon className="mx-auto h-8 w-8 text-slate-300" /><p className="mt-3 text-sm font-medium text-slate-700">No {details.heading.toLowerCase()} found.</p><p className="mt-1 text-sm text-slate-500">{details.empty}</p></div>}{!error && !isLoading && response.meta.totalPages > 1 ? <div className="flex items-center justify-between border-t border-slate-200 pt-4"><p className="text-sm text-slate-500">Page {response.meta.page} of {response.meta.totalPages} · {response.meta.total} referrals</p><div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}><ChevronLeft className="h-4 w-4" />Previous</Button><Button variant="outline" size="sm" disabled={page >= response.meta.totalPages} onClick={() => setPage((current) => current + 1)}>Next<ChevronRight className="h-4 w-4" /></Button></div></div> : null}</section>;
}

function ReferralCard({ referral, view }) {
  const statusClass = referral.status === "COMPLETED" ? "bg-emerald-50 text-emerald-700" : referral.status === "PENDING" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600";
  const isFollowUp = referral.type === "FOLLOW_UP";
  const counterpart = view === "sent" ? (isFollowUp ? "Follow-up with this doctor" : referral.toClinic?.name || getUserName(referral.toDoctor, "") || "Target not recorded") : getUserName(referral.fromDoctor, "Referring doctor");
  const directionLabel = view === "sent" && isFollowUp ? "Care:" : view === "sent" ? "To:" : "From:";

  return <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-semibold text-slate-900">{getUserName(referral.patient, "Patient")}</h2><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass}`}>{referral.status}</span><span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">{isFollowUp ? "Follow-up" : "External"}</span></div><p className="mt-3 text-sm leading-6 text-slate-700">{referral.reason}</p></div><div className="text-sm text-slate-500 sm:text-right"><p className="font-medium text-slate-700">{directionLabel} {counterpart}</p><p className="mt-1 inline-flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" />Created {formatDate(referral.createdAt ?? referral.created_at)}</p><p className="mt-1">Expires {formatDate(referral.expiresAt ?? referral.expires_at)}</p></div></div></article>;
}
