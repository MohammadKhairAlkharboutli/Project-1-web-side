import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import {
  profileCardBody,
  profileCardLabel,
  profileCardShell,
  profileCardValue,
} from "@/components/shared/styles";
import RatingScoreBadge from "@/components/shared/Ratings/RatingScoreBadge";
import RatingStatusBadge from "@/components/shared/Ratings/RatingStatusBadge";
import { mockRatings } from "@/components/shared/Ratings/mockRatingData";
import {
  formatRatingDate,
  getRatingDoctorName,
  getRatingPatientName,
} from "@/components/shared/Ratings/ratingUtils";
import { Button } from "@/components/ui/button";

function InfoItem({ label, value, wide = false }) {
  return (
    <div className={`${profileCardShell} ${wide ? "md:col-span-2 xl:col-span-3" : ""}`}>
      <p className={profileCardLabel}>{label}</p>
      <p className={profileCardValue}>{value || "N/A"}</p>
    </div>
  );
}

export default function RatingDetails() {
  const { ratingId } = useParams();
  const navigate = useNavigate();
  const rating = mockRatings.find((item) => String(item.id) === ratingId);

  if (!rating) {
    return (
      <section className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Rating not found
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
                Rating #{rating.id}
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                Full rating information and moderation context.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <RatingScoreBadge score={rating.score} />
              <RatingStatusBadge status={rating.status} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            <InfoItem
              label="Doctor"
              value={
                <Link
                  to={`/admin/doctors/${rating.doctorProfileId}`}
                  className="text-[var(--color-primary)] hover:underline"
                >
                  {getRatingDoctorName(rating)}
                </Link>
              }
            />
            <InfoItem
              label="Patient"
              value={
                <Link
                  to={`/admin/patients/${rating.patientProfileId}`}
                  className="text-[var(--color-primary)] hover:underline"
                >
                  {getRatingPatientName(rating)}
                </Link>
              }
            />
            <InfoItem label="Appointment" value={`#${rating.appointmentId || "N/A"}`} />
            <InfoItem label="Appointment Date" value={rating.appointment?.requestedDate} />
            <InfoItem label="Appointment Type" value={rating.appointment?.type} />
            <InfoItem label="Clinic" value={rating.appointment?.clinic?.name} />
            <InfoItem label="Created" value={formatRatingDate(rating.createdAt)} />
            <InfoItem label="Updated" value={formatRatingDate(rating.updatedAt)} />

            <div className={`${profileCardShell} md:col-span-2 xl:col-span-3`}>
              <p className={profileCardLabel}>Comment</p>
              <p className={profileCardBody}>{rating.comment || "No comment"}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" disabled>
              Hide rating
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
