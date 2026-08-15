import { useEffect, useMemo, useState } from "react";

import { appointmentsApi } from "@/api/appointmentsApi";
import { getAppointmentDateQuery } from "@/components/shared/Appointments/appointmentFilters";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

function getErrorMessage(error) {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "We could not load the appointments. Please try again.";

  return Array.isArray(message) ? message.join(" ") : message;
}

export function useAdminAppointments(baseFilters = {}) {
  const [appointments, setAppointments] = useState([]);
  const [total, setTotal] = useState(0);
  const [pagination, setPagination] = useState(() => ({
    scopeKey: JSON.stringify(baseFilters),
    page: 1,
    limit: 10,
  }));
  const [search, setSearchState] = useState("");
  const [status, setStatusState] = useState("all");
  const [paymentStatus, setPaymentStatusState] = useState("all");
  const [dateRange, setDateRangeState] = useState("all");
  const [exactDate, setExactDateState] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [reloadAttempt, setReloadAttempt] = useState(0);
  const debouncedSearch = useDebouncedValue(search);
  const baseFilterKey = JSON.stringify(baseFilters);
  const normalizedBaseFilters = useMemo(
    () => JSON.parse(baseFilterKey),
    [baseFilterKey],
  );
  const currentPagination =
    pagination.scopeKey === baseFilterKey
      ? pagination
      : { scopeKey: baseFilterKey, page: 1, limit: pagination.limit };
  const { page, limit } = currentPagination;
  const dateFilters = useMemo(
    () => getAppointmentDateQuery(dateRange, exactDate),
    [dateRange, exactDate],
  );
  const requestFilters = useMemo(
    () => ({
      ...normalizedBaseFilters,
      ...(debouncedSearch.trim() ? { search: debouncedSearch.trim() } : {}),
      ...(status !== "all" ? { status } : {}),
      ...(paymentStatus !== "all" ? { paymentStatus } : {}),
      ...dateFilters,
      page,
      limit,
    }),
    [
      dateFilters,
      debouncedSearch,
      limit,
      normalizedBaseFilters,
      page,
      paymentStatus,
      status,
    ],
  );

  useEffect(() => {
    let isCurrent = true;

    async function loadAppointments() {
      setIsLoading(true);

      try {
        const response = await appointmentsApi.getAdminAppointments(requestFilters);

        if (isCurrent) {
          setAppointments(response.data);
          setTotal(response.total);
          setLoadError("");
        }
      } catch (error) {
        if (isCurrent) {
          setLoadError(getErrorMessage(error));
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    loadAppointments();

    return () => {
      isCurrent = false;
    };
  }, [reloadAttempt, requestFilters]);

  function setPage(nextPage) {
    setPagination((current) => ({
      scopeKey: baseFilterKey,
      page: nextPage,
      limit: current.limit,
    }));
  }

  function setSearch(value) {
    setSearchState(value);
    setPage(1);
  }

  function setStatus(value) {
    setStatusState(value);
    setPage(1);
  }

  function setPaymentStatus(value) {
    setPaymentStatusState(value);
    setPage(1);
  }

  function setDateRange(value) {
    setDateRangeState(value);
    setExactDateState("");
    setPage(1);
  }

  function setExactDate(value) {
    setExactDateState(value);
    setDateRangeState("all");
    setPage(1);
  }

  function setPageSize(nextLimit) {
    setPagination({
      scopeKey: baseFilterKey,
      page: 1,
      limit: nextLimit,
    });
  }

  function resetFilters() {
    setSearchState("");
    setStatusState("all");
    setPaymentStatusState("all");
    setDateRangeState("all");
    setExactDateState("");
    setPage(1);
  }

  function retryLoad() {
    setReloadAttempt((attempt) => attempt + 1);
  }

  return {
    appointments,
    total,
    page,
    limit,
    search,
    status,
    paymentStatus,
    dateRange,
    exactDate,
    isLoading,
    loadError,
    setPage,
    setPageSize,
    setSearch,
    setStatus,
    setPaymentStatus,
    setDateRange,
    setExactDate,
    resetFilters,
    retryLoad,
  };
}
