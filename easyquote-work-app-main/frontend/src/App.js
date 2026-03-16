import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from "./components/ui/sonner";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Customers from "./pages/Customers";
import JobTypes from "./pages/JobTypes";
import QuoteBuilder from "./pages/QuoteBuilder";
import QuoteHistory from "./pages/QuoteHistory";
import WorkReports from "./pages/WorkReports";
import CompanySettings from "./pages/CompanySettings";
import "./App.css";

const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <div className="App">
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route element={<ProtectedRoute />}>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="clienti" element={<Customers />} />
                  <Route path="listino" element={<JobTypes />} />
                  <Route path="nuovo-preventivo" element={<QuoteBuilder />} />
                  <Route path="storico" element={<QuoteHistory />} />
                  <Route path="report-ore" element={<WorkReports />} />
                  <Route path="impostazioni" element={<CompanySettings />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
        <Toaster position="top-center" />
      </div>
    </GoogleOAuthProvider>
  );
}

export default App;
