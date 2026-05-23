import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import Layout from "./components/Layout/Layout";
import Login from "./pages/Auth/Login";
import Signup from "./pages/Auth/Signup";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Customers from "./pages/Customers";
import Debts from "./pages/Debts";
import Invoices from "./pages/Invoices";
import Inventory from "./pages/Inventory";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

function AppRoutes() {
  const [session, setSession] = useState(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    // Get existing session on page load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // This fires when user clicks the email confirmation link
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        navigate("/dashboard", { replace: true });
      }
      if (event === "SIGNED_OUT") {
        navigate("/login", { replace: true });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Show spinner while checking session
  if (session === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <img src="/logo.png" alt="LedgerLite" className="w-14 h-14 rounded-2xl object-contain" />
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Loading LedgerLite...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login"  element={session ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/signup" element={session ? <Navigate to="/dashboard" replace /> : <Signup />} />
      <Route path="/" element={<Navigate to={session ? "/dashboard" : "/login"} replace />} />

      {/* Protected routes */}
      <Route element={session ? <Layout /> : <Navigate to="/login" replace />}>
        <Route path="/dashboard"    element={<Dashboard />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/customers"    element={<Customers />} />
        <Route path="/debts"        element={<Debts />} />
        <Route path="/invoices"     element={<Invoices />} />
        <Route path="/inventory"    element={<Inventory />} />
        <Route path="/reports"      element={<Reports />} />
        <Route path="/settings"     element={<Settings />} />
      </Route>

      <Route path="*" element={<Navigate to={session ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
