import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { User, Package, MapPin, LifeBuoy } from "lucide-react";

const links = [
  ["profile", "My Profile", User],
  ["orders", "Order History", Package],
  ["addresses", "Addresses", MapPin],
  ["support", "Contact Support", LifeBuoy],
];

export default function UserDashboard({ user, token }) {
  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[#030712] md:flex overflow-hidden">
      {/* 1. Self-contained CSS Animation */}
      <style>{`
        @keyframes sweepGlow {
          0% {
            transform: translate(-30%, -30%) rotate(0deg) scale(1);
          }
          50% {
            transform: translate(-10%, -10%) rotate(180deg) scale(1.3);
          }
          100% {
            transform: translate(-30%, -30%) rotate(360deg) scale(1);
          }
        }
        .anim-sweep {
          animation: sweepGlow 12s ease-in-out infinite alternate;
        }
      `}</style>

      {/* 2. High-contrast sweeping light beams (Visible in background) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="anim-sweep absolute -top-1/2 -left-1/2 w-[220%] h-[220%] blur-[70px] opacity-75"
          style={{
            background:
              "conic-gradient(from 0deg at 50% 50%, #030712 0deg, #2563eb 60deg, #93c5fd 105deg, #030712 160deg, #7c3aed 240deg, #c084fc 285deg, #030712 360deg)",
          }}
        />
        {/* Soft grid/ambient overlay */}
        <div className="absolute inset-0 bg-[#030712]/50 backdrop-blur-[35px]" />
      </div>

      {/* 3. Translucent Sidebar so animation shows at the edges */}
      <aside className="relative z-10 w-full md:w-64 shrink-0 bg-slate-950/60 backdrop-blur-xl border-r border-white/10 text-slate-300 md:min-h-[calc(100vh-4rem)] p-5 flex flex-col">
        <div className="flex items-center gap-3 px-2 pb-7 border-b border-white/10">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white grid place-items-center font-black text-xl shadow-lg shadow-blue-500/25">
            S
          </div>
          <div>
            <p className="font-bold text-white text-lg tracking-tight">SwiftShop</p>
            <p className="text-[11px] text-slate-400 font-medium">CUSTOMER ACCOUNT</p>
          </div>
        </div>

        <div className="flex items-center gap-3 px-2 py-6">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 grid place-items-center text-white font-bold shadow-md shadow-purple-500/25">
            {user?.name?.[0] || "U"}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-white truncate">{user?.name || "new one"}</p>
            <p className="text-xs text-slate-400 truncate">{user?.user_id || `#${user?.id || "SW127568"}`}</p>
          </div>
        </div>

        <p className="text-[10px] uppercase tracking-[.18em] text-slate-400 font-bold mb-3 px-3">
          Your account
        </p>

        <nav className="space-y-2">
          {links.map(([to, label, Icon]) => (
            <NavLink
              key={to}
              to={`/dashboard/${to}`}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-900/50"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`
              }
            >
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* 4. Main Area with Glassmorphism so background beam shines through */}
      <main className="relative z-10 flex-1 min-w-0 p-4 sm:p-8 lg:p-10">
        <div className="max-w-5xl mx-auto bg-slate-900/40 backdrop-blur-2xl p-6 sm:p-8 lg:p-10 rounded-3xl border border-white/10 shadow-2xl min-h-[450px]">
          <Outlet context={{ user, token }} />
        </div>
      </main>
    </div>
  );
}