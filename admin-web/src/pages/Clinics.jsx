import RowsPerPageSelect from "../components/Table/RowsPerPageSelect"
import { useState } from "react"
import SearchInput from "../components/UI/SearchInput"
import FilterDropdown from "../components/UI/FilterDropdown"
import Button from "../components/UI/Button"
import { Plus } from "lucide-react"
import DropdownItem from "../components/UI/DropdownItem"
import { doctors } from "./DoctorData"
import DataTable from "../components/Table/DataTable"
import Pagination from "../components/Table/Pagination"
import { boxBase, boxShadow } from "../components/UI/SurfaceStyles"
import { clinics } from "./ClinicData"


const Clinics = () => {
 //search and filter logic for changing what is in the search and the filter dropdown
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Clinics");
  //pagination logic for handling the pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  function handleSearchChange(event) {
    setSearch(event.target.value);
    setCurrentPage(1);
  }

  function handleStatusFilterChange(status) {
    setStatusFilter(status);
    setCurrentPage(1);
  }

  function handleRowsPerPageChange(value) {
    setRowsPerPage(value);
    setCurrentPage(1);
  }

  const filteredClinics = clinics

  const totalPages = Math.ceil(filteredClinics.length / rowsPerPage);
  
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;

  const paginatedClinics = filteredClinics.slice(startIndex, endIndex);

   //this is the logic needed for changing the pages
  function goToPreviousPage() {
    if (currentPage === 1) return;

    setCurrentPage(currentPage - 1);
    }

  function goToNextPage() {
    if (currentPage === totalPages) return;

    setCurrentPage(currentPage + 1);
  }

const clinicColumns = [
    { key: "name", header: "Clinic" },
    { key: "location", header: "Location" },
    { key: "manager", header: "Manager" },
    { key: "status", header: "Status" },
    { key: "doctorsCount", header: "Doctors" },
    { key: "phone", header: "Contact" },
];

  return (
  <div className="space-y-5 p-6">
      {/* Page Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clinics</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage clinics, add, edit, and delete them.
          </p>
        </div>

        <Button>
          <Plus className="h-4 w-4" />
          Add Clinic
        </Button>
      </div>

      {/* Toolbar */}
      <div className={`flex flex-col gap-3 ${boxShadow}  p-4 sm:flex-row sm:items-center sm:justify-between`}>
        <SearchInput
          value={search}
          onChange={handleSearchChange}
          placeholder="Search clinics..."
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <FilterDropdown label={statusFilter}>
            <DropdownItem onClick={() => handleStatusFilterChange("All Clinics")}>
              All Clinics
            </DropdownItem>

            <DropdownItem onClick={() => handleStatusFilterChange("Active")}>
              Active
            </DropdownItem>

            <DropdownItem onClick={() => handleStatusFilterChange("On Leave")}>
              On Leave
            </DropdownItem>

            <DropdownItem onClick={() => handleStatusFilterChange("In Surgery")}>
              In Surgery
            </DropdownItem>

            <DropdownItem onClick={() => handleStatusFilterChange("Inactive")}>
              Inactive
            </DropdownItem>
          </FilterDropdown>

          <RowsPerPageSelect
            value={rowsPerPage}
            onChange={handleRowsPerPageChange}
          />
        </div>
      </div>

      {/* Table will go here later */}
      <div className={`${boxShadow} p-8 text-center text-sm text-slate-500`}>
            <div className={`overflow-hidden ${boxBase}`}>
          <DataTable
            columns={clinicColumns}
            data={paginatedClinics}
          />

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPrevious={goToPreviousPage}
            onNext={goToNextPage}
          />
        </div>
      </div>
    </div>
  )
}

export default Clinics