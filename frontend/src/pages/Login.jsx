import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Loader2,
  User,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  ArrowRight,
  Mail,
  Phone,
  KeyRound,
  RefreshCw,
  CheckCircle2,
  ArrowLeft,
  Info,
} from "lucide-react";
import OtpInput, { triggerConfettiBlast } from "../components/OtpInput";
import { API_URL } from "../config/api";

export default function Login({ onAuthSuccess }) {
  // Main login mode: 'password' | 'otp'
  const [authMode, setAuthMode] = useState("password");

  // OTP login method: 'email' | 'mobile'
  const [otpChannel, setOtpChannel] = useState("email");

  // Password login state
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Email OTP state
  const [emailOtpAddress, setEmailOtpAddress] = useState("");
  const [emailOtpStep, setEmailOtpStep] = useState("request"); // 'request' | 'verify'
  const [emailOtpNotice, setEmailOtpNotice] = useState("");

  // Mobile OTP state
  const [mobileNumber, setMobileNumber] = useState("");
  const [mobileOtpStep, setMobileOtpStep] = useState("request"); // 'request' | 'verify'
  const [mobileOtpNotice, setMobileOtpNotice] = useState("");

  // Shared state
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const saveAuthAndRedirect = (user, token) => {
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
    setTimeout(() => {
      if (userRole === "admin" || userRole === "super admin") {
        localStorage.setItem("swiftshop_admin_token", token);
        localStorage.setItem("swiftshop_admin_user", JSON.stringify(user));
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    }, 1200);
  };

  // 1. Password Login
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${API_URL}/login`, {
        identifier,
        password,
      });
      const { user, token } = res.data;
      triggerConfettiBlast();
      saveAuthAndRedirect(user, token);
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

  // 2. Request Email OTP for login
  const handleRequestEmailOtp = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    setError("");
    setEmailOtpNotice("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/send-otp`, {
        email: emailOtpAddress,
        type: "login",
      });

      if (res.data?.success) {
        setEmailOtpStep("verify");
        setCountdown(45);
        if (res.data?.dev_otp) {
          setEmailOtpNotice(`Verification code: ${res.data.dev_otp}`);
        } else if (res.data?.note) {
          setEmailOtpNotice(res.data.note);
        } else {
          setEmailOtpNotice("");
        }
      } else {
        setError(res.data?.message || "Could not send OTP code.");
      }
    } catch (err) {
      console.error("Email OTP request error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.email?.[0] ||
        "Failed to send login code. Please check your email.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // 3. Verify Email OTP with celebratory blast
  const handleVerifyEmailOtp = async (code) => {
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/login-otp`, {
        email: emailOtpAddress,
        otp: code.trim(),
      });

      const { user, token } = res.data;
      triggerConfettiBlast();
      saveAuthAndRedirect(user, token);
      return true;
    } catch (err) {
      console.error("Email OTP verify error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.otp?.[0] ||
        "Invalid or expired OTP code.";
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // 4. Request Mobile OTP
  const handleRequestMobileOtp = async (e) => {
    if (e?.preventDefault) e.preventDefault();
    const cleanPhone = mobileNumber.replace(/\D/g, "");
    if (!cleanPhone || cleanPhone.length < 10) {
      setError("Please enter a valid 10-digit mobile number.");
      return;
    }

    setError("");
    setMobileOtpNotice("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/send-mobile-otp`, {
        phone: cleanPhone,
      });

      if (res.data?.success) {
        setMobileOtpStep("verify");
        setCountdown(45);
        if (res.data?.dev_otp) {
          setMobileOtpNotice(`Verification code: ${res.data.dev_otp}`);
        } else if (res.data?.note) {
          setMobileOtpNotice(res.data.note);
        }
      } else {
        setError(res.data?.message || "Could not send mobile verification code.");
      }
    } catch (err) {
      console.error("Mobile OTP request error:", err);
      const msg =
        err.response?.data?.message ||
        "Unable to send SMS code right now. Please try Email OTP or Password.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // 5. Verify Mobile OTP
  const handleVerifyMobileOtp = async (code) => {
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/login-mobile-otp`, {
        phone: mobileNumber.replace(/\D/g, ""),
        otp: code.trim(),
      });

      const { user, token } = res.data;
      triggerConfettiBlast();
      saveAuthAndRedirect(user, token);
      return true;
    } catch (err) {
      console.error("Mobile OTP verify error:", err);
      const msg =
        err.response?.data?.message ||
        err.response?.data?.errors?.otp?.[0] ||
        "Invalid or expired mobile OTP code.";
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const isVerifying =
    authMode === "otp" &&
    ((otpChannel === "email" && emailOtpStep === "verify") ||
      (otpChannel === "mobile" && mobileOtpStep === "verify"));

  return (
    <div className="relative min-h-[85vh] flex items-center justify-center px-4 py-12 overflow-hidden bg-slate-50/50">
      {/* Animated Floating Gradient Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-24 -left-24 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "6s" }}
        />
        <div
          className="absolute -bottom-24 -right-24 w-80 h-80 bg-purple-500/15 rounded-full blur-3xl animate-pulse"
          style={{ animationDuration: "8s" }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 w-full flex flex-col items-center justify-center">
        {isVerifying ? (
          <div className="w-full flex flex-col items-center">
            <OtpInput
              email={otpChannel === "email" ? emailOtpAddress : `+91 ${mobileNumber.replace(/\D/g, "")}`}
              length={6}
              onVerify={otpChannel === "email" ? handleVerifyEmailOtp : handleVerifyMobileOtp}
              onResend={otpChannel === "email" ? handleRequestEmailOtp : handleRequestMobileOtp}
              onBack={() =>
                otpChannel === "email"
                  ? setEmailOtpStep("request")
                  : setMobileOtpStep("request")
              }
              countdown={countdown}
              loading={loading}
              error={error}
              notice={otpChannel === "email" ? emailOtpNotice : mobileOtpNotice}
            />
          </div>
        ) : (
          /* Main Login Card with White Background */
          <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-2xl shadow-indigo-950/10 border border-slate-100 transition-all">
            {/* Top Header Badge */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200/60 mb-3">
                <Sparkles size={12} className="text-blue-600 animate-spin" style={{ animationDuration: "12s" }} />
                <span>Welcome to SwiftShop</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Customer Sign In
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                Choose your preferred sign-in method: Password or One-Time Code
              </p>
            </div>

            {/* Primary Auth Mode Tabs: Password vs OTP */}
            <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setAuthMode("password");
                  setError("");
                }}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMode === "password"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Lock size={13} />
                <span>Password</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAuthMode("otp");
                  setError("");
                }}
                className={`py-2 px-3 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  authMode === "otp"
                    ? "bg-white text-indigo-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <KeyRound size={13} />
                <span>OTP Code</span>
              </button>
            </div>

            {error && (
              <div className="mb-5 text-xs text-rose-600 bg-rose-50 border border-rose-200 p-3.5 rounded-2xl flex items-start gap-2 animate-in fade-in">
                <span className="font-semibold">{error}</span>
              </div>
            )}

            {/* MODE A: Password Login Form */}
            {authMode === "password" && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
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
                      placeholder="e.g. vamsi or user@example.com"
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
                        <span>Sign In with Password</span>
                        <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* MODE B: OTP Login Form */}
            {authMode === "otp" && (
              <div className="space-y-4">
                {/* Secondary Channel Selector: Email vs Mobile */}
                <div className="flex items-center justify-center gap-2 text-xs mb-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOtpChannel("email");
                      setError("");
                    }}
                    className={`py-1.5 px-3 rounded-xl font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                      otpChannel === "email"
                        ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Mail size={13} />
                    <span>Email OTP</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setOtpChannel("mobile");
                      setError("");
                    }}
                    className={`py-1.5 px-3 rounded-xl font-semibold transition flex items-center gap-1.5 cursor-pointer ${
                      otpChannel === "mobile"
                        ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <Phone size={13} />
                    <span>Mobile OTP</span>
                  </button>
                </div>

                {/* Email OTP Request */}
                {otpChannel === "email" && emailOtpStep === "request" && (
                  <form onSubmit={handleRequestEmailOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Your Registered Email
                      </label>
                      <div className="relative">
                        <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="email"
                          required
                          autoComplete="email"
                          value={emailOtpAddress}
                          onChange={(e) => setEmailOtpAddress(e.target.value)}
                          placeholder="customer@example.com"
                          className="w-full pl-10 pr-4 py-3 text-xs bg-slate-50/70 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition placeholder-slate-400"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Sending OTP Code...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Email Code</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </form>
                )}

                {/* Mobile OTP Request */}
                {otpChannel === "mobile" && mobileOtpStep === "request" && (
                  <form onSubmit={handleRequestMobileOtp} className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        Mobile Phone Number
                      </label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                          type="tel"
                          required
                          autoComplete="tel"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          placeholder="e.g. 6303062506"
                          className="w-full pl-10 pr-4 py-3 text-xs bg-slate-50/70 border border-slate-200 rounded-2xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition placeholder-slate-400"
                        />
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1">Enter your 10-digit mobile number</p>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3.5 px-4 bg-gradient-to-r from-indigo-600 via-blue-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs rounded-2xl shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          <span>Sending SMS Code...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Mobile OTP</span>
                          <ArrowRight size={14} />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            )}

            <div className="mt-7 pt-5 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-600">
                Don't have a SwiftShop account?{" "}
                <Link to="/register" className="font-bold text-blue-600 hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
