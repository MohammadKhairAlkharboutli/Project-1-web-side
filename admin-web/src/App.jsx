import { Navigate, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Admin/Dashboard";
import DoctorsPage from "./pages/Admin/Doctors/DoctorsPage";
import DoctorInvitationsPage from "./pages/Admin/DoctorInvitations/DoctorInvitationsPage";
import DoctorProfile from "./pages/Admin/Doctors/DoctorProfile";
import DoctorOverview from "./pages/Admin/Doctors/DoctorOverview";
import DoctorSchedule from "./pages/Admin/Doctors/DoctorSchedule";
import DoctorAppointments from "./pages/Admin/Doctors/DoctorAppointments";
import AdminAppointmentsPage from "./pages/Admin/Appointments/AdminAppointmentsPage";
import AppointmentDetails from "./pages/Admin/Appointments/AppointmentDetails";
import PatientsPage from "./pages/Admin/Patients/PatientsPage";
import PatientProfile from "./pages/Admin/Patients/PatientProfile";
import PatientOverview from "./pages/Admin/Patients/PatientOverview";
import PatientMedicalInfo from "./pages/Admin/Patients/PatientMedicalInfo";
import PatientMedicalHistory from "./pages/Admin/Patients/PatientMedicalHistory";
import PatientAppointments from "./pages/Admin/Patients/PatientAppointments";
import PatientProfileLogs from "./pages/Admin/Patients/PatientProfileLogs";
import SecretariesPage from "./pages/Admin/Secretaries/SecretariesPage";
import SecretaryProfile from "./pages/Admin/Secretaries/SecretaryProfile";
import SecretaryOverview from "./pages/Admin/Secretaries/SecretaryOverview";
import ScheduleChangeRequestsPage from "./pages/Admin/ScheduleChangeRequests/ScheduleChangeRequestsPage";
import DataLookupsPage from "./pages/Admin/DataLookups/DataLookupsPage";
import SystemPoliciesPage from "./pages/Admin/SystemPolicies/SystemPoliciesPage";
import AdminProfilePage from "./pages/Admin/AdminProfilePage";
import AdminPageLayout from "./pages/AdminPageLayout";
import LoginPage from "./pages/LoginPage";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleProtectedRoute from "./components/RoleProtectedRoute";
import DoctorProfileCompletionGuard from "./components/DoctorProfileCompletionGuard";
import DoctorClinicAssignmentGuard from "./components/DoctorClinicAssignmentGuard";
import ClinicsPage from "./pages/Admin/Clinics/ClinicsPage";
import ClinicProfile from "./pages/Admin/Clinics/ClinicProfile";
import ClinicOverview from "./pages/Admin/Clinics/ClinicOverview";
import ClinicAppointments from "./pages/Admin/Clinics/ClinicAppointments";
import ClinicDoctors from "./pages/Admin/Clinics/ClinicDoctors";
import RatingsPage from "./pages/Admin/Ratings/RatingsPage";
import RatingReportsPage from "./pages/Admin/Ratings/RatingReportsPage";
import RatingReportDetails from "./pages/Admin/Ratings/RatingReportDetails";
import AdminQueuePage from "./pages/Admin/Queue/AdminQueuePage";
import DoctorPageLayout from "./pages/Doctor/DoctorPageLayout";
import DoctorDashboard from "./pages/Doctor/Dashboard";
import DoctorPortalAppointments from "./pages/Doctor/DoctorAppointmentsHub";
import DoctorAppointmentDetails from "./pages/Doctor/DoctorAppointmentDetails";
import DoctorPortalSchedule from "./pages/Doctor/Schedule";
import DoctorProfileSettings from "./pages/Doctor/DoctorProfileSettings"; 
import DoctorLeaves from "./pages/Doctor/DoctorLeaves";
import DoctorSettings from "./pages/Doctor/Settings";
import PatientsList from "./pages/Doctor/PatientsList";
import DoctorLiveQueue from "./pages/Doctor/DoctorLiveQueue";
import ConsultationPage from "./pages/Doctor/ConsultationPage";
import PatientMedicalFile from "./pages/Doctor/PatientMedicalFile";
import ReferralsPage from "./pages/Doctor/ReferralsPage";
import DoctorInvitePage from "./pages/DoctorInvitePage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/doctor" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/doctor-invite/:token" element={<DoctorInvitePage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<RoleProtectedRoute allowedRole="admin" />}>
          <Route path="/admin" element={<AdminPageLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="doctors">
            <Route index element={<DoctorsPage />} />
            <Route path=":doctorId" element={<DoctorProfile />}>
              <Route index element={<DoctorOverview />} />
              <Route path="schedules" element={<DoctorSchedule />} />
              <Route path="clinics" element={<Navigate to=".." relative="path" replace />} />
              <Route path="appointments" element={<DoctorAppointments />} />
            </Route>
          </Route>
          <Route path="appointments" element={<AdminAppointmentsPage />} />
          <Route path="appointments/:appointmentId" element={<AppointmentDetails />} />
          <Route path="queue" element={<AdminQueuePage />} />
          <Route path="ratings" element={<RatingsPage />} />
          <Route path="rating-reports" element={<RatingReportsPage />} />
          <Route path="rating-reports/:reportId" element={<RatingReportDetails />} />
          <Route path="patients">
            <Route index element={<PatientsPage />} />
            <Route path=":patientId" element={<PatientProfile />}>
              <Route index element={<PatientOverview />} />
              <Route path="medical-info" element={<PatientMedicalInfo />} />
              <Route path="medical-history" element={<PatientMedicalHistory />} />
              <Route path="appointments" element={<PatientAppointments />} />
              <Route path="profile-logs" element={<PatientProfileLogs />} />
            </Route>
          </Route>
          <Route path="clinics">
            <Route index element={<ClinicsPage />} />
            <Route path=":clinicId" element={<ClinicProfile />}>
              <Route index element={<ClinicOverview />} />
              <Route path="appointments" element={<ClinicAppointments />} />
              <Route path="doctors" element={<ClinicDoctors />} />
            </Route>
          </Route>
          <Route path="secretaries">
            <Route index element={<SecretariesPage />} />
            <Route path=":secretaryId" element={<SecretaryProfile />}>
              <Route index element={<SecretaryOverview />} />
            </Route>
          </Route>
          <Route path="schedule-change-requests" element={<ScheduleChangeRequestsPage />} />
          <Route path="data-lookups" element={<DataLookupsPage />} />
          <Route path="system-policies" element={<SystemPoliciesPage />} />
          <Route path="profile" element={<AdminProfilePage />} />
          <Route path="settings" element={<Navigate to="/admin/profile" replace />} />
          <Route path="doctor-invitations" element={<DoctorInvitationsPage />} />
          </Route>
        </Route>

        {/* Doctor Routes */}
        <Route element={<RoleProtectedRoute allowedRole="doctor" />}>
          <Route path="/doctor" element={<DoctorProfileCompletionGuard />}>
            <Route element={<DoctorClinicAssignmentGuard />}>
              <Route element={<DoctorPageLayout />}>
              <Route index element={<DoctorDashboard />} />
              <Route path="appointments" element={<DoctorPortalAppointments />} />
              <Route path="appointments/:appointmentId" element={<DoctorAppointmentDetails />} />
              <Route path="schedule" element={<DoctorPortalSchedule />} />
              <Route path="profile" element={<DoctorProfileSettings />} />
              <Route path="patients" element={<PatientsList />} />
              <Route path="patients/:patientId" element={<PatientMedicalFile />} />
              <Route path="consultation/:appointmentId" element={<ConsultationPage />} />
              <Route path="queue" element={<DoctorLiveQueue />} />
              <Route path="referrals" element={<ReferralsPage />} />
              <Route path="leaves" element={<DoctorLeaves />} />
              <Route path="settings" element={<DoctorSettings />} />
              </Route>
            </Route>
          </Route>
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
