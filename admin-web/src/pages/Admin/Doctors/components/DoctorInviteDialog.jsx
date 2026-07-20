import { useMemo, useState } from "react";
import { Check, Copy } from "lucide-react";

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

function getDoctorInvitationLink() {
  const origin =
    typeof window !== "undefined" ? window.location.origin : "https://app.example.com";

  return `${origin}/doctor/invitation`;
}

export default function DoctorInviteDialog({ open, onOpenChange }) {
  const [copied, setCopied] = useState(false);
  const invitationLink = useMemo(() => getDoctorInvitationLink(), []);

  async function copyInvitationLink() {
    if (!navigator?.clipboard) {
      return;
    }

    await navigator.clipboard.writeText(invitationLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add doctor</DialogTitle>
          <DialogDescription>
            Send this invitation link to a doctor so they can fill in their
            profile information later.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2 p-5">
          <label className="text-sm font-medium text-slate-700">
            Doctor invitation link
          </label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              value={invitationLink}
              readOnly
              className="font-mono text-xs sm:text-sm"
            />
            <Button type="button" variant="outline" onClick={copyInvitationLink}>
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied" : "Copy"}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
