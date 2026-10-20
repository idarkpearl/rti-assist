import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { ProtectedRoute } from './components/ProtectedRoute.jsx';
import { Layout } from './components/Layout.jsx';
import { Home } from './pages/Home.jsx';
import { Intake } from './pages/Intake.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { CaseDetail } from './pages/CaseDetail.jsx';
import { AppealDraftDetail } from './pages/AppealDraftDetail.jsx';
import { ResponseClassification } from './pages/ResponseClassification.jsx';
import { Directory } from './pages/Directory.jsx';
import { CaseFiling } from './pages/CaseFiling.jsx';
import { Login } from './pages/Login.jsx';
import { About } from './pages/About.jsx';
import { Contact } from './pages/Contact.jsx';
import { PrivacyPolicy } from './pages/PrivacyPolicy.jsx';
import { TermsOfService } from './pages/TermsOfService.jsx';
import { Disclaimer } from './pages/Disclaimer.jsx';
import { RtiActGuide } from './pages/RtiActGuide.jsx';

export function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
        <Routes>
          <Route element={<Layout />}>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/directory" element={<Directory />} />
            <Route path="/login" element={<Login />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/disclaimer" element={<Disclaimer />} />
            <Route path="/rti-act" element={<RtiActGuide />} />

            {/* Protected Routes (Requires Sign In): Drafting /intake, Dashboard, Filings, Appeals */}
            <Route element={<ProtectedRoute />}>
              <Route path="/intake" element={<Intake />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/cases/new/filing" element={<CaseFiling />} />
              <Route path="/cases/:id" element={<CaseDetail />} />
              <Route path="/cases/:id/response" element={<ResponseClassification />} />
              <Route path="/appeals/:id" element={<AppealDraftDetail />} />
            </Route>

            {/* Catch-all Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </ThemeProvider>
  );
}

export default App;
