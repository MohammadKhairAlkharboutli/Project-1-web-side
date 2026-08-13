import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Save, Undo2 } from "lucide-react";

import { systemSettingsApi } from "@/api/systemSettingsApi";
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

function getErrorMessage(error, fallback) {
  const message = error.response?.data?.message;
  return Array.isArray(message) ? message.join(" ") : message || fallback;
}

function getPolicyValues(settings) {
  return Object.fromEntries(
    Object.keys(DEFAULT_SYSTEM_POLICIES).map((key) => [
      key,
      Number(settings[key]),
    ]),
  );
}

export default function SystemPoliciesPage() {
  const [savedPolicies, setSavedPolicies] = useState(DEFAULT_SYSTEM_POLICIES);
  const [draftPolicies, setDraftPolicies] = useState(DEFAULT_SYSTEM_POLICIES);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [confirmSaveOpen, setConfirmSaveOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [saveError, setSaveError] = useState("");
  const [saveNotice, setSaveNotice] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setLoadError("");

    try {
      const settings = await systemSettingsApi.getSettings();
      const values = getPolicyValues(settings);
      setSavedPolicies(values);
      setDraftPolicies(values);
      setLastSavedAt(settings.updatedAt);
    } catch (error) {
      setLoadError(getErrorMessage(error, "Unable to load system policies."));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadSettings, 0);
    return () => window.clearTimeout(timer);
  }, [loadSettings]);

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
    setDraftPolicies((current) => ({ ...current, [key]: value }));
    setSaveNotice("");
  }

  function resetChanges() {
    setDraftPolicies(savedPolicies);
    setSaveError("");
    setSaveNotice("");
  }

  async function saveChanges() {
    setIsSaving(true);
    setSaveError("");

    try {
      const settings = await systemSettingsApi.updateSettings(draftPolicies);
      const values = getPolicyValues(settings);
      setSavedPolicies(values);
      setDraftPolicies(values);
      setLastSavedAt(settings.updatedAt);
      setSaveNotice("System policies were saved successfully.");
      setConfirmSaveOpen(false);
    } catch (error) {
      setSaveError(getErrorMessage(error, "Unable to save system policies."));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            System Policies
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Define future-facing rules for cancellations, penalties, no-shows,
            appointments, queues, check-in, and referral expiration.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
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
            {lastSavedAt ? (
              <span>Last saved {formatPolicyTimestamp(lastSavedAt)}</span>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={resetChanges}
            disabled={isLoading || !hasUnsavedChanges || isSaving}
          >
            <Undo2 className="h-4 w-4" />
            Reset changes
          </Button>
          <Button
            onClick={() => {
              setSaveError("");
              setConfirmSaveOpen(true);
            }}
            disabled={isLoading || !hasUnsavedChanges || isSaving}
          >
            <Save className="h-4 w-4" />
            Save changes
          </Button>
        </div>
      </div>

      {saveNotice ? (
        <div
          className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
          role="status"
        >
          {saveNotice}
        </div>
      ) : null}

      {loadError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p>{loadError}</p>
          <Button className="mt-3" variant="outline" onClick={loadSettings}>
            Retry
          </Button>
        </div>
      ) : isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50 px-6 py-12 text-center text-sm text-slate-500">
          Loading system policies...
        </div>
      ) : (
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
      )}

      <AlertDialog
        open={confirmSaveOpen}
        onOpenChange={(open) => {
          if (!isSaving) {
            setConfirmSaveOpen(open);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <AlertTriangle className="h-5 w-5" />
            </AlertDialogMedia>
            <AlertDialogTitle>Save system policy changes?</AlertDialogTitle>
            <AlertDialogDescription>
              These changes affect future behavior. Historical completed records
              are not recalculated.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {saveError ? <p className="text-sm text-red-600">{saveError}</p> : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSaving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isSaving}
              onClick={(event) => {
                event.preventDefault();
                saveChanges();
              }}
            >
              {isSaving ? "Saving..." : "Save changes"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
