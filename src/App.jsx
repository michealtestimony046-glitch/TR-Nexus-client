import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import AppShell from "./components/AppShell.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Services frteh snokeyom "./pages/Services.jsx";
impor
  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: 24, color: "#fff", background: "#200",
          fontFamily: "monospace", whiteSpace: "pre-wrap",
        }}>
          <


            <Route path="/services" element={<Services />} />
            <Route path="/intake" element={<Intake />} />
            <Route path="/portal" element={<Portal />} />
            <Route path="/checkout/:projectId" element={<Checkout />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AppShell>
      </AuthProvider>
    </ErrorBoundary>
  );
}
