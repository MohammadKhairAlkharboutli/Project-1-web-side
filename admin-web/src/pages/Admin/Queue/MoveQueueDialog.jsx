import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select";

import { getPatientNameFromQueueItem } from "./queueUtils";

export default function MoveQueueDialog({
  queueItem,
  open,
  submitting,
  error,
  availablePositions,
  onOpenChange,
  onSubmit,
}) {
  const newPosition = String(queueItem?.position ?? "");

  function handleSubmit(event) {
    event.preventDefault();
    onSubmit(Number(event.currentTarget.newPosition.value));
  }

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
              <NativeSelect name="newPosition" defaultValue={newPosition}>
                {availablePositions.map((position) => (
                  <NativeSelectOption key={position} value={String(position)}>
                    Position #{position}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </label>
            <p className="text-sm text-slate-500">
              Only waiting patients can be reordered. Called and in-consultation patients stay locked.
            </p>
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
            <Button type="submit" disabled={submitting || !newPosition}>
              {submitting ? "Moving..." : "Move"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
