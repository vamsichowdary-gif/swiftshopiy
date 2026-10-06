import React, { useEffect, useState } from "react";
import { Zap, Volume2, Sparkles, Tag, ArrowRight } from "lucide-react";
import { fetchPublicFlashDeals } from "../admin/api";

const DEFAULT_NEWS = [
  { id: 1, badge: "⚡ FLASH SALE", text: "Limited Time: Up to 40% OFF trending tech, desk essentials & audio gear!" },
  { id: 2, badge: "📦 FREE SHIPPING", text: "Complimentary global shipping on all verified orders above $100." },
  { id: 3, badge: "✨ NEW ARRIVALS", text: "Fresh catalog items just added! Check your dashboard for instant alerts." },
  { id: 4, badge: "🛡️ GUARANTEE", text: "30-day effortless returns, scannable barcode invoices, and priority support." },
];

export default function NewsTicker({ className = "", theme = "dark" }) {
  const [items, setItems] = useState(DEFAULT_NEWS);

  useEffect(() => {
    let mounted = true;
    fetchPublicFlashDeals()
      .then((data) => {
        if (!mounted) return;
        if (Array.isArray(data?.news) && data.news.length > 0) {
          setItems(data.news);
        }
      })
      .catch(() => {
        // Fallback to default announcements on error
      });
    return () => {
      mounted = false;
    };
  }, []);

  const isLight = theme === "light";

  return (
    <div
      className={`relative w-full overflow-hidden flex items-center select-none ${
        isLight
          ? "bg-[#202a24] text-white border-b border-[#2d3a32]"
          : "bg-[#0b101c]/90 text-slate-200 border-b border-slate-800/80 backdrop-blur-md"
      } ${className}`}
    >
      {/* Fixed Left Label Pill */}
      <div
        className={`shrink-0 z-20 flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider ${
          isLight
            ? "bg-[#2d3a32] text-amber-300"
            : "bg-blue-600/30 text-blue-400 border-r border-blue-500/20"
        }`}
      >
        <Zap size={12} className="animate-bounce" />
        <span className="hidden sm:inline">EXCLUSIVE DEALS</span>
        <span className="sm:hidden">DEALS</span>
      </div>

      {/* Infinite Horizontal Scrolling Track */}
      <div className="relative flex-1 overflow-hidden py-1.5 group">
        <div className="flex w-max items-center gap-8 animate-marquee group-hover:[animation-play-state:paused]">
          {[...items, ...items, ...items].map((item, idx) => (
            <div key={`${item.id}-${idx}`} className="flex items-center gap-2.5 text-xs">
              <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wide bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {item.badge || "PROMO"}
              </span>
              <span className="font-medium text-slate-200 whitespace-nowrap">
                {item.text}
              </span>
              <span className="text-slate-600 font-bold ml-3">·</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
