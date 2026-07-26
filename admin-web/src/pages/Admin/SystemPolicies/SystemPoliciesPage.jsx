import { useMemo, useState } from "react";
import { AlertTriangle, Save, Undo2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

import SystemPolicySection from "./SystemPolicySection";
import {
  arePoliciesEqual,
  DEFAULT_SYSTEM_POLICIES,
  formatPolicyTimestamp,
  SYSTEM_POLICY_SECTIONS,
} from "./systemPolicyConfig";

export default function SystemPoliciesPage() {
  const [savedPolicies, setSavedPolicies] = useState(DEFAULT_SYSTEM_POLICIES);
  const [draftPolicies, setDraftPolicies] = useState(DEFAULT_SYSTEM_POLICIES);
  const [lastSavedAt, setLastSavedAt] = useState(() => new Date());
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);

  const hasUnsavedChanges = useMemo(
    () => !arePoliciesEqual(savedPolicies, draftPolicies),
    [draftPolicies, savedPolicies],
  );

  const changedCount = useMemo(
    () =>
      Object.keys(DEFAULT_SYSTEM_POLICIES).filter(
        (key) => Number(savedPolicies[key]) !== Number(draftPolicies[key]),
      ).length,
    [draftPolicies, savedPolicies],
  );

  function updatePolicy(key, value) {
    setDraftPolicies((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function resetChanges() {
    setDraftPolicies(savedPolicies);
  }

  function saveChanges() {
    setSavedPolicies(draftPolicies);
    setLastSavedAt(new Date());
    setConfirmSaveOpen(false);
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            System Policies
          </h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
            Define future-facing system rules for cancellations, penalties,
            patient no-shows, appointment durations, queue estimates, check-in,
            and referral expiration.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <Badge
              variant={hasUnsavedChanges ? "secondary" : "outline"}
              className={
                hasUnsavedChanges
                  ? "bg-amber-50 text-amber-700"
                  : "bg-white text-slate-600"
              }
            >
              {hasUnsavedChanges ? "Unsaved changes" : "Saved"}
            </Badge>
            <span>{changedCount} changed fields</span>
            <span className="text-slate-300">/</span>
            <span>Last saved {formatPolicyTimestamp(lastSavedAt)}</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={resetChanges}
            disabled={!hasUnsavedChanges}
          >
            <Undo2 className="h-4 w-4" />
            Reset changes
          </Button>
          <Button
            onClick={() => setConfirmSaveOpen(true)}
            disabled={!hasUnsavedChanges}
          >
            <Save className="h-4 w-4" />
            Save changes
          </Button>
        </div>
      </div>

      <div className="space-y-5">
        {SYSTEM_POLICY_SECTIONS.map((section) => (
          <SystemPolicySection
            key={section.id}
            section={section}
            values={draftPolicies}
            savedValues={savedPolicies}
            onChange={updatePolicy}
          />
        ))}
      </div>

      <AlertDialog open={confirmSaveOpen} onOpenChange={setConfirmSaveOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <AlertTriangle className="h-5 w-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Save system policy changes?</AlertDialogTitle>
            <AlertDialogDescription>
              These mock policy values affect future appointments, refunds,
              queues, referrals, and patient violations once backend wiring is
              connected. Historical completed records are not recalculated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={saveChanges}>
              Save changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
