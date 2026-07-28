import { Link } from "react-router-dom";

import {
  profileCardBody,
  profileCardLabel,
  profileCardShell,
  profileCardValue,
} from "@/components/shared/styles";
import RatingScoreBadge from "@/components/shared/Ratings/RatingScoreBadge";
import RatingStatusBadge from "@/components/shared/Ratings/RatingStatusBadge";
import {
  formatRatingDate,
  getRatingDoctorName,
  getRatingPatientName,
} from "@/components/shared/Ratings/ratingUtils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function InfoItem({ label, value, wide = false }) {
  return (
    <div className={`${profileCardShell} ${wide ? "md:col-span-2 xl:col-span-3" : ""}`}>
      <p className={profileCardLabel}>{label}</p>
      <p className={profileCardValue}>{value || "N/A"}</p>
    </div>
  );
}

export default function RatingDetails({
  rating,
  open,
  onOpenChange,
  onHide,
  isHiding,
  actionError,
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-4xl">
        {rating && (
          <>
            <DialogHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <DialogTitle>Rating #{rating.id}</DialogTitle>
                  <DialogDescription className="mt-1">
                    Full rating information and moderation context.
                  </DialogDescription>
                </div>

                <div className="flex flex-wrap gap-2">
                  <RatingScoreBadge score={rating.score} />
                  <RatingStatusBadge status={rating.status} />
                </div>
              </div>
            </DialogHeader>

            <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
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

            <DialogFooter>
              {actionError ? (
                <p className="mr-auto text-sm text-red-700" role="alert">
                  {actionError}
                </p>
              ) : null}
              <Button
                variant="outline"
                disabled={!onHide || rating.status !== "visible" || isHiding}
                onClick={() => onHide?.(rating)}
              >
                {isHiding ? "Hiding..." : "Hide rating"}
              </Button>
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
