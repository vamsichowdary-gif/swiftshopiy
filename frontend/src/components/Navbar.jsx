import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, User, LogOut, Shield } from "lucide-react";

export default function Navbar({ user, onLogout, cartCount, onOpenCart }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-sm">
              S
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">SwiftShop</span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-1 text-xs font-semibold text-slate-600">
            <Link to="/" className="px-3 py-1.5 hover:text-indigo-600 rounded-lg">Home</Link>
            <Link to="/shop" className="px-3 py-1.5 hover:text-indigo-600 rounded-lg">Shop</Link>
            <Link to="/services" className="px-3 py-1.5 hover:text-indigo-600 rounded-lg">Services</Link>
            <Link to="/about" className="px-3 py-1.5 hover:text-indigo-600 rounded-lg">About</Link>
            <Link to="/contact" className="px-3 py-1.5 hover:text-indigo-600 rounded-lg">Contact</Link>
          </nav>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Admin Link if role is Admin/Super Admin */}
          { ["super admin", "admin"].includes(user?.role?.toLowerCase()) ? (
            <Link
              to="/admin"
              className="flex items-center gap-1 text-xs font-semibold bg-slate-900 text-white px-3 py-2 rounded-xl hover:bg-indigo-600 transition"
            >
              <Shield className="w-3.5 h-3.5" /> Admin
            </Link>
          ) : null}

          {/* User Account / Auth */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-2 rounded-xl hover:bg-indigo-100 transition"
              >
                <User className="w-3.5 h-3.5" /> {user.name?.split(" ")[0] || "Account"}
              </Link>
              <button
                onClick={onLogout}
                title="Logout"
                className="p-2 text-slate-400 hover:text-rose-600 transition cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-xl transition"
            >
              Sign In
            </Link>
          )}

          {user?.user_id && <span className="hidden sm:inline text-[10px] font-medium text-slate-500">ID: {user.user_id}</span>}

          {/* Cart Icon */}
          <button
            onClick={onOpenCart}
            className="relative p-2 rounded-xl hover:bg-slate-100 transition cursor-pointer"
          >
            <ShoppingCart className="w-5 h-5 text-slate-700" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
