import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, Lock, User, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { loginAdmin } from "./api";

export default function AdminLogin({ onAuthSuccess }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { user, token } = await loginAdmin(identifier, password);

      // Persist admin auth in dedicated admin storage keys
      if (token) localStorage.setItem("swiftshop_admin_token", token);
      if (user) localStorage.setItem("swiftshop_admin_user", JSON.stringify(user));

      if (typeof onAuthSuccess === "function") {
        onAuthSuccess(user, token);
      }

      navigate("/admin");
    } catch (err) {
      console.error("Admin Login Error:", err);
      const serverMessage =
        err.response?.data?.errors?.identifier?.[0] ||
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.message ||
        err.message ||
        "Invalid administrator credentials.";
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0e1a] text-slate-100 flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      {/* Background Ambient Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Return to store link */}
      <a
        href="/"
        className="absolute top-6 left-6 text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition"
      >
        <ArrowLeft size={14} /> Back to Store
      </a>

      {/* Login Card */}
      <div className="w-full max-w-md bg-[#131b2e] border border-[#1e293b] rounded-3xl p-8 sm:p-10 shadow-2xl relative z-10">
        {/* Header Branding */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-lg shadow-blue-900/50 mb-3">
            <Zap size={24} fill="currentColor" />
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">
            Administrator Sign In
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            Enter your credentials to access the administrative control console
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-start gap-2.5 bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs p-3.5 rounded-xl animate-in fade-in">
            <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Form - Only Admin Login, No Register Option */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Username or Email
            </label>
            <div className="relative">
              <User
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="text"
                required
                autoComplete="username"
                placeholder="admin or admin@swiftshop.com"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="w-full bg-[#0e1424] text-slate-200 text-xs rounded-xl pl-10 pr-3.5 py-3 border border-[#1e293b] focus:outline-none focus:border-blue-500 placeholder-slate-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"
              />
              <input
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0e1424] text-slate-200 text-xs rounded-xl pl-10 pr-3.5 py-3 border border-[#1e293b] focus:outline-none focus:border-blue-500 placeholder-slate-600 transition"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold py-3 rounded-xl transition shadow-lg shadow-blue-900/40 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Access Admin Console</span>
              )}
            </button>
          </div>
        </form>

        {/* Security Notice */}
        <div className="mt-8 pt-6 border-t border-[#1e293b] text-center">
          <p className="text-[11px] text-slate-500">
            Protected area. Authorized administrator personnel only.
          </p>
        </div>
      </div>
    </div>
  );
}
