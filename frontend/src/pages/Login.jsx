import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Loader2 } from "lucide-react";

export default function Login({ onAuthSuccess, adminMode = false }) {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post("https://swiftshopiy-backned.onrender.com/api/login", { 
        identifier,
        password 
      });

      const { user, token } = res.data;
      const userRole = (user?.role || "Customer").toLowerCase();
      const hasAdminAccess = ["admin", "super admin"].includes(userRole);

      // If user attempted to access the Admin login portal without admin privileges
      if (adminMode && !hasAdminAccess) {
        setError("This account does not have administrator access.");
        setLoading(false);
        return;
      }

      // Safely persist to storage
      if (token) localStorage.setItem("token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));

      if (typeof onAuthSuccess === "function") {
        onAuthSuccess(user, token);
      }

      // Role-based routing
      if (adminMode || hasAdminAccess) {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Login Error:", err.response?.data || err.message);
      const serverMessage = 
        err.response?.data?.errors?.identifier?.[0] ||
        err.response?.data?.errors?.email?.[0] ||
        err.response?.data?.message || 
        "Invalid email or password.";
      setError(serverMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white max-w-md w-full p-8 rounded-3xl border border-slate-200 shadow-xl">
        <h2 className="text-2xl font-bold text-slate-900 text-center">
          {adminMode ? "Administrator Sign In" : "Sign In"}
        </h2>
        <p className="text-xs text-slate-500 text-center mt-1 mb-6">
          {adminMode 
            ? "Sign in with an authorized Super Admin or Admin account" 
            : "Access your customer portal and order history"}
        </p>

        {error && (
          <div className="mb-4 text-xs text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Username or email</label>
            <input
              type="text"
              required
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g. admin or admin@swiftshop.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 cursor-pointer shadow transition-all disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Log In"}
          </button>
        </form>

        {!adminMode && (
          <p className="text-xs text-slate-600 text-center mt-6">
            Don't have an account?{" "}
            <Link to="/register" className="font-bold text-indigo-600 hover:underline">
              Register here
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
