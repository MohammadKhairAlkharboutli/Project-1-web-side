import { useRef, useState } from "react";
import { Camera, KeyRound, Languages, LoaderCircle, RotateCcw, Save, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { authApi } from "@/api/authApi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { sharedSurfaceShell } from "@/components/shared/styles";
import { useAdminAccount } from "@/context/AdminAccountContext";

function getInitials(account) {
  return [account?.firstName, account?.lastName]
    .filter(Boolean)
    .map((name) => name.trim()[0])
    .join("")
    .toUpperCase() || "A";
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
  }).format(new Date(value));
}

function ProfileField({ label, children, className = "" }) {
  return (
    <label className={`grid gap-1.5 text-sm font-medium text-slate-700 ${className}`}>
      <span>{label}</span>
      {children}
    </label>
  );
}

function AccountInfo({ label, value }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1.5 break-words text-sm font-medium text-slate-800">{value}</p>
    </div>
  );
}

export default function AdminProfilePage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const {
    account,
    avatarUrl,
    error: accountError,
    isLoading,
    refreshAccount,
    updateAccount,
    uploadAvatar,
    removeAvatar,
  } = useAdminAccount();
  const [form, setForm] = useState(null);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isRemovingAvatar, setIsRemovingAvatar] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordError, setPasswordError] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [languagePreview, setLanguagePreview] = useState("en");

  const currentForm = form ?? {
    firstName: account?.firstName ?? "",
    lastName: account?.lastName ?? "",
    address: account?.address ?? "",
  };

  const hasChanges = (
    currentForm.firstName !== (account?.firstName ?? "")
    || currentForm.lastName !== (account?.lastName ?? "")
    || currentForm.address !== (account?.address ?? "")
  );

  function updateField(field, value) {
    setForm({ ...currentForm, [field]: value });
    setFormError("");
    setSuccessMessage("");
  }

  function resetForm() {
    setForm(null);
    setFormError("");
    setSuccessMessage("");
  }

  async function handleProfileSave(event) {
    event.preventDefault();

    const firstName = currentForm.firstName.trim();
    const lastName = currentForm.lastName.trim();

    if (!firstName || !lastName) {
      setFormError("Enter both your first and last name.");
      return;
    }

    if (firstName.length > 100 || lastName.length > 100) {
      setFormError("Names cannot be longer than 100 characters.");
      return;
    }

    setIsSaving(true);
    setFormError("");
    setSuccessMessage("");

    try {
      await updateAccount({ firstName, lastName, address: currentForm.address.trim() });
      setForm(null);
      setSuccessMessage("Profile details saved.");
    } catch (requestError) {
      setFormError(requestError?.response?.data?.message || "We could not save your profile.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleAvatarSelect(event) {
    const [file] = event.target.files ?? [];
    event.target.value = "";

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFormError("Choose an image file for your profile photo.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setFormError("Choose an image smaller than 5 MB.");
      return;
    }

    setIsUploadingAvatar(true);
    setFormError("");
    setSuccessMessage("");

    try {
      await uploadAvatar(file);
      setSuccessMessage("Profile photo updated.");
    } catch (requestError) {
      setFormError(requestError?.response?.data?.message || "We could not update your profile photo.");
    } finally {
      setIsUploadingAvatar(false);
    }
  }

  async function handleAvatarRemove() {
    setIsRemovingAvatar(true);
    setFormError("");
    setSuccessMessage("");

    try {
      await removeAvatar();
      setSuccessMessage("Profile photo removed.");
    } catch (requestError) {
      setFormError(requestError?.response?.data?.message || "We could not remove your profile photo.");
    } finally {
      setIsRemovingAvatar(false);
    }
  }

  function updatePasswordField(field, value) {
    setPasswordForm((current) => ({ ...current, [field]: value }));
    setPasswordError("");
  }

  async function handlePasswordChange(event) {
    event.preventDefault();

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError("Complete all password fields.");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError("Your new password must contain at least 8 characters.");
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("Your new password and confirmation do not match.");
      return;
    }

    setIsChangingPassword(true);
    setPasswordError("");

    try {
      await authApi.changePassword({
        oldPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      authApi.clearSession();
      navigate("/login", { replace: true, state: { passwordChanged: true } });
    } catch (requestError) {
      const message = requestError?.response?.data?.message;
      setPasswordError(Array.isArray(message) ? message.join(" ") : message || "We could not change your password.");
    } finally {
      setIsChangingPassword(false);
    }
  }

  if (isLoading && !account) {
    return (
      <section className={`${sharedSurfaceShell} flex min-h-64 items-center justify-center p-6 text-sm text-slate-500`}>
        <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
        Loading your profile…
      </section>
    );
  }

  if (!account) {
    return (
      <section className={`${sharedSurfaceShell} mx-auto max-w-xl p-6`}>
        <h1 className="text-xl font-semibold text-slate-900">Profile unavailable</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {accountError || "We could not retrieve your account details."}
        </p>
        <Button className="mt-5" onClick={() => refreshAccount().catch(() => undefined)}>
          Try again
        </Button>
      </section>
    );
  }

  const initials = getInitials(account);
  const fullName = [account.firstName, account.lastName].filter(Boolean).join(" ") || "Administrator";
  const hasAvatar = Boolean(account.avatarUrl);

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Profile and security</h1>
        <p className="mt-1 text-sm text-slate-600">Manage your administrator identity, profile photo, and password.</p>
      </div>

      <section className={`${sharedSurfaceShell} p-5 sm:p-6`}>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <div className="relative shrink-0">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Your profile" className="h-20 w-20 rounded-2xl object-cover ring-1 ring-slate-200" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[var(--color-primary)] text-2xl font-semibold text-white">
                  {initials}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h2 className="truncate text-lg font-semibold text-slate-900">{fullName}</h2>
              <p className="mt-1 text-sm text-slate-600">Administrator</p>
              <p className="mt-1 truncate text-sm text-slate-500">{account.email || account.phone || "No contact information"}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarSelect} />
            <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isUploadingAvatar || isRemovingAvatar}>
              {isUploadingAvatar ? <LoaderCircle className="animate-spin" /> : <Camera />}
              {hasAvatar ? "Change photo" : "Upload photo"}
            </Button>
            {hasAvatar && (
              <Button type="button" variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={handleAvatarRemove} disabled={isUploadingAvatar || isRemovingAvatar}>
                {isRemovingAvatar ? <LoaderCircle className="animate-spin" /> : <Trash2 />}
                Remove
              </Button>
            )}
          </div>
        </div>
      </section>

      {(formError || successMessage) && (
        <p className={`rounded-xl px-4 py-3 text-sm ${formError ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"}`}>
          {formError || successMessage}
        </p>
      )}

      <form className={`${sharedSurfaceShell} p-5 sm:p-6`} onSubmit={handleProfileSave}>
        <div className="flex flex-col gap-1 border-b border-slate-100 pb-5">
          <h2 className="text-base font-semibold text-slate-900">Personal details</h2>
          <p className="text-sm text-slate-600">Use the name that should appear across the admin workspace.</p>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <ProfileField label="First name">
            <Input value={currentForm.firstName} maxLength={100} onChange={(event) => updateField("firstName", event.target.value)} autoComplete="given-name" />
          </ProfileField>
          <ProfileField label="Last name">
            <Input value={currentForm.lastName} maxLength={100} onChange={(event) => updateField("lastName", event.target.value)} autoComplete="family-name" />
          </ProfileField>
          <ProfileField label="Address" className="sm:col-span-2">
            <textarea value={currentForm.address} onChange={(event) => updateField("address", event.target.value)} rows={3} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-3 focus:ring-blue-100" autoComplete="street-address" />
          </ProfileField>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={resetForm} disabled={!hasChanges || isSaving}>
            <RotateCcw />
            Reset
          </Button>
          <Button type="submit" disabled={!hasChanges || isSaving}>
            {isSaving ? <LoaderCircle className="animate-spin" /> : <Save />}
            Save changes
          </Button>
        </div>
      </form>

      <section className={`${sharedSurfaceShell} p-5 sm:p-6`}>
        <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
          <div className="rounded-lg bg-[var(--color-primary-light)] p-2 text-[var(--color-primary)]"><UserRound className="h-5 w-5" /></div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Account information</h2>
            <p className="mt-1 text-sm text-slate-600">These account fields are managed by the system.</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <AccountInfo label="Email" value={account.email || "Not available"} />
          <AccountInfo label="Role" value="Administrator" />
          <AccountInfo label="Verification" value={account.isVerified ? "Verified" : "Not verified"} />
          <AccountInfo label="Member since" value={formatDate(account.created_at)} />
        </div>
        {account.isVerified && (
          <p className="mt-4 flex items-center gap-2 text-sm text-emerald-700"><ShieldCheck className="h-4 w-4" /> Your administrator account is verified.</p>
        )}
      </section>

      <section className={`${sharedSurfaceShell} p-5 sm:p-6`}>
        <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
          <div className="rounded-lg bg-[var(--color-primary-light)] p-2 text-[var(--color-primary)]"><Languages className="h-5 w-5" /></div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Language</h2>
            <p className="mt-1 text-sm text-slate-600">Language support is coming soon. This selection is a preview only and is not saved yet.</p>
          </div>
        </div>
        <label className="mt-5 grid max-w-sm gap-1.5 text-sm font-medium text-slate-700">
          Display language
          <select value={languagePreview} onChange={(event) => setLanguagePreview(event.target.value)} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-sm text-slate-900 outline-none transition focus:border-[var(--color-primary)] focus:ring-3 focus:ring-blue-100">
            <option value="en">English</option>
            <option value="ar">Arabic</option>
          </select>
        </label>
        {languagePreview === "ar" && (
          <p className="mt-3 text-sm text-amber-700">Arabic interface support will be available in the next update.</p>
        )}
      </section>

      <form className={`${sharedSurfaceShell} p-5 sm:p-6`} onSubmit={handlePasswordChange}>
        <div className="flex items-start gap-3 border-b border-slate-100 pb-5">
          <div className="rounded-lg bg-amber-50 p-2 text-amber-700"><KeyRound className="h-5 w-5" /></div>
          <div>
            <h2 className="text-base font-semibold text-slate-900">Password and security</h2>
            <p className="mt-1 text-sm text-slate-600">Changing your password signs you out on this device and any other active session.</p>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-sm font-medium text-slate-700 sm:col-span-2">
            Current password
            <Input type="password" value={passwordForm.currentPassword} onChange={(event) => updatePasswordField("currentPassword", event.target.value)} autoComplete="current-password" />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            New password
            <Input type="password" value={passwordForm.newPassword} onChange={(event) => updatePasswordField("newPassword", event.target.value)} autoComplete="new-password" />
          </label>
          <label className="grid gap-1.5 text-sm font-medium text-slate-700">
            Confirm new password
            <Input type="password" value={passwordForm.confirmPassword} onChange={(event) => updatePasswordField("confirmPassword", event.target.value)} autoComplete="new-password" />
          </label>
        </div>
        <p className="mt-3 text-xs leading-5 text-slate-500">Use at least 8 characters. Do not reuse a password from another service.</p>
        {passwordError && <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{passwordError}</p>}
        <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
          <Button type="submit" disabled={isChangingPassword}>{isChangingPassword ? <LoaderCircle className="animate-spin" /> : <ShieldCheck />} Change password</Button>
        </div>
      </form>
    </section>
  );
}
