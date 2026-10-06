import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Loader2, User, Lock, Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";

const API_URL =
  import.meta.env?.VITE_API_URL || "https://swiftshopiy-backned.onrender.com/api";

export default function Login({ onAuthSuccess }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_URL}/login`, {
        identifier,
        password,
      });

      const { user, token } = res.data;

      // Safely persist to dedicated customer storage
      if (token) {
        localStorage.setItem("swiftshop_token", token);
        localStorage.setItem("token", token);
      }
      if (user) {
        localStorage.setItem("swiftshop_user", JSON.stringify(user));
        localStorage.setItem("user", JSON.stringify(user));
      }

      if (typeof onAuthSuccess === "function") {
        onAuthSuccess(user, token);
      }

      const userRole = (user?.role || "Customer").toLowerCase();
      if (userRole === "admin" || userRole === "super admin") {
        // Also save admin token if an admin logged in through general login
        localStorage.setItem("swiftshop_admin_token", token);
        localStorage.setItem("swiftshop_admin_user", JSON.stringify(user));
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login Error:", err);
      const serverMessage =
        err.response?.data?.errors?.identifier?.[0] ||
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.message ||
        "Invalid username or password. Please verify your credentials.";
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-12 overflow-hidden">
      {/* Animated Floating Gradient Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-24 -left-24 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "6s" }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl"
        />
      </div>

      {/* Animated Glass Card */}
      <div className="relative z-10 w-full max-w-md bg-white/90 backdrop-blur-xl border border-white/60 p-8 sm:p-10 rounded-3xl shadow-2xl shadow-indigo-950/10 transition-all">
        {/* Top Header Badge */}
        <div className="text-center mb-7">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 mb-3">
            <Sparkles size={12} className="text-blue-600 animate-spin" style={{ animationDuration: "12s" }} />
            <span>Welcome to SwiftShop</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Customer Sign In
          </h2>
          <p className="text-xs text-slate-500 mt-1.5 max-w-xs mx-auto">
            Access your orders, track deliveries, and print verified invoices
          </p>
        </div>

        {error && (
          <div className="mb-5 text-xs text-rose-600 bg-rose-50 border border-rose-200 p-3.5 rounded-2xl flex items-start gap-2 animate-in fade-in">
            <span className="font-semibold">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Username or Email
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. vamsi or customer@swiftshop.com"
                className="w-full pl-10 pr-4 py-3 text-xs bg-slate-50/70 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition placeholder-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-3 text-xs bg-slate-50/70 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition placeholder-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Account</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-7 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600">
            Don't have a SwiftShop account?{" "}
            <Link to="/register" className="font-bold text-blue-600 hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
