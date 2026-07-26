import { NavLink } from "react-router-dom";

export default function PatientProfileNav({ patientId }) {
  const tabs = [
    {
      label: "Overview",
      to: `/admin/patients/${patientId}`,
      end: true,
    },
    {
      label: "Medical Info",
      to: `/admin/patients/${patientId}/medical-info`,
      end: false,
    },
    {
      label: "Medical History",
      to: `/admin/patients/${patientId}/medical-history`,
      end: false,
    },
    {
      label: "Appointments",
      to: `/admin/patients/${patientId}/appointments`,
      end: false,
    },
    {
      label: "Profile Logs",
      to: `/admin/patients/${patientId}/profile-logs`,
      end: false,
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
