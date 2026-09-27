import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { Layout } from './components/Layout.jsx';
import { Home } from './pages/Home.jsx';
import { Intake } from './pages/Intake.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { CaseDetail } from './pages/CaseDetail.jsx';
import { AppealDraftDetail } from './pages/AppealDraftDetail.jsx';
import { Directory } from './pages/Directory.jsx';
import { CaseFiling } from './pages/CaseFiling.jsx';
import { Login } from './pages/Login.jsx';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/intake" element={<Intake />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes: /dashboard, /cases/*, /appeals/* */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/cases/new/filing" element={<CaseFiling />} />
              <Route path="/cases/:id" element={<CaseDetail />} />
              <Route path="/appeals/:id" element={<AppealDraftDetail />} />
            </Route>

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
