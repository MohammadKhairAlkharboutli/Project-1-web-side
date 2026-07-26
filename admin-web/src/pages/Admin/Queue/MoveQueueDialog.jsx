import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import { getPatientNameFromQueueItem } from "./queueUtils";

export default function MoveQueueDialog({
  queueItem,
  open,
  submitting,
  error,
  onOpenChange,
  onSubmit,
}) {
  const [newPosition, setNewPosition] = useState(String(queueItem?.position ?? 1));

  function handleSubmit(event) {
    event.preventDefault();

    const parsedPosition = Number(newPosition);

    if (!Number.isInteger(parsedPosition) || parsedPosition < 1) {
      return;
    }

    onSubmit(parsedPosition);
  }

  const isInvalid =
    newPosition !== "" &&
    (!Number.isInteger(Number(newPosition)) || Number(newPosition) < 1);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Move queue position</DialogTitle>
            <DialogDescription>
              Move {queueItem ? getPatientNameFromQueueItem(queueItem) : "this patient"} to a new backend queue position.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 px-5 py-4">
            <label className="space-y-1.5 text-sm font-medium text-slate-700">
              <span>New position</span>
              <Input
                type="number"
                min="1"
                step="1"
                value={newPosition}
                onChange={(event) => setNewPosition(event.target.value)}
                aria-invalid={isInvalid}
              />
            </label>
            {isInvalid && (
              <p className="text-sm text-red-600">
                Position must be a whole number greater than zero.
              </p>
            )}
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={submitting || isInvalid || !newPosition}>
              {submitting ? "Moving..." : "Move"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
