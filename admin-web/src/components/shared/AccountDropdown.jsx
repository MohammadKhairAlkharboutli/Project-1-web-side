import { ChevronDown, LogOut, Settings, User } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function AccountDropdown({
  name,
  subtitle,
  initials,
  avatarUrl,
  onProfile,
  onSettings,
  onLogout,
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex min-w-0 items-center gap-3 rounded-2xl border border-slate-200/60 bg-slate-50 p-1.5 pl-3 transition-all hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
          aria-label="Open account menu"
        >
          <span className="hidden max-w-44 truncate text-right text-xs font-bold text-slate-800 sm:block">
            {name}
          </span>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-blue-100 text-xs font-bold text-blue-700">
            {avatarUrl ? (
              <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </span>
          <ChevronDown className="mr-1 h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52 rounded-2xl border-slate-100 bg-white p-2 shadow-xl">
        <div className="mb-1 border-b border-slate-100 px-3 py-2">
          <p className="truncate text-xs font-bold text-slate-900">{name}</p>
          <p className="mt-0.5 truncate text-[10px] font-medium text-blue-600">{subtitle}</p>
        </div>
        <DropdownMenuItem onSelect={onProfile} className="rounded-xl py-2.5 text-xs font-bold">
          <User className="h-4 w-4" />
          Profile
        </DropdownMenuItem>
        {onSettings ? (
          <DropdownMenuItem onSelect={onSettings} className="rounded-xl py-2.5 text-xs font-bold">
            <Settings className="h-4 w-4" />
            Settings
          </DropdownMenuItem>
        ) : null}
        <DropdownMenuSeparator className="my-1" />
        <DropdownMenuItem
          variant="destructive"
          onSelect={onLogout}
          className="rounded-xl py-2.5 text-xs font-bold"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
