import DataTable from "@/components/shared/DataTable";

import { doctorsColumns } from "./components/DoctorColumns";
import DoctorsTableToolbar from "./components/DoctorsTableToolbar";

const doctors = [
  {
    id: 1,
    name: "Dr. Sarah Jenkins",
    email: "sarah.jenkins@clinic.com",
    specialty: "Cardiology",
    phone: "+1 555 123 4567",
    status: "Active",
  },
  {
    id: 2,
    name: "Dr. Robert Chen",
    email: "robert.chen@clinic.com",
    specialty: "Dermatology",
    phone: "+1 555 987 6543",
    status: "Inactive",
  },
  {
    id: 3,
    name: "Dr. Lina Haddad",
    email: "lina.haddad@clinic.com",
    specialty: "Pediatrics",
    phone: "+1 555 333 2222",
    status: "Active",
  },
];

export default function DoctorsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Doctors</h1>
        <p className="text-muted-foreground">
          Manage doctors, specialties, and clinic assignments.
        </p>
      </div>

      <DataTable
        columns={doctorsColumns}
        data={doctors}
        emptyMessage="No doctors found."
        toolbar={({ table, globalFilter, setGlobalFilter }) => (
          <DoctorsTableToolbar
            table={table}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
        )}
      />
    </div>
  );
}