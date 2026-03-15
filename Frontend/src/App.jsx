import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AppearanceProvider } from './context/AppearanceContext'

// Layout
import DashboardLayout from './layouts/DashboardLayout'

// Pages — shared
import Overview     from './pages/Overview'
import Patients     from './pages/Patients'
import Appointments from './pages/Appointments'
import Settings     from './pages/Settings'

import Login        from './pages/Login'
import Signup       from './pages/Signup'

// Pages — doctor
import AddVisit       from './pages/doctor/AddVisit'
import PatientHistory from './pages/doctor/PatientHistory'

// Pages — patient
import MyHistory from './pages/patient/MyHistory'
import MyDoctors from './pages/patient/MyDoctors'

/**
 * Redirects unauthenticated users to /login, preserving the intended destination.
 * Redirects authenticated patients away from the doctor-only root to /my-history.
 */
function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth()
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  return children
}

/**
 * Renders Overview for doctors, redirects patients to their own history page.
 * Placed at the index route so the root URL ("/") behaves correctly for both roles.
 */
function HomeRedirect() {
  const { user } = useAuth()
  if (user?.userType === 'patient') return <Navigate to="/my-history" replace />
  return <Overview />
}

export default function App() {
  return (
    <AppearanceProvider>
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          {/* Public */}
          <Route path="/login"  element={<Login />}  />
          <Route path="/signup" element={<Signup />} />

          {/* Protected dashboard routes */}
          <Route
            element={
              <RequireAuth>
                <DashboardLayout />
              </RequireAuth>
            }
          >
            {/* Shared */}
            <Route index                    element={<HomeRedirect />}   />
            <Route path="patients"          element={<Patients />}       />
            <Route path="appointments"      element={<Navigate to="/" replace />}   />
            <Route path="settings"          element={<Settings />}       />


            {/* Doctor */}
            <Route path="add-visit"         element={<AddVisit />}       />
            <Route path="history"           element={<PatientHistory />} />

            {/* Patient */}
            <Route path="my-history"        element={<MyHistory />}      />
            <Route path="my-doctors"        element={<MyDoctors />}      />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </AppearanceProvider>
  )
}
