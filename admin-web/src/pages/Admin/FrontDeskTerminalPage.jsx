import { useCallback, useEffect, useState } from "react";
import { KeyRound, LoaderCircle, MonitorCog, Power, ShieldCheck } from "lucide-react";

import { frontDeskTerminalApi } from "@/api/frontDeskTerminalApi";
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
import { Badge } from "@/components/ui/badge";
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

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message || error?.message;
  return Array.isArray(message) ? message.join(" ") : message || fallback;
}

function PasswordDialog({ mode, onClose, onSubmit, isSubmitting, error }) {
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [validationError, setValidationError] = useState("");
  const isSetup = mode === "setup";

  function submit(event) {
    event.preventDefault();

    if (password.length < 8) {
      setValidationError("Use a password with at least 8 characters.");
      return;
    }

    if (password !== confirmation) {
      setValidationError("The password confirmation does not match.");
      return;
    }

    setValidationError("");
    onSubmit(password);
  }

  return (
    <Dialog
      open={Boolean(mode)}
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isSetup ? "Set up Front Desk Terminal" : "Reset terminal password"}</DialogTitle>
          <DialogDescription>
            {isSetup
              ? "Set the shared password for the hospital front-desk workspace. The password is stored securely and cannot be viewed later."
              : "This immediately replaces the shared password and signs out all existing terminal sessions."}
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4 px-5 py-5" onSubmit={submit}>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            New shared password
            <Input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isSubmitting}
            />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Confirm shared password
            <Input
              type="password"
              autoComplete="new-password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              disabled={isSubmitting}
            />
          </label>
          {validationError || error ? (
            <p className="text-sm text-rose-700" role="alert">
              {validationError || error}
            </p>
          ) : null}
          <DialogFooter className="-mx-5 -mb-5 mt-5">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <LoaderCircle className="animate-spin" /> : <KeyRound className="h-4 w-4" />}
              {isSetup ? "Set up terminal" : "Reset password"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function FrontDeskTerminalPage() {
  const [terminal, setTerminal] = useState(null);
  const [loadState, setLoadState] = useState("loading");
  const [loadError, setLoadError] = useState("");
  const [notice, setNotice] = useState("");
  const [passwordMode, setPasswordMode] = useState(null);
  const [passwordError, setPasswordError] = useState("");
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [isSavingStatus, setIsSavingStatus] = useState(false);
  const [statusError, setStatusError] = useState("");

  const loadTerminal = useCallback(async () => {
    setLoadState("loading");
    setLoadError("");

    try {
      setTerminal(await frontDeskTerminalApi.getTerminal());
      setLoadState("ready");
    } catch (error) {
      setLoadError(getErrorMessage(error, "Unable to load the Front Desk Terminal."));
      setLoadState("error");
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(loadTerminal, 0);
    return () => window.clearTimeout(timer);
  }, [loadTerminal]);

  async function savePassword(password) {
    setIsSavingPassword(true);
    setPasswordError("");

    try {
      const updatedTerminal = passwordMode === "setup"
        ? await frontDeskTerminalApi.setup(password)
        : await frontDeskTerminalApi.resetPassword(password);
      setTerminal(updatedTerminal);
      setNotice(
        passwordMode === "setup"
          ? "Front Desk Terminal is ready to use."
          : "The terminal password was reset and existing terminal sessions were signed out.",
      );
      setPasswordMode(null);
    } catch (error) {
      setPasswordError(getErrorMessage(error, "Unable to save the terminal password."));
    } finally {
      setIsSavingPassword(false);
    }
  }

  async function saveStatus() {
    if (!terminal) return;

    const nextActiveState = !terminal.isActive;
    setIsSavingStatus(true);
    setStatusError("");

    try {
      const updatedTerminal = await frontDeskTerminalApi.setStatus(nextActiveState);
      setTerminal(updatedTerminal);
      setNotice(
        nextActiveState
          ? "Front Desk Terminal is enabled. Staff can sign in again."
          : "Front Desk Terminal is disabled and existing terminal sessions were signed out.",
      );
      setStatusDialogOpen(false);
    } catch (error) {
      setStatusError(getErrorMessage(error, "Unable to update terminal access."));
    } finally {
      setIsSavingStatus(false);
    }
  }

  const isConfigured = Boolean(terminal?.isConfigured);
  const isActive = Boolean(terminal?.isActive);

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Front Desk Terminal</h1>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          Manage the single shared account used by front-desk staff to operate clinic queues.
        </p>
      </div>

      {notice ? (
        <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800" role="status">
          {notice}
        </p>
      ) : null}

      {loadState === "loading" ? (
        <div className="flex min-h-56 items-center justify-center rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> Loading Front Desk Terminal...
        </div>
      ) : loadState === "error" ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-5 text-sm text-rose-800" role="alert">
          <p>{loadError}</p>
          <Button className="mt-4" variant="outline" onClick={loadTerminal}>Try again</Button>
        </div>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <header className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
            <div className="flex min-w-0 items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <MonitorCog className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">Shared queue workspace</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  This is a hospital terminal account, not an individual employee account.
                </p>
              </div>
            </div>
            <Badge className={isConfigured && isActive ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}>
              {isConfigured ? (isActive ? "Active" : "Disabled") : "Not set up"}
            </Badge>
          </header>

          <dl className="grid gap-4 p-5 sm:grid-cols-2 sm:p-6">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Login email</dt>
              <dd className="mt-1.5 break-all text-sm font-medium text-slate-800">{terminal?.email}</dd>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Access scope</dt>
              <dd className="mt-1.5 text-sm font-medium text-slate-800">Queue workspace only</dd>
            </div>
          </dl>

          <div className="border-t border-slate-100 bg-slate-50/70 p-5 sm:flex sm:items-center sm:justify-between sm:gap-5 sm:p-6">
            <p className="max-w-xl text-sm leading-6 text-slate-600">
              Passwords are never displayed. Resetting the password or disabling this terminal immediately signs out existing terminal sessions.
            </p>
            <div className="mt-4 flex shrink-0 flex-wrap gap-2 sm:mt-0">
              <Button
                onClick={() => {
                  setNotice("");
                  setPasswordError("");
                  setPasswordMode(isConfigured ? "reset" : "setup");
                }}
              >
                <KeyRound className="h-4 w-4" />
                {isConfigured ? "Reset password" : "Set up terminal"}
              </Button>
              {isConfigured ? (
                <Button
                  variant={isActive ? "outline" : "default"}
                  onClick={() => {
                    setNotice("");
                    setStatusError("");
                    setStatusDialogOpen(true);
                  }}
                >
                  {isActive ? <Power className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
                  {isActive ? "Disable terminal" : "Enable terminal"}
                </Button>
              ) : null}
            </div>
          </div>
        </section>
      )}

      {passwordMode ? (
        <PasswordDialog
          key={passwordMode}
          mode={passwordMode}
          onClose={() => {
            if (!isSavingPassword) setPasswordMode(null);
          }}
          onSubmit={savePassword}
          isSubmitting={isSavingPassword}
          error={passwordError}
        />
      ) : null}

      <AlertDialog
        open={statusDialogOpen}
        onOpenChange={(open) => {
          if (!isSavingStatus) setStatusDialogOpen(open);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              {isActive ? <Power className="h-5 w-5" /> : <ShieldCheck className="h-5 w-5" />}
            </AlertDialogMedia>
            <AlertDialogTitle>{isActive ? "Disable Front Desk Terminal?" : "Enable Front Desk Terminal?"}</AlertDialogTitle>
            <AlertDialogDescription>
              {isActive
                ? "No one will be able to use the shared terminal account, and current terminal sessions will be signed out immediately."
                : "Front-desk staff will be able to sign in to the shared queue workspace again."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {statusError ? <p className="text-sm text-rose-700" role="alert">{statusError}</p> : null}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSavingStatus}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant={isActive ? "destructive" : "default"}
              disabled={isSavingStatus}
              onClick={(event) => {
                event.preventDefault();
                saveStatus();
              }}
            >
              {isSavingStatus ? <LoaderCircle className="animate-spin" /> : null}
              {isActive ? "Disable terminal" : "Enable terminal"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
