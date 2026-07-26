import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import {
  profileCardBody,
  profileCardLabel,
  profileCardShell,
  profileCardValue,
} from "@/components/shared/styles";
import RatingReportStatusBadge from "@/components/shared/Ratings/RatingReportStatusBadge";
import RatingScoreBadge from "@/components/shared/Ratings/RatingScoreBadge";
import { mockRatingReports } from "@/components/shared/Ratings/mockRatingData";
import {
  formatRatingDate,
  getRatingDoctorName,
  getRatingPatientName,
  getReportReasonLabel,
} from "@/components/shared/Ratings/ratingUtils";
import { Button } from "@/components/ui/button";

function InfoItem({ label, value }) {
  return (
    <div className={profileCardShell}>
      <p className={profileCardLabel}>{label}</p>
      <p className={profileCardValue}>{value || "N/A"}</p>
    </div>
  );
}

export default function RatingReportDetails() {
  const { reportId } = useParams();
  const navigate = useNavigate();
  const report = mockRatingReports.find((item) => String(item.id) === reportId);
  const rating = report?.rating;

  if (!report) {
    return (
      <section className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Rating report not found
        </h1>
      </section>
    );
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-4">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-6">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>

        <div className="space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Rating Report #{report.id}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Report details and reported rating context.
              </p>
            </div>
            <RatingReportStatusBadge status={report.status} />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <InfoItem label="Reason" value={getReportReasonLabel(report.reason)} />
            <InfoItem
              label="Reporter"
              value={
                <Link
                  to={`/admin/patients/${report.reporterPatientId}`}
                  className="text-[var(--color-primary)] hover:underline"
                >
                  {report.reporterPatient?.user?.full_name}
                </Link>
              }
            />
            <InfoItem label="Created" value={formatRatingDate(report.createdAt)} />
            <InfoItem label="Resolved At" value={formatRatingDate(report.resolvedAt)} />
            <InfoItem label="Resolved By Admin" value={report.resolvedByAdminId} />
            <InfoItem
              label="Reported Rating"
              value={
                <Link
                  to={`/admin/ratings/${report.ratingId}`}
                  className="text-[var(--color-primary)] hover:underline"
                >
                  Rating #{report.ratingId}
                </Link>
              }
            />

            <div className={`${profileCardShell} md:col-span-2 xl:col-span-3`}>
              <p className={profileCardLabel}>Report Explanation</p>
              <p className={profileCardBody}>
                {report.explanation || "No explanation provided."}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold tracking-tight text-slate-900">
                Reported Rating
              </h2>
              <RatingScoreBadge score={rating?.score} />
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <InfoItem label="Doctor" value={getRatingDoctorName(rating)} />
              <InfoItem label="Reviewer" value={getRatingPatientName(rating)} />
              <InfoItem label="Status" value={rating?.status} />
              <div className={`${profileCardShell} md:col-span-2 xl:col-span-3`}>
                <p className={profileCardLabel}>Comment</p>
                <p className={profileCardBody}>
                  {rating?.comment || "No comment"}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled>
              Accept report
            </Button>
            <Button variant="outline" disabled>
              Dismiss report
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
