import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  User,
  Package,
  MapPin,
  LifeBuoy,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Sparkles,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { id: "profile", label: "My Profile", icon: User },
  { id: "orders", label: "Order History", icon: Package },
  { id: "addresses", label: "Delivery Addresses", icon: MapPin },
  { id: "support", label: "Contact Support", icon: LifeBuoy },
];

export default function UserDashboard({ user, token, onLogout }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSignOut = () => {
    if (onLogout) onLogout();
    navigate("/");
  };

  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : "U";
  const displayUid = user?.user_id || (user?.id ? `SW${String(user.id).padStart(6, "0")}` : "SW-MEMBER");

  return (
    <div className="relative min-h-[calc(100vh-4.5rem)] bg-[#070b14] text-slate-100 flex flex-col font-sans overflow-hidden">
      {/* Dynamic Animated Ambient Mesh Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "8s" }} />
        <div className="absolute top-1/3 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "11s" }} />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: "9s" }} />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
      </div>

      {/* Mobile Top Navigation Bar */}
      <div className="relative z-20 md:hidden bg-[#0d1424]/90 backdrop-blur-xl border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 grid place-items-center text-white font-bold text-xs shadow-md shadow-blue-500/25">
            {userInitial}
          </div>
          <div>
            <p className="text-xs font-bold text-white truncate max-w-[160px]">
              {user?.name || "Customer Portal"}
            </p>
            <p className="text-[10px] text-blue-400 font-mono">{displayUid}</p>
          </div>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#172138] border border-slate-700/60 text-xs font-semibold text-slate-200"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={15} /> : <Menu size={15} />}
          <span>Menu</span>
        </button>
      </div>

      {/* Mobile Dropdown Menu Drawer */}
      {mobileMenuOpen && (
        <div className="relative z-30 md:hidden bg-[#0d1424] border-b border-slate-800 p-4 space-y-1 animate-in slide-in-from-top-2">
          {navItems.map(({ id, label, icon: Icon }) => (
            <NavLink
              key={id}
              to={`/dashboard/${id}`}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) =>
                `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                    : "text-slate-300 hover:bg-slate-800/60"
                }`
              }
            >
              <div className="flex items-center gap-2.5">
                <Icon size={16} />
                <span>{label}</span>
              </div>
              <ChevronRight size={13} className="text-slate-500" />
            </NavLink>
          ))}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 text-xs font-semibold text-rose-400 hover:bg-rose-950/20 rounded-xl transition text-left cursor-pointer"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      )}

      {/* Main Dashboard Layout */}
      <div className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col md:flex-row gap-6 lg:gap-8">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden md:flex flex-col w-64 lg:w-72 shrink-0 bg-[#0e1628]/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-5 shadow-2xl">
          {/* User Profile Card */}
          <div className="pb-6 border-b border-slate-800/80">
            <div className="flex items-center gap-3.5">
              <div className="relative">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 grid place-items-center text-white font-bold text-lg shadow-lg shadow-blue-500/25">
                  {userInitial}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-[#0e1628] grid place-items-center">
                  <ShieldCheck size={10} className="text-white" />
                </div>
              </div>

              <div className="min-w-0">
                <h3 className="font-bold text-sm text-white truncate">
                  {user?.name || "Customer"}
                </h3>
                <p className="text-[11px] text-blue-400 font-mono font-semibold">
                  {displayUid}
                </p>
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  <Sparkles size={9} /> Verified Customer
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="py-4 space-y-1.5 flex-1">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-500 px-3 mb-2">
              Navigation
            </p>
            {navItems.map(({ id, label, icon: Icon }) => (
              <NavLink
                key={id}
                to={`/dashboard/${id}`}
                className={({ isActive }) =>
                  `w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? "bg-blue-600 text-white shadow-md shadow-blue-900/40"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon size={16} className="shrink-0" />
                  <span>{label}</span>
                </div>
                <ChevronRight
                  size={13}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                />
              </NavLink>
            ))}
          </div>

          {/* Sign Out Button */}
          <div className="pt-4 border-t border-slate-800/80">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-950/30 border border-transparent hover:border-rose-900/40 transition cursor-pointer"
            >
              <LogOut size={15} />
              <span>Sign out</span>
            </button>
          </div>
        </aside>

        {/* Content Outlet Area with Modern Clean Glass Card */}
        <main className="flex-1 min-w-0 bg-[#0e1628]/80 backdrop-blur-2xl border border-slate-800/80 rounded-3xl p-6 sm:p-8 lg:p-10 shadow-2xl overflow-hidden min-h-[500px]">
          <Outlet context={{ user, token }} />
        </main>
      </div>
    </div>
  );
}