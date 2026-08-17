import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Label,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  Hospital,
  ListOrdered,
  Star,
  Stethoscope,
  Users,
  UserPlus,
} from "lucide-react";

import { adminDashboardApi } from "@/api/adminDashboardApi";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const RANGE_OPTIONS = [
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "12m", label: "12 months" },
];

const CHART_VIEWS = [
  { value: "appointments", label: "Appointments" },
  { value: "revenue", label: "Revenue" },
];

const STATUS_COLORS = {
  confirmed: "var(--color-primary)",
  completed: "var(--color-success)",
  cancelled: "var(--color-destructive)",
  no_show: "var(--color-warning)",
  in_progress: "var(--color-violet)",
};

const statusLabels = {
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
  no_show: "No-show",
  in_progress: "In progress",
};

const quickActions = [
  { label: "Manage Doctors", to: "/admin/doctors", icon: Stethoscope },
  { label: "Manage Clinics", to: "/admin/clinics", icon: Hospital },
  { label: "View Appointments", to: "/admin/appointments", icon: CalendarDays },
  { label: "Live Queue", to: "/admin/queue", icon: ListOrdered },
  { label: "Schedule Requests", to: "/admin/schedule-change-requests", icon: CalendarClock },
  { label: "Rating Reports", to: "/admin/rating-reports", icon: Star },
];

const chartConfig = {
  totalAppointments: {
    label: "Total",
    color: "var(--color-primary)",
  },
  completedAppointments: {
    label: "Completed",
    color: "var(--color-success)",
  },
  missedOrCancelledAppointments: {
    label: "Missed / Cancelled",
    color: "var(--color-warning)",
  },
  completedRevenue: {
    label: "Revenue",
    color: "var(--color-teal)",
  },
};

function formatNumber(value) {
  return Number(value || 0).toLocaleString();
}

function formatMoney(value) {
  return `$${Number(value || 0).toLocaleString()}`;
}

function getStatusVariant(status) {
  if (status === "active") {
    return "default";
  }

  if (status === "inactive" || status === "closed") {
    return "secondary";
  }

  return "outline";
}

function getStatusLabel(status) {
  if (!status) {
    return "Unknown";
  }

  return String(status)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getErrorMessage(error) {
  const message =
    error?.response?.data?.message ||
    error?.message ||
    "We could not load the dashboard. Please try again.";

  return Array.isArray(message) ? message.join(" ") : message;
}

function DashboardLoadingState() {
  return (
    <div className="space-y-6" aria-live="polite" aria-busy="true">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }, (_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-2xl border border-slate-200 bg-slate-100"
          />
        ))}
      </div>
      <div className="h-80 animate-pulse rounded-2xl border border-slate-200 bg-slate-100" />
      <p className="text-center text-sm text-slate-500">Loading dashboard data...</p>
    </div>
  );
}

