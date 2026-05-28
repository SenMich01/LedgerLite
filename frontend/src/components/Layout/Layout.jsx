import { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, ArrowLeftRight, Users, AlertCircle,
  FileText, Package, BarChart2, Settings, LogOut,
  Menu, X, MoreHorizontal
} from "lucide-react";
import { supabase } from "../../lib/supabase";

const navItems = [
  { to: "/dashboard",    icon: LayoutDashboard, label: "Dashboard" },
  { to: "/transactions", icon: ArrowLeftRight,  label: "Transactions" },
  { to: "/customers",    icon: Users,           label: "Customers" },
  { to: "/debts",        icon: AlertCircle,     label: "Debts" },
  { to: "/invoices",     icon: FileText,        label: "Invoices" },
  { to: "/inventory",    icon: Package,         label: "Inventory" },
  { to: "/reports",      icon: BarChart2,       label: "Reports" },
  { to: "/settings",     icon: Settings,        label: "Settings" },
];

const bottomNav = navItems.slice(0, 4);
const moreItems = navItems.slice(4);

// Inline SVG logo — no external file needed
function Logo({ size = 32 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40"
      fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="5" y="4" width="7" height="24" rx="2" fill="#1B6B3A"/>
      <rect x="5" y="27" width="22" height="7" rx="2" fill="#1B6B3A"/>
      <rect x="8" y="8"  width="2" height="3" rx="0.5" fill="#ffffff" opacity="0.5"/>
      <rect x="8" y="14" width="2" height="3" rx="0.5" fill="#ffffff" opacity="0.5"/>
      <rect x="8" y="20" width="2" height="3" rx="0.5" fill="#ffffff" opacity="0.5"/>
      <polyline points="7,23 13,16 19,19 27,8"
        stroke="#4ADE80" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" fill="none"/>
      <polyline points="22,6 28,6 28,12"
        stroke="#4ADE80" strokeWidth="2.5"
        strokeLinecap="round" strokeLinejoin="round" fill="none"/>
    </svg>
  );
}

export default function Layout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [moreOpen,   setMoreOpen]   = useState(false);
  const navigate = useNavigate();

  async function handleLogout() {
    await supabase.auth.signOut();
    navigate("/login");
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden md:flex flex-col w-60 bg-[#1E1B4B] shrink-0 h-full">
        <div className="flex items-center gap-3 px-5 py-5 border-b border-white/10">
          <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center p-0.5 shrink-0">
            <Logo size={28} />
          </div>
          <span className="text-white font-bold text-lg tracking-tight">LedgerLite</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                 ${isActive ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/10"}`
              }>
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-3 pb-5 border-t border-white/10 pt-4">
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                       text-white/60 hover:text-white hover:bg-white/10 w-full transition-colors">
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── MOBILE DRAWER ── */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"
               onClick={() => setDrawerOpen(false)} />
          <aside className="relative w-72 max-w-[85vw] bg-[#1E1B4B] flex flex-col h-full z-10 shadow-2xl">

            {/* ✅ Logo in drawer — inline SVG, never fails */}
            <div className="flex items-center justify-between px-5 py-5 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center p-0.5 shrink-0">
                  <Logo size={28} />
                </div>
                <span className="text-white font-bold text-lg">LedgerLite</span>
              </div>
              <button onClick={() => setDrawerOpen(false)}
                className="text-white/60 hover:text-white p-1">
                <X size={22} />
              </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
              {navItems.map(({ to, icon: Icon, label }) => (
                <NavLink key={to} to={to} onClick={() => setDrawerOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors
                     ${isActive ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/10"}`
                  }>
                  <Icon size={18} />
                  {label}
                </NavLink>
              ))}
            </nav>

            <div className="px-3 pb-6 border-t border-white/10 pt-4">
              <button onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium
                           text-white/60 hover:text-white hover:bg-white/10 w-full">
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between
                           bg-white border-b border-gray-100 px-4 py-3 shrink-0 z-30">
          <button onClick={() => setDrawerOpen(true)}
            className="p-1 text-gray-600 hover:text-gray-900">
            <Menu size={24} />
          </button>

          {/* ✅ Logo in top bar — inline SVG */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#1E1B4B] rounded-lg flex items-center justify-center p-0.5">
              <Logo size={20} />
            </div>
            <span className="font-bold text-gray-900 text-base">LedgerLite</span>
          </div>

          <div className="w-8" />
        </header>

        <main className="flex-1 overflow-y-auto pb-24 md:pb-0">
          <Outlet />
        </main>

        {/* ── MOBILE BOTTOM NAV ── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40
                        bg-white border-t border-gray-200">
          <div className="flex items-center justify-around px-1 py-2">
            {bottomNav.map(({ to, icon: Icon, label }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) =>
                  `flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl min-w-[56px] transition-colors
                   ${isActive ? "text-purple-700" : "text-gray-400"}`
                }>
                <Icon size={22} strokeWidth={1.8} />
                <span className="text-[10px] font-medium leading-tight">{label}</span>
              </NavLink>
            ))}
            <button onClick={() => setMoreOpen(o => !o)}
              className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl min-w-[56px]
                          ${moreOpen ? "text-purple-700" : "text-gray-400"}`}>
              <MoreHorizontal size={22} strokeWidth={1.8} />
              <span className="text-[10px] font-medium leading-tight">More</span>
            </button>
          </div>
        </nav>

        {/* More slide-up panel */}
        {moreOpen && (
          <>
            <div className="md:hidden fixed inset-0 z-30"
                 onClick={() => setMoreOpen(false)} />
            <div className="md:hidden fixed bottom-16 left-0 right-0 z-40
                            bg-white rounded-t-3xl shadow-2xl border-t border-gray-100 p-5">
              <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />
              <div className="grid grid-cols-4 gap-3">
                {moreItems.map(({ to, icon: Icon, label }) => (
                  <NavLink key={to} to={to} onClick={() => setMoreOpen(false)}
                    className={({ isActive }) =>
                      `flex flex-col items-center gap-2 p-3 rounded-2xl transition-colors
                       ${isActive ? "bg-purple-50 text-purple-700" : "text-gray-600 hover:bg-gray-50"}`
                    }>
                    <Icon size={24} strokeWidth={1.7} />
                    <span className="text-xs font-medium text-center">{label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
