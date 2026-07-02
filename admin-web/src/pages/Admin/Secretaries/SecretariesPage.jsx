import { useNavigate } from "react-router-dom";

import DataTable from "@/components/shared/DataTable";

import { secretaries } from "../SecrataryData";
import { getSecretaryColumns } from "./components/SecretaryColumns";
import SecretariesTableToolbar from "./components/SecretariesTableToolbar";

export default function SecretariesPage() {
  const navigate = useNavigate();
  const columns = getSecretaryColumns((secretary) =>
    navigate(`/admin/secretaries/${secretary.id}`)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Secretaries</h1>
        <p className="text-muted-foreground">
          Manage secretary contact details, clinic assignments, and profile
          access.
        </p>
      </div>

      <DataTable
        columns={columns}
        data={secretaries}
        emptyMessage="No secretaries found."
        toolbar={({ table, globalFilter, setGlobalFilter }) => (
          <SecretariesTableToolbar
            table={table}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
          />
        )}
      />
    </div>
  );
}
