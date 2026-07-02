import { useNavigate } from "react-router-dom";

import DataTable from "@/components/shared/DataTable";
import { doctors } from "../DoctorData";

import { getDoctorColumns } from "./components/DoctorColumns";
import DoctorsTableToolbar from "./components/DoctorsTableToolbar";

export default function DoctorsPage() {
  const navigate = useNavigate();
  const specializationOptions = Array.from(
    new Set(doctors.map((doctor) => doctor.specialization).filter(Boolean))
  ).sort((left, right) => left.localeCompare(right));
  const columns = getDoctorColumns((doctor) =>
    navigate(`/admin/doctors/${doctor.id}`)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Doctors</h1>
        <p className="text-muted-foreground">
          Review doctor profiles and the backend-aligned details shown in the admin UI.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={doctors}
        emptyMessage="No doctors found."
        toolbar={({ table, globalFilter, setGlobalFilter }) => (
          <DoctorsTableToolbar
            table={table}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
            specializationOptions={specializationOptions}
          />
        )}
      />
    </div>
  );
}
