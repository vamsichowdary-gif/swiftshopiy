import React, { useRef, useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { Loader2, ArrowLeft, RefreshCw, CheckCircle2, KeyRound, Sparkles } from "lucide-react";

export const triggerConfettiBlast = () => {
  const count = 200;
  const defaults = {
    origin: { y: 0.65 },
    zIndex: 99999,
  };

  function fire(particleRatio, opts) {
    confetti({
      ...defaults,
      ...opts,
      particleCount: Math.floor(count * particleRatio),
    });
  }

  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
};

export default function OtpInput({
  email,
  length = 6,
  onVerify,
  onResend,
  onBack,
  countdown = 0,
  loading = false,
  error = "",
  notice = "",
}) {
  const [digits, setDigits] = useState(Array(length).fill(""));
  const [isSuccess, setIsSuccess] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index, value) => {
    // Keep only numbers
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      const updated = [...digits];
      updated[index] = "";
      setDigits(updated);
      return;
    }

    // Single digit input
    const char = cleaned.slice(-1);
    const updated = [...digits];
    updated[index] = char;
    setDigits(updated);

    // Focus next input if available
    if (index < length - 1 && char) {
      inputRefs.current[index + 1]?.focus();
    }

    // If all digits filled, auto-trigger verify if desired
    if (updated.every((d) => d !== "") && updated.join("").length === length) {
      handleComplete(updated.join(""));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;

    const updated = [...digits];
    for (let i = 0; i < length; i++) {
      updated[i] = pasted[i] || "";
    }
    setDigits(updated);

    const nextIndex = Math.min(pasted.length, length - 1);
    inputRefs.current[nextIndex]?.focus();

    if (pasted.length === length) {
      handleComplete(pasted);
    }
  };

  const handleComplete = async (codeToVerify) => {
    const fullCode = codeToVerify || digits.join("");
    if (fullCode.length !== length || loading) return;

    if (typeof onVerify === "function") {
      const success = await onVerify(fullCode);
      if (success) {
        setIsSuccess(true);
        triggerConfettiBlast();
      }
    }
  };

  return (
    <div className="relative w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-2xl shadow-indigo-950/10 border border-slate-100 text-center transition-all animate-in fade-in zoom-in-95">
      {/* Top 3-dot decorative capsule (matching 21st.dev component) */}
      <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200/80 shadow-inner flex items-center justify-center gap-1.5 mx-auto mb-5">
        <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" style={{ animationDelay: "0ms" }} />
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" style={{ animationDelay: "150ms" }} />
        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" style={{ animationDelay: "300ms" }} />
      </div>

      {/* Heading */}
      <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
        Enter Verification Code
      </h2>

      {/* Subtext with email */}
      <p className="text-xs sm:text-sm text-slate-500 mb-1">
        We've sent a {length}-digit code to
      </p>
      <p className="text-xs sm:text-sm font-bold text-indigo-600 mb-4 break-all">
        {email}
      </p>

      {/* Verification Notice / Dev OTP Banner */}
      {notice && (
        <div className="mb-5 text-xs text-indigo-800 bg-indigo-50 border border-indigo-200/80 p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2 animate-in fade-in">
          <div className="flex items-center gap-2">
            <KeyRound size={15} className="text-indigo-600 shrink-0" />
            <span className="font-semibold text-center">{notice}</span>
          </div>
          {(() => {
            const matchedDigits = notice.match(/\b\d{6}\b/);
            if (matchedDigits && matchedDigits[0]) {
              const detectedCode = matchedDigits[0];
              return (
                <button
                  type="button"
                  onClick={() => {
                    const updated = detectedCode.split("");
                    setDigits(updated);
                    handleComplete(detectedCode);
                  }}
                  className="mt-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-[11px] shadow-sm transition cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles size={12} />
                  <span>Auto-fill code {detectedCode}</span>
                </button>
              );
            }
            return null;
          })()}
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div className="mb-5 text-xs text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-2xl flex items-center justify-center gap-1.5 animate-in fade-in">
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Success Celebration Banner */}
      {isSuccess && (
        <div className="mb-5 text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex items-center justify-center gap-2 animate-in bounce-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span className="font-bold">Verified successfully! Logging in...</span>
        </div>
      )}

      {/* 6 Individual Digit Boxes (White background with crisp borders) */}
      <div className="flex items-center justify-center gap-2 sm:gap-3 mb-6" onPaste={handlePaste}>
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            disabled={loading || isSuccess}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-11 h-14 sm:w-13 sm:h-16 text-center text-2xl font-bold font-mono bg-slate-50/70 border-2 border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:border-indigo-600 focus:ring-4 focus:ring-indigo-500/15 focus:outline-none transition-all shadow-sm disabled:opacity-50"
          />
        ))}
      </div>

      {/* Resend & Back controls */}
      <div className="flex flex-col items-center gap-3 text-xs text-slate-600 mb-6">
        <p>
          Didn't get a code?{" "}
          {countdown > 0 ? (
            <span className="font-bold text-slate-400">Resend in {countdown}s</span>
          ) : (
            <button
              type="button"
              disabled={loading || isSuccess}
              onClick={onResend}
              className="font-bold text-indigo-600 hover:text-indigo-800 transition cursor-pointer underline underline-offset-2"
            >
              Resend now
            </button>
          )}
        </p>

        {onBack && (
          <button
            type="button"
            disabled={loading || isSuccess}
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition cursor-pointer"
          >
            <ArrowLeft size={13} />
            <span>Change email address</span>
          </button>
        )}
      </div>

      {/* Verify Action Button */}
      <button
        type="button"
        disabled={loading || isSuccess || digits.some((d) => d === "")}
        onClick={() => handleComplete()}
        className="w-full py-3.5 px-4 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg shadow-indigo-600/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
      >
        {loading ? (
          <>
            <Loader2 size={16} className="animate-spin" />
            <span>Verifying Code...</span>
          </>
        ) : isSuccess ? (
          <>
            <CheckCircle2 size={18} />
            <span>Verified!</span>
          </>
        ) : (
          <span>Verify & Continue</span>
        )}
      </button>
    </div>
  );
}
