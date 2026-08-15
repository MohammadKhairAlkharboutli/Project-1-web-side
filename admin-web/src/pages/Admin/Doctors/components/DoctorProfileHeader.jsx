import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, Phone, RotateCcw, ShieldOff, Star } from "lucide-react";

import {
  profileHeaderDetailsLabel,
  profileHeaderDetailsShell,
  profileHeaderDetailsValue,
} from "@/components/shared/styles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  formatApprovalStatus,
  formatCurrency,
  formatDoctorStatus,
  getDoctorDisplayName,
  getDoctorInitials,
} from "../doctorUtils";

export default function DoctorProfileHeader({
  doctor,
  onStatusChange,
  isUpdatingStatus,
}) {
  const normalizedStatus = String(doctor.status || "").toLowerCase();
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [statusActionError, setStatusActionError] = useState("");
  const isActive = normalizedStatus === "active";
  const isInactive = normalizedStatus === "inactive";
  const nextStatus = isActive ? "inactive" : "active";
  const canChangeStatus = isActive || isInactive;
  const statusStyle = normalizedStatus === "active"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : normalizedStatus === "on_vacation"
      ? "border-amber-200 bg-amber-50 text-amber-800"
      : "border-slate-200 bg-slate-100 text-slate-600";

  async function confirmStatusChange(event) {
    event.preventDefault();
    setStatusActionError("");

    try {
      await onStatusChange(nextStatus);
      setIsStatusDialogOpen(false);
    } catch (error) {
      const message = error?.response?.data?.message || error?.message;
      setStatusActionError(
        Array.isArray(message)
          ? message.join(" ")
          : message || "Unable to update the doctor status.",
      );
    }
  }

  return (
    <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-semibold text-slate-700">
          {getDoctorInitials(doctor)}
        </div>

        <div className="space-y-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {getDoctorDisplayName(doctor)}
              </h1>
              <Badge variant="outline" className={statusStyle}>
                {formatDoctorStatus(doctor.status)}
              </Badge>
            </div>

            <p className="text-sm text-slate-600">
              {[doctor.specialization, doctor.subSpecialization]
                .filter(Boolean)
                .join(" | ")}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-slate-400" />
              <span>{doctor.user?.email || "No email"}</span>
            </div>

            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-400" />
              <span>{doctor.user?.phone || "No phone"}</span>
            </div>
          </div>

          <Button variant="outline" size="sm" asChild>
            <Link to={`/admin/ratings?doctorId=${doctor.id}`}>
              <Star className="h-4 w-4" />
              View ratings
            </Link>
          </Button>

          {canChangeStatus ? (
            <Button
              variant={isActive ? "destructive" : "outline"}
              size="sm"
              disabled={isUpdatingStatus}
              onClick={() => {
                setStatusActionError("");
                setIsStatusDialogOpen(true);
              }}
            >
              {isActive ? (
                <ShieldOff className="h-4 w-4" />
              ) : (
                <RotateCcw className="h-4 w-4" />
              )}
              {isActive ? "Deactivate doctor" : "Reactivate doctor"}
            </Button>
          ) : null}
        </div>
      </div>

      <div className="flex flex-col gap-3 md:items-end">
        <div
          className={`${profileHeaderDetailsShell} sm:grid-cols-2 md:min-w-72 md:grid-cols-2`}
        >
          <div>
            <p className={profileHeaderDetailsLabel}>
              Approval
            </p>
            <p className={profileHeaderDetailsValue}>
              {formatApprovalStatus(doctor.isApproved)}
            </p>
          </div>

          <div>
            <p className={profileHeaderDetailsLabel}>
              Rating
            </p>
            <p className={profileHeaderDetailsValue}>
              {Number.isFinite(Number(doctor.averageRating))
                ? Number(doctor.averageRating).toFixed(1)
                : "N/A"}
            </p>
          </div>

          <div>
            <p className={profileHeaderDetailsLabel}>
              Assigned clinic
          </p>
          <p className={profileHeaderDetailsValue}>
              {doctor.assignedClinic?.name || "Not assigned"}
            </p>
          </div>

          <div>
            <p className={profileHeaderDetailsLabel}>
              Initial Fee
            </p>
            <p className={profileHeaderDetailsValue}>
              {formatCurrency(doctor.initialVisitFee)}
            </p>
          </div>
        </div>
      </div>

      <AlertDialog
        open={isStatusDialogOpen}
        onOpenChange={(open) => {
          if (!isUpdatingStatus) {
            setIsStatusDialogOpen(open);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {isActive ? "Deactivate doctor?" : "Reactivate doctor?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {isActive
                ? "This doctor will no longer be available for new clinic assignments or patient bookings. Their existing records will remain unchanged."
                : "This doctor will become available for clinic assignments and patient bookings again."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {statusActionError ? (
            <p className="text-sm text-red-600" role="alert">
              {statusActionError}
            </p>
          ) : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdatingStatus}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              variant={isActive ? "destructive" : "default"}
              disabled={isUpdatingStatus}
              onClick={confirmStatusChange}
            >
              {isUpdatingStatus
                ? "Saving..."
                : isActive
                  ? "Deactivate doctor"
                  : "Reactivate doctor"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
