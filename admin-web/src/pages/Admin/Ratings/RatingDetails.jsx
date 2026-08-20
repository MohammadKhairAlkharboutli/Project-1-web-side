import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import { ratingsApi } from "@/api/ratingsApi";
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

function getErrorMessage(error) {
  const message = error?.response?.data?.message || error?.message;
  return Array.isArray(message) ? message.join(" ") : message || "Unable to load the complete rating details.";
}

function ProfileLink({ id, to, children }) {
  if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
    return children;
  }

  return <Link to={to} className="text-[var(--color-primary)] hover:underline">{children}</Link>;
}

export default function RatingDetails({
  rating,
  open,
  onOpenChange,
  onUpdateStatus,
  isUpdating,
  actionError,
}) {
  const [detailsState, setDetailsState] = useState({ status: "idle", ratingId: null, rating: null, error: "" });

  useEffect(() => {
    if (!open || !rating?.id) {
      return undefined;
    }

    let isCurrent = true;

    ratingsApi.getAdminRatingDetails(rating.id)
      .then((fullRating) => {
        if (isCurrent) setDetailsState({ status: "ready", ratingId: rating.id, rating: fullRating, error: "" });
      })
      .catch((error) => {
        if (isCurrent) setDetailsState({ status: "error", ratingId: rating.id, rating: null, error: getErrorMessage(error) });
      });

    return () => {
      isCurrent = false;
    };
  }, [open, rating?.id]);

  const fullRating = detailsState.rating && String(detailsState.rating.id) === String(rating?.id)
    ? {
        ...detailsState.rating,
        status: rating.status ?? detailsState.rating.status,
        score: rating.score ?? detailsState.rating.score,
        comment: rating.comment ?? detailsState.rating.comment,
        updatedAt: rating.updatedAt ?? detailsState.rating.updatedAt,
      }
    : rating;
  const isLoadingDetails = Boolean(open && rating?.id && String(detailsState.ratingId) !== String(rating.id));
  const detailsError = detailsState.status === "error" && String(detailsState.ratingId) === String(rating?.id)
    ? detailsState.error
    : "";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-4xl">
        {fullRating && (
          <>
            <DialogHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <DialogTitle>Rating #{fullRating.id}</DialogTitle>
                  <DialogDescription className="mt-1">
                    Full rating information and moderation context.
                  </DialogDescription>
                </div>

                <div className="flex flex-wrap gap-2">
                  <RatingScoreBadge score={fullRating.score} />
                  <RatingStatusBadge status={fullRating.status} />
                </div>
              </div>
            </DialogHeader>

            <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
              <InfoItem
                label="Doctor"
                value={
                  <ProfileLink id={fullRating.doctorProfileId} to={`/admin/doctors/${fullRating.doctorProfileId}`}>
                    {getRatingDoctorName(fullRating)}
                  </ProfileLink>
                }
              />
              <InfoItem
                label="Patient"
                value={
                  <ProfileLink id={fullRating.patientProfileId} to={`/admin/patients/${fullRating.patientProfileId}`}>
                    {getRatingPatientName(fullRating)}
                  </ProfileLink>
                }
              />
              <InfoItem label="Appointment" value={fullRating.appointmentId ? `#${fullRating.appointmentId}` : null} />
              <InfoItem label="Appointment Date" value={formatRatingDate(fullRating.appointment?.requestedDate)} />
              <InfoItem label="Appointment Type" value={fullRating.appointment?.type} />
              <InfoItem label="Clinic" value={fullRating.appointment?.clinic?.name} />
              <InfoItem label="Created" value={formatRatingDate(fullRating.createdAt)} />
              <InfoItem label="Updated" value={formatRatingDate(fullRating.updatedAt)} />

              <div className={`${profileCardShell} md:col-span-2 xl:col-span-3`}>
                <p className={profileCardLabel}>Comment</p>
                <p className={profileCardBody}>{fullRating.comment || "No comment"}</p>
              </div>
            </div>

            {isLoadingDetails ? <p className="px-5 text-sm text-slate-500">Loading complete rating context…</p> : null}
            {detailsError ? <p className="mx-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900" role="alert">{detailsError}</p> : null}

            <DialogFooter>
              {actionError ? (
                <p className="mr-auto text-sm text-red-700" role="alert">
                  {actionError}
                </p>
              ) : null}
              {fullRating.status === "visible" ? <Button variant="outline" disabled={!onUpdateStatus || isUpdating} onClick={() => onUpdateStatus?.(fullRating, "hidden")}>{isUpdating ? "Updating..." : "Hide rating"}</Button> : null}
              {fullRating.status === "hidden" ? <Button variant="outline" disabled={!onUpdateStatus || isUpdating} onClick={() => onUpdateStatus?.(fullRating, "visible")}>{isUpdating ? "Updating..." : "Unhide rating"}</Button> : null}
              {fullRating.status === "deleted" ? <Button variant="outline" disabled={!onUpdateStatus || isUpdating} onClick={() => onUpdateStatus?.(fullRating, "visible")}>{isUpdating ? "Updating..." : "Restore rating"}</Button> : null}
              {fullRating.status !== "deleted" ? <Button variant="outline" disabled={!onUpdateStatus || isUpdating} onClick={() => onUpdateStatus?.(fullRating, "deleted")}>{isUpdating ? "Updating..." : "Delete rating"}</Button> : null}
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
