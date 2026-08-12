import { NavLink } from "react-router-dom";

export default function DoctorProfileNav({ doctorId }) {
  const tabs = [
    {
      label: "Overview",
      to: `/admin/doctors/${doctorId}`,
      end: true,
    },
    {
      label: "Schedules",
      to: `/admin/doctors/${doctorId}/schedules`,
    },
    {
      label: "Appointments",
      to: `/admin/doctors/${doctorId}/appointments`,
    },
  ];

  return (
    <nav className="flex min-w-max items-center gap-1">
      {tabs.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            [
              "rounded-xl px-4 py-2 text-sm font-medium transition",
              isActive
                ? "bg-[var(--color-primary)] text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            ].join(" ")
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
