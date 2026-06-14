import RowsPerPageSelect from "../components/Table/RowsPerPageSelect"
import { useState } from "react"

const Doctors = () => {

  const [currentPage,setCurrentPage] = useState(1)
  const [rowsPerPage,setRowsPerPage]=useState(10)

  function handleRowsPerPageChange(value) {
  setRowsPerPage(value);
  setCurrentPage(1);
  }  

  // const totalPages = Math.ceil(filteredDoctors.length / rowsPerPage);

  // const startIndex = (currentPage - 1) * rowsPerPage;
  // const endIndex = startIndex + rowsPerPage;

  // const paginatedDoctors = filteredDoctors.slice(startIndex, endIndex);
  
  return (
    <div className="flex justify-between gap-4">

      <RowsPerPageSelect value={rowsPerPage} onChange={handleRowsPerPageChange}></RowsPerPageSelect>
    </div>
  ) 
}

export default Doctors