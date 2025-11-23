import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { Navbar } from './components/Navbar';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { TestPage } from './pages/TestPage';
import { ToolsPage } from './pages/ToolsPage';
import { PDFSplitPage } from './pages/tools/PDFSplitPage';
import { PDFMergePage } from './pages/tools/PDFMergePage';
import { PDFCompressPage } from './pages/tools/PDFCompressPage';
import { PDFToWordPage } from './pages/tools/PDFToWordPage';
import { OCRPage } from './pages/tools/OCRPage';
import { CompletePDFToWordPage } from './pages/tools/CompletePDFToWord';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function AppRoutes() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/tools" element={<ToolsPage />} />
        <Route path="/tools/pdf-split" element={<PDFSplitPage />} />
        <Route path="/tools/pdf-merge" element={<PDFMergePage />} />
        <Route path="/tools/pdf-compress" element={<PDFCompressPage />} />
        <Route path="/tools/pdf-to-word" element={<PDFToWordPage />} />
        <Route path="/tools/pdf-to-word-complete" element={<CompletePDFToWordPage />} />
        <Route path="/tools/ocr" element={<OCRPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  );
}
