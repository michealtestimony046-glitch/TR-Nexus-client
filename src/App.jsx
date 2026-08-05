import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.jsx";
import AppShell from "./components/AppShell.jsx";
import Home from "./pages/Home.jsx";
import About from "./pages/About.jsx";
import Services from "./pages/Services.jsx";
import Intake from "./pages/Intake.jsx";
import Auth from "./pages/Auth.jsx";
import AuthCallback from "./pages/AuthCallback.jsx";
import Portal from "./pages/Portal.jsx";
import Checkout from "./pages/Checkout.jsx";
import Admin from "./pages/Admin.jsx";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{
          padding: 24, color: "#fff", background: "#200",
          fontFamily: "monospace", whiteSpace: "pre-wrap",
        }}>
          <h2 style={{ color: "#ff6b6b" }}>App crashed:</h2>
          <div>{this.state.error.message}</div>
          <div style={{ marginTop: 16, fontSize: 12, opacity: 0.7 }}>
            {this.state.error.stack}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppShell>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
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
