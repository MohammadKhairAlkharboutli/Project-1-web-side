import { useEffect, useId, useRef, useState } from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

/**
 * Server-backed selector for an appointment relation. It deliberately never
 * derives choices from the current appointment page: an administrator can
 * search the complete doctor, patient, or clinic directory instead.
 */
export default function AsyncAppointmentEntityFilter({
  label,
  selectedOption,
  onSelect,
  loadOptions,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [options, setOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");
  const containerRef = useRef(null);
  const listboxId = useId();
  const debouncedSearch = useDebouncedValue(search);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    let isCurrent = true;

    async function load() {
      setIsLoading(true);
      setLoadError("");

      try {
        const nextOptions = await loadOptions(debouncedSearch.trim());

        if (isCurrent) {
          setOptions(Array.isArray(nextOptions) ? nextOptions : []);
        }
      } catch {
        if (isCurrent) {
          setOptions([]);
          setLoadError("Options could not be loaded.");
        }
      } finally {
        if (isCurrent) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      isCurrent = false;
    };
  }, [debouncedSearch, isOpen, loadOptions]);

  useEffect(() => {
    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  function close() {
    setIsOpen(false);
    setSearch("");
    setLoadError("");
  }

  function selectOption(option) {
    onSelect(option);
    close();
  }

  function clearSelection() {
    onSelect(null);
    close();
  }

  return (
    <div ref={containerRef} className="relative w-full sm:w-52">
      <Button
        type="button"
        variant="outline"
        className={cn(
          "h-10 w-full justify-between rounded-md border-slate-300 bg-white px-3 font-normal text-slate-900 shadow-sm hover:border-slate-400 hover:bg-slate-50",
          selectedOption && "border-primary bg-blue-50/50",
        )}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className="flex min-w-0 items-center gap-1.5 truncate">
          <span className="shrink-0 text-slate-500">{label}:</span>
          <span className="truncate">
            {selectedOption?.label || `All ${label.toLowerCase()}s`}
          </span>
        </span>
        <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
      </Button>

      {isOpen ? (
        <div className="absolute z-30 mt-1 w-full min-w-64 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              autoFocus
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Escape") {
                  close();
                }
              }}
              placeholder={`Search ${label.toLowerCase()}s...`}
              className="h-10 border-slate-300 bg-white pl-8 shadow-sm"
              aria-label={`Search ${label.toLowerCase()}s`}
            />
          </div>

          <div
            id={listboxId}
            role="listbox"
            aria-label={`${label} options`}
            className="mt-2 max-h-60 overflow-y-auto"
          >
            <button
              type="button"
              role="option"
              aria-selected={!selectedOption}
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-accent"
              onClick={clearSelection}
            >
              <X className="size-4 text-muted-foreground" />
              All {label.toLowerCase()}s
            </button>

            {isLoading ? (
              <p className="px-2 py-3 text-sm text-muted-foreground">Loading…</p>
            ) : null}

            {loadError ? (
              <p className="px-2 py-3 text-sm text-destructive">{loadError}</p>
            ) : null}

            {!isLoading && !loadError && options.length === 0 ? (
              <p className="px-2 py-3 text-sm text-muted-foreground">
                No {label.toLowerCase()}s found.
              </p>
            ) : null}

            {!isLoading && !loadError
              ? options.map((option) => {
                  const isSelected = selectedOption?.id === option.id;

                  return (
                    <button
                      key={option.id}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      className={cn(
                        "flex w-full items-start gap-2 rounded-md px-2 py-2 text-left text-sm hover:bg-accent",
                        isSelected && "bg-accent",
                      )}
                      onClick={() => selectOption(option)}
                    >
                      <Check
                        className={cn(
                          "mt-0.5 size-4 shrink-0 text-primary",
                          !isSelected && "invisible",
                        )}
                      />
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{option.label}</span>
                        {option.description ? (
                          <span className="block truncate text-xs text-muted-foreground">
                            {option.description}
                          </span>
                        ) : null}
                      </span>
                    </button>
                  );
                })
              : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
