/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

import { adminAccountApi } from "@/api/adminAccountApi";

const AdminAccountContext = createContext(null);

function getErrorMessage(error, fallback) {
  const message = error?.response?.data?.message;

  if (Array.isArray(message)) {
    return message.join(" ");
  }

  return message || fallback;
}

export function AdminAccountProvider({ children }) {
  const avatarObjectUrlRef = useRef(null);
  const [account, setAccount] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const clearAvatarUrl = useCallback(() => {
    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(avatarObjectUrlRef.current);
      avatarObjectUrlRef.current = null;
    }

    setAvatarUrl(null);
  }, []);

  const loadAvatar = useCallback(async (user) => {
    clearAvatarUrl();

    if (!user?.avatarUrl) {
      return;
    }

    try {
      const nextAvatarUrl = await adminAccountApi.getAvatar();
      avatarObjectUrlRef.current = nextAvatarUrl;
      setAvatarUrl(nextAvatarUrl);
    } catch (avatarError) {
      if (avatarError?.response?.status !== 404) {
        console.warn("Could not load the account avatar", avatarError);
      }
    }
  }, [clearAvatarUrl]);

  const refreshAccount = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const nextAccount = await adminAccountApi.getCurrentAccount();
      setAccount(nextAccount);
      await loadAvatar(nextAccount);
      return nextAccount;
    } catch (requestError) {
      setError(getErrorMessage(requestError, "We could not load your account details."));
      throw requestError;
    } finally {
      setIsLoading(false);
    }
  }, [loadAvatar]);

  useEffect(() => {
    // The initial account request necessarily changes loading and account state.
    // Keep it scoped to the authenticated admin shell lifecycle.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refreshAccount().catch(() => undefined);

    return () => {
      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current);
      }
    };
  }, [refreshAccount]);

  const updateAccount = useCallback(async (updates) => {
    if (!account?.id) {
      throw new Error("Your account has not loaded yet.");
    }

    const updatedAccount = await adminAccountApi.updateAccount(account.id, updates);
    setAccount(updatedAccount);
    return updatedAccount;
  }, [account]);

  const uploadAvatar = useCallback(async (file) => {
    const updatedAccount = await adminAccountApi.uploadAvatar(file);
    setAccount(updatedAccount);
    await loadAvatar(updatedAccount);
    return updatedAccount;
  }, [loadAvatar]);

  const removeAvatar = useCallback(async () => {
    await adminAccountApi.removeAvatar();
    setAccount((current) => (current ? { ...current, avatarUrl: null } : current));
    clearAvatarUrl();
  }, [clearAvatarUrl]);

  return (
    <AdminAccountContext.Provider
      value={{
        account,
        avatarUrl,
        isLoading,
        error,
        refreshAccount,
        updateAccount,
        uploadAvatar,
        removeAvatar,
      }}
    >
      {children}
    </AdminAccountContext.Provider>
  );
}

export function useAdminAccount() {
  const context = useContext(AdminAccountContext);

  if (!context) {
    throw new Error("useAdminAccount must be used within an AdminAccountProvider.");
  }

  return context;
}
