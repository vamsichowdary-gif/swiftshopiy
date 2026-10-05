import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { User, Package, MapPin, LifeBuoy } from "lucide-react";

const links = [
  ["profile", "My Profile", User], ["orders", "Order History", Package],
  ["addresses", "Addresses", MapPin], ["support", "Contact Support", LifeBuoy],
];

export default function UserDashboard({ user, token }) {
  return <div className="min-h-[calc(100vh-4rem)] bg-slate-100 md:flex">
    <aside className="w-full md:w-64 shrink-0 bg-gradient-to-b from-slate-800 to-slate-950 text-slate-300 md:min-h-[calc(100vh-4rem)] p-5 flex flex-col">
      <div className="flex items-center gap-3 px-2 pb-7 border-b border-white/10"><div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white grid place-items-center font-black text-xl">S</div><div><p className="font-bold text-white text-lg">SwiftShop</p><p className="text-xs text-slate-400">CUSTOMER ACCOUNT</p></div></div>
      <div className="flex items-center gap-3 px-2 py-6"><div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 grid place-items-center text-white font-bold">{user.name?.[0]}</div><div className="min-w-0"><p className="text-sm font-semibold text-white truncate">{user.name}</p><p className="text-xs text-slate-400 truncate">{user.user_id || `#${user.id}`}</p></div></div>
      <p className="text-[10px] uppercase tracking-[.18em] text-slate-500 font-bold mb-3 px-3">Your account</p>
      <nav className="space-y-2">{links.map(([to, label, Icon]) => <NavLink key={to} to={`/dashboard/${to}`} className={({ isActive }) => `w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${isActive ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-950/30" : "text-slate-300 hover:bg-white/10"}`}><Icon className="w-4 h-4"/>{label}</NavLink>)}</nav>
    </aside>
    <main className="flex-1 min-w-0 p-4 sm:p-8 lg:p-10"><div className="max-w-6xl mx-auto bg-white p-6 sm:p-8 lg:p-10 rounded-3xl border border-slate-200 shadow-sm min-h-[450px]"><Outlet context={{ user, token }}/></div></main>
  </div>;
}
