import { Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Admin/Dashboard";
import DoctorsPage from "./pages/Admin/Doctors/DoctorsPage";
import DoctorProfile from "./pages/Admin/Doctors/DoctorProfile";
import DoctorOverview from "./pages/Admin/Doctors/DoctorOverview";
import Patients from "./pages/Admin/Patients";
import Secretaries from "./pages/Admin/Secretaries";
import Statistics from "./pages/Admin/Statistics";
import AdminPageLayout from "./pages/AdminPageLayout";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import Clinics from "./pages/Admin/Clinics";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminPageLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="doctors">
            <Route index element={<DoctorsPage />} />
            <Route path=":doctorId" element={<DoctorProfile />}>
              <Route index element={<DoctorOverview />} />
            </Route>
          </Route>
          <Route path="patients" element={<Patients />} />
          <Route path="secretaries" element={<Secretaries />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="clinics" element={<Clinics />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
