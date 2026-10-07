import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Loader2,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  AtSign,
} from "lucide-react";
import OtpInput, { triggerConfettiBlast } from "../components/OtpInput";

const API_URL =
  import.meta.env?.VITE_API_URL || "http://127.0.0.1:8000/api";

export default function Register({ onAuthSuccess }) {
  const [step, setStep] = useState("details"); // 'details' | 'otp'
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  // Step 1: Validate details & send OTP to email
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (form.password !== form.password_confirmation) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/send-otp`, {
        email: form.email,
        name: form.name,
        type: "register",
      });

      if (res.data?.success) {
        setStep("otp");
        setCountdown(45);
      } else {
        setError(res.data?.message || "Could not send OTP code.");
      }
    } catch (err) {
      console.error("OTP send error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        "Failed to send verification code. Please check your email.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (countdown > 0) return;
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/send-otp`, {
        email: form.email,
        name: form.name,
        type: "register",
      });
      if (res.data?.success) {
        setCountdown(45);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Unable to resend OTP code.");
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP & complete account creation with celebratory blast
  const handleVerifyCode = async (code) => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        name: form.name,
        username: form.username,
        email: form.email,
        password: form.password,
        otp: code.trim(),
      };

      const res = await axios.post(`${API_URL}/register`, payload);
      const { user, token } = res.data;

      // Confetti celebration blast
      triggerConfettiBlast();

      // Persist auth tokens
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

      setTimeout(() => {
        navigate("/dashboard");
      }, 1200);

      return true;
    } catch (err) {
      console.error("Registration verify error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.otp?.[0] ||
        "Registration failed. Invalid or expired OTP.";
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-12 overflow-hidden bg-slate-50/50">
      {/* Animated Floating Gradient Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-24 -right-24 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "7s" }}
        />
        <div
          className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "9s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full flex justify-center">
        {step === "otp" ? (
          <OtpInput
            email={form.email}
            length={6}
            onVerify={handleVerifyCode}
            onResend={handleResendOtp}
            onBack={() => setStep("details")}
            countdown={countdown}
            loading={loading}
            error={error}
          />
        ) : (
          /* STEP 1: Account Details with clean white bg */
          <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-2xl shadow-indigo-950/10 border border-slate-100 transition-all">
            {/* Top Header Badge */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60 mb-3">
                <Sparkles size={12} className="text-purple-600 animate-spin" style={{ animationDuration: "14s" }} />
                <span>Join SwiftShop Today</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Create Account
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                We will send a one-time verification code to your email
              </p>
            </div>

            {error && (
              <div className="mb-5 text-xs text-rose-600 bg-rose-50 border border-rose-200 p-3.5 rounded-2xl flex items-start gap-2 animate-in fade-in">
                <span className="font-semibold">{error}</span>
              </div>
            )}

            <form onSubmit={handleRequestOtp} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vamsi Chowdary"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition placeholder-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Username
                </label>
                <div className="relative">
                  <AtSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    autoComplete="username"
                    pattern="[A-Za-z0-9_-]+"
                    placeholder="vamsi_c"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition placeholder-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    required
                    placeholder="customer@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition placeholder-slate-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={form.password_confirmation}
                      onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })}
                      className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50/70 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition placeholder-slate-400"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="flex items-center gap-1.5 text-slate-600 hover:text-slate-800 transition cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  <span>{showPassword ? "Hide password" : "Show password"}</span>
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:opacity-95 text-white font-bold text-xs rounded-2xl shadow-lg shadow-purple-600/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Sending Verification Code...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Verification Code</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-600">
                Already have an account?{" "}
                <Link to="/login" className="font-bold text-purple-600 hover:underline">
                  Sign In here
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
