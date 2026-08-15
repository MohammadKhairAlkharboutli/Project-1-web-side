import { AlertTriangle } from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { getPatientNameFromQueueItem } from "./queueUtils";

export default function SkipQueueDialog({
  queueItem,
  open,
  submitting,
  error,
  onOpenChange,
  onConfirm,
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogMedia>
            <AlertTriangle className="text-red-600" />
          </AlertDialogMedia>
          <AlertDialogTitle>Skip patient?</AlertDialogTitle>
          <AlertDialogDescription>
            {queueItem ? getPatientNameFromQueueItem(queueItem) : "This patient"} will be removed from the active queue and shown in today&apos;s activity.
          </AlertDialogDescription>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={submitting}
            onClick={(event) => {
              event.preventDefault();
              onConfirm();
            }}
          >
            {submitting ? "Skipping..." : "Skip"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
