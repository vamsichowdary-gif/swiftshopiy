import React, { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, Shield, ShoppingBag, UserRound, X, LogOut } from "lucide-react";

const links = [["/", "Home"], ["/shop", "Shop"], ["/services", "Services"], ["/about", "About"], ["/contact", "Contact"]];
const navLinkClass = ({ isActive }) => `relative py-2 text-[11px] font-semibold transition after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-left after:bg-[#354638] after:transition-transform ${isActive ? "text-[#27352b] after:scale-x-100" : "text-slate-500 after:scale-x-0 hover:text-slate-950 hover:after:scale-x-100"}`;

export default function Navbar({ user, onLogout, cartCount, onOpenCart }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const isAdmin = ["admin", "super admin"].includes(user?.role?.toLowerCase());

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-[#faf9f6]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-8 lg:px-12">
        <div className="flex items-center gap-10">
          <Link to="/" className="group flex items-center gap-2.5" aria-label="SwiftShop home">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#26352b] font-serif text-lg text-white transition group-hover:rotate-6">S</span>
            <span className="font-serif text-[22px] font-semibold tracking-tight text-slate-950">SwiftShop<span className="text-[#788677]">.</span></span>
          </Link>
          <nav className="hidden items-center gap-7 md:flex">{links.map(([to, label]) => <NavLink key={to} to={to} end={to === "/"} className={navLinkClass}>{label}</NavLink>)}</nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {isAdmin && <Link to="/admin" className="hidden items-center gap-1.5 rounded-full border border-slate-200 px-3 py-2 text-[10px] font-bold text-slate-700 transition hover:border-slate-400 sm:flex"><Shield size={13}/>Admin</Link>}
          {user ? <div className="flex items-center gap-1.5">
            <Link to={isAdmin ? "/admin" : "/dashboard"} className="flex items-center gap-2 rounded-full px-2 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-white sm:px-3">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-[#e6e8e1] text-[#384739]"><UserRound size={14}/></span>
              <span className="hidden max-w-[100px] truncate sm:inline">{user.name?.split(" ")[0] || user.username || "Account"}</span>
            </Link>
            <button onClick={onLogout} title="Sign out" aria-label="Sign out" className="rounded-full p-2 text-slate-400 transition hover:bg-white hover:text-rose-600"><LogOut size={15}/></button>
          </div> : <Link to="/login" className="rounded-full bg-[#26352b] px-4 py-2.5 text-[11px] font-bold text-white transition hover:bg-[#3b4b3f] sm:px-5">Sign in</Link>}
          {user?.user_id && <span className="hidden text-[10px] text-slate-400 xl:inline">{user.user_id}</span>}
          <button onClick={onOpenCart} aria-label={`Open shopping bag, ${cartCount} items`} className="relative grid h-10 w-10 place-items-center rounded-full border border-slate-200 text-slate-800 transition hover:bg-white">
            <ShoppingBag size={17}/>{cartCount > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-[17px] min-w-[17px] place-items-center rounded-full bg-[#748174] px-1 text-[9px] font-bold text-white">{cartCount}</span>}
          </button>
          <button className="grid h-10 w-10 place-items-center rounded-full text-slate-800 md:hidden" onClick={() => setMobileOpen(open => !open)} aria-label={mobileOpen ? "Close navigation" : "Open navigation"} aria-expanded={mobileOpen}>{mobileOpen ? <X size={19}/> : <Menu size={19}/>}</button>
        </div>
      </div>
      {mobileOpen && <nav className="border-t border-slate-200 bg-[#faf9f6] px-5 py-3 md:hidden">{links.map(([to, label]) => <NavLink key={to} to={to} end={to === "/"} onClick={() => setMobileOpen(false)} className={({ isActive }) => `block border-b border-slate-200/70 py-3.5 text-sm font-semibold ${isActive ? "text-[#354638]" : "text-slate-600"}`}>{label}</NavLink>)}{isAdmin && <Link to="/admin" onClick={() => setMobileOpen(false)} className="block py-3.5 text-sm font-semibold text-slate-600">Admin panel</Link>}</nav>}
    </header>
  );
}
