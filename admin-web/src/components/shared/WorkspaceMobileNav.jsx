import { NavLink } from "react-router-dom";

import { cn } from "@/lib/utils";

/** Compact, scrollable navigation shared by role workspaces on narrow screens. */
export default function WorkspaceMobileNav({ items, label = "Workspace navigation" }) {
  return (
    <nav
      className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-card px-3 py-2 lg:hidden"
      aria-label={label}
    >
      {items.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.end}
            className={({ isActive }) => cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-md px-3 py-2 text-xs font-semibold transition-colors",
              isActive
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
            )}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );
}
