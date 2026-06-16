import {Routes,Route} from "react-router-dom"
import Dashboard from "./pages/Dashboard"
import Doctors from "./pages/Doctors"
import Patients from "./pages/Patients"
import Secretaries from "./pages/Secretaries"
import Statistics from "./pages/Statistics"
import PageLayout from "./pages/PageLayout"
import LoginPage from "./pages/LoginPage"
import ProtectedRoute from "./components/ProtectedRoute"



function App() {
 

  return (
    <Routes>
      <Route path="/login" element={<LoginPage/>} />

      <Route element={<ProtectedRoute/>}>
        <Route path="/" element={<PageLayout/>}>
          <Route index element={<Dashboard/>}/>
          <Route path="doctors" element={<Doctors/>}/>
          <Route path="patients" element={<Patients/>}/>
          <Route path="secretaries" element={<Secretaries/>}/>
          <Route path="statistics" element={<Statistics/>}/>
        </Route>
      </Route>    
    </Routes>
  )
}

export default App