function DashboardErrorState({ message, onRetry }) {
  return (
    <div
      className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900"
      role="alert"
    >
      <h2 className="text-lg font-semibold">Dashboard data is unavailable</h2>
      <p className="mt-2 text-sm text-red-700">{message}</p>
      <Button className="mt-4" variant="outline" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

function StatCard({ card }) {
  const Icon = card.icon;

  return (
    <Link
      to={card.to}
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:bg-blue-50/30"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">{card.label}</p>
          <p className="mt-2 truncate text-2xl font-semibold tracking-tight text-slate-900">
            {card.value}
          </p>
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
          <Icon className="h-5 w-5" />
        </span>
      </div>
      <p className="mt-3 min-h-10 text-sm leading-5 text-slate-500">
        {card.helper}
      </p>
    </Link>
  );
}

function Section({ title, description, action, children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 px-5 py-4">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          {description ? (
            <p className="mt-1 text-sm text-slate-500">{description}</p>
          ) : null}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

function SegmentedControl({ options, value, onChange, label, appearance = "default" }) {
  const inverse = appearance === "inverse";

  return (
    <div className={`flex flex-wrap gap-1 rounded-xl border p-1 ${inverse ? "border-white/25 bg-white/10 backdrop-blur-sm" : "border-slate-200 bg-slate-50"}`} aria-label={label}>
      {options.map((option) => (
        <Button
          key={option.value}
          type="button"
          size="sm"
          variant="ghost"
          className={`h-8 px-3 text-xs font-semibold ${inverse ? (value === option.value ? "bg-white text-blue-700 hover:bg-blue-50 hover:text-blue-700" : "text-white hover:bg-white/15 hover:text-white") : (value === option.value ? "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground" : "text-slate-600 hover:bg-white hover:text-slate-900")}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}

function DashboardTrendChart({ data, view }) {
  const isRevenueView = view === "revenue";

  if (!data.length) {
    return (
      <div className="flex h-80 items-center justify-center rounded-xl bg-slate-50 text-sm text-slate-500">
        No appointment or revenue activity in this range.
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-80 w-full">
      <AreaChart data={data} margin={{ left: 12, right: 12, top: 12, bottom: 0 }}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="period"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={24}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          width={44}
          tickFormatter={(value) => (isRevenueView ? `$${Number(value) / 1000}k` : value)}
        />
        <ChartTooltip
          cursor={false}
          content={
            <ChartTooltipContent
              indicator="line"
              formatter={(value, name) => {
                const label = chartConfig[name]?.label ?? name;
                const displayValue = name === "completedRevenue" ? formatMoney(value) : formatNumber(value);

                return (
                  <div className="flex min-w-32 items-center justify-between gap-6">
                    <span className="text-slate-500">{label}</span>
                    <span className="font-mono font-medium text-slate-900">{displayValue}</span>
                  </div>
                );
              }}
            />
          }
        />
        {isRevenueView ? (
          <Area
            type="monotone"
            dataKey="completedRevenue"
            stroke="var(--color-completedRevenue)"
            fill="var(--color-completedRevenue)"
            fillOpacity={0.16}
            strokeWidth={2.4}
          />
        ) : (
          <>
            <Area
              type="monotone"
              dataKey="totalAppointments"
              stroke="var(--color-totalAppointments)"
              fill="var(--color-totalAppointments)"
              fillOpacity={0.12}
              strokeWidth={2.4}
            />
            <Area
              type="monotone"
              dataKey="completedAppointments"
              stroke="var(--color-completedAppointments)"
              fill="var(--color-completedAppointments)"
              fillOpacity={0.08}
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="missedOrCancelledAppointments"
              stroke="var(--color-missedOrCancelledAppointments)"
              fill="var(--color-missedOrCancelledAppointments)"
              fillOpacity={0.08}
              strokeWidth={2}
            />
          </>
        )}
      </AreaChart>
    </ChartContainer>
  );
}

function AppointmentStatusDonut({ data }) {
  const total = data.reduce((sum, item) => sum + Number(item.count || 0), 0);

  if (!data.length || total === 0) {
    return (
      <div className="flex h-72 items-center justify-center p-5 text-center text-sm text-slate-500">
        No appointment statuses recorded in this range.
      </div>
    );
  }

  return (
    <div className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_180px] lg:items-center">
      <ChartContainer config={{}} className="mx-auto h-64 w-full max-w-sm">
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(value, name) => (
                  <div className="flex min-w-32 items-center justify-between gap-6">
                    <span className="text-slate-500">{statusLabels[name] ?? name}</span>
                    <span className="font-mono font-medium text-slate-900">{formatNumber(value)}</span>
                  </div>
                )}
              />
            }
          />
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            innerRadius={62}
            outerRadius={92}
            paddingAngle={2}
            strokeWidth={3}
          >
            {data.map((item) => (
              <Cell key={item.status} fill={STATUS_COLORS[item.status] ?? "var(--color-muted-foreground)"} />
            ))}
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !("cx" in viewBox) || !("cy" in viewBox)) {
                  return null;
                }

                return (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan x={viewBox.cx} y={viewBox.cy} className="fill-slate-900 text-2xl font-semibold">
                      {formatNumber(total)}
                    </tspan>
                    <tspan x={viewBox.cx} y={(viewBox.cy || 0) + 22} className="fill-slate-500 text-xs">
                      visits
                    </tspan>
                  </text>
                );
              }}
            />
          </Pie>
        </PieChart>
      </ChartContainer>

      <div className="grid gap-2">
        {data.map((item) => (
          <div key={item.status} className="flex items-center justify-between gap-4 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2">
            <span className="flex min-w-0 items-center gap-2 text-sm text-slate-600">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[item.status] ?? "var(--color-muted-foreground)" }}
              />
              <span className="truncate">{statusLabels[item.status] ?? getStatusLabel(item.status)}</span>
            </span>
            <span className="font-mono text-sm font-medium text-slate-900">
              {formatNumber(item.count)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TopRatedDoctorsTable({ doctors }) {
  if (!doctors.length) {
    return (
      <div className="p-5 text-sm text-slate-500">
        No visible doctor ratings yet.
      </div>
    );
  }

  return (
    <div className="p-5">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Doctor</TableHead>
            <TableHead>Specialty</TableHead>
            <TableHead>Rating</TableHead>
            <TableHead>Reviews</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctors.map((doctor) => (
            <TableRow key={doctor.doctorId}>
              <TableCell>
                <Link to={`/admin/doctors/${doctor.doctorId}`} className="font-medium text-slate-900 hover:text-blue-700">
                  {doctor.fullName || "Unknown doctor"}
                </Link>
              </TableCell>
              <TableCell className="text-slate-600">{doctor.specialization || "N/A"}</TableCell>
              <TableCell>
                <span className="inline-flex items-center gap-1 font-medium text-slate-900">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {Number(doctor.averageRating || 0).toFixed(1)}
                </span>
              </TableCell>
              <TableCell className="text-slate-600">{formatNumber(doctor.ratingCount)}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(doctor.status)}>
                  {getStatusLabel(doctor.status)}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function Dashboard() {
  const [range, setRange] = useState("30d");
  const [chartView, setChartView] = useState("appointments");
  const [dashboardData, setDashboardData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [loadAttempt, setLoadAttempt] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadDashboardData() {
      setIsLoading(true);
      setLoadError("");

      try {
        const data = await adminDashboardApi.getDashboard(range);

        if (isMounted) {
          setDashboardData(data);
        }
      } catch (error) {
        if (isMounted) {
          setLoadError(getErrorMessage(error));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadDashboardData();

    return () => {
      isMounted = false;
    };
  }, [loadAttempt, range]);

  const hasCurrentDashboardData = dashboardData?.range === range;
  const trends = hasCurrentDashboardData ? dashboardData.trends : [];
  const appointmentStatusBreakdown = hasCurrentDashboardData
    ? dashboardData.appointmentStatusBreakdown
    : [];

  const summaryCards = useMemo(() => {
    if (!hasCurrentDashboardData) {
      return [];
    }

    const summary = dashboardData.summary;

    return [
      {
        label: "Total Patients",
        value: formatNumber(summary.totalPatients),
        helper: `${formatNumber(summary.newPatientsThisMonth)} new this month`,
        to: "/admin/patients",
        icon: Users,
      },
      {
        label: "New Patients This Month",
        value: formatNumber(summary.newPatientsThisMonth),
        helper: "Recently registered patient profiles",
        to: "/admin/patients",
        icon: UserPlus,
      },
      {
        label: "Active Doctors",
        value: formatNumber(summary.activeDoctors),
        helper: "Approved doctors currently active",
        to: "/admin/doctors",
        icon: Stethoscope,
      },
      {
        label: "Pending Schedule Requests",
        value: formatNumber(summary.pendingScheduleRequests),
        helper: "Schedule changes waiting for review",
        to: "/admin/schedule-change-requests",
        icon: CalendarClock,
      },
      {
        label: "Today's Appointments",
        value: formatNumber(summary.todaysAppointments),
        helper: "All appointments scheduled today",
        to: "/admin/appointments",
        icon: CalendarDays,
      },
      {
        label: "Live Queue Now",
        value: formatNumber(summary.liveQueueNow),
        helper: "Patients waiting, calling, or in progress",
        to: "/admin/queue",
        icon: ListOrdered,
      },
      {
        label: "Clinics Needing Attention",
        value: formatNumber(summary.clinicsNeedingAttention),
        helper: "Clinics closed or under maintenance",
        to: "/admin/clinics",
        icon: Hospital,
      },
      {
        label: "Monthly Revenue",
        value: formatMoney(summary.monthlyRevenue),
        helper: `${formatMoney(summary.heldPayments)} currently held`,
        to: "/admin/appointments",
        icon: CircleDollarSign,
      },
    ];
  }, [dashboardData, hasCurrentDashboardData]);

  const topRatedDoctors = [...(hasCurrentDashboardData ? dashboardData.topRatedDoctors : [])].sort(
    (first, second) => Number(second.averageRating || 0) - Number(first.averageRating || 0),
  );

  function retryLoad() {
    setLoadAttempt((attempt) => attempt + 1);
  }

  return (
    <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
      <header className="flex flex-col gap-5 rounded-3xl bg-gradient-to-br from-[#1e61dc] to-[#3b9df5] p-6 text-white shadow-lg shadow-blue-500/20 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-blue-100">Admin workspace</p>
          <h1 className="mt-2 type-hero-title">Dashboard</h1>
          <p className="mt-1 text-sm text-blue-100">Admin overview for patient growth, clinic operations, and revenue.</p>
        </div>
        <SegmentedControl
          label="Dashboard range"
          options={RANGE_OPTIONS}
          value={range}
          onChange={setRange}
          appearance="inverse"
        />
      </header>

      {!hasCurrentDashboardData ? (
        isLoading ? (
          <DashboardLoadingState />
        ) : (
          <DashboardErrorState message={loadError} onRetry={retryLoad} />
        )
      ) : (
        <>
          {loadError ? (
            <div
              className="flex flex-col gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between"
              role="alert"
            >
              <span>{loadError} Showing the most recently loaded dashboard data.</span>
              <Button variant="outline" size="sm" onClick={retryLoad}>
                Try again
              </Button>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {summaryCards.map((card) => (
              <StatCard key={card.label} card={card} />
            ))}
          </div>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Section
          title="Appointments And Revenue"
          description="Trend view follows the selected dashboard range."
          action={
            <SegmentedControl
              label="Chart view"
              options={CHART_VIEWS}
              value={chartView}
              onChange={setChartView}
            />
          }
        >
          <div className="px-3 pb-4 pt-3">
            <DashboardTrendChart data={trends} view={chartView} />
            {isLoading ? (
              <p className="mt-2 text-right text-xs text-slate-500" role="status">
                Refreshing dashboard data...
              </p>
            ) : null}
          </div>
        </Section>

        <Section title="Quick Actions" description="Common admin destinations.">
          <div className="grid gap-3 p-5">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Button
                  key={action.to}
                  asChild
                  variant="outline"
                  className="h-11 justify-between"
                >
                  <Link to={action.to}>
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {action.label}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              );
            })}
          </div>
        </Section>
          </div>

          <div className="grid gap-6 xl:grid-cols-[430px_minmax(0,1fr)]">
        <Section
          title="Appointment Status"
          description="Status distribution for the selected range."
          action={<ClipboardList className="mt-1 h-5 w-5 text-slate-400" />}
        >
          <AppointmentStatusDonut data={appointmentStatusBreakdown} />
        </Section>

        <Section
          title="Top Rated Doctors"
          description="All-time ranking by visible average rating."
          action={
            <Button asChild variant="ghost" size="sm">
              <Link to="/admin/doctors">
                Open
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          }
        >
          <TopRatedDoctorsTable doctors={topRatedDoctors} />
        </Section>
          </div>
        </>
      )}
    </section>
  );
}
