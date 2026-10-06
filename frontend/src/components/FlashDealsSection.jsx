import React, { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Zap, Clock, ArrowRight, ShoppingBag, Flame, Sparkles } from "lucide-react";
import { fetchPublicFlashDeals } from "../admin/api";

export default function FlashDealsSection({ products = [], onAddToCart }) {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    hours: 23,
    minutes: 59,
    seconds: 59,
  });

  useEffect(() => {
    let mounted = true;
    fetchPublicFlashDeals()
      .then((data) => {
        if (!mounted) return;
        const activeDeals = Array.isArray(data?.deals)
          ? data.deals.filter((d) => Boolean(d.is_active))
          : [];
        setDeals(activeDeals);
      })
      .catch(() => {
        setDeals([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const activeDeal = deals[0];

  useEffect(() => {
    if (!activeDeal?.end_time) return;

    const interval = setInterval(() => {
      const diff = new Date(activeDeal.end_time).getTime() - new Date().getTime();
      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [activeDeal]);

  // Deal products to display
  const dealProducts = useMemo(() => {
    return products.slice(0, 4);
  }, [products]);

  // If no active flash deal exists, don't show the section (admin stopped it!)
  if (!loading && (!activeDeal || !activeDeal.is_active)) {
    return null;
  }

  return (
    <section className="my-12 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#18211b] via-[#202a24] to-[#121814] text-white p-6 sm:p-10 shadow-2xl relative border border-emerald-900/40">
      {/* Background Ambient Flare */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner with Timer */}
      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-8 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-black uppercase tracking-wider mb-3">
            <Flame size={14} className="text-amber-400 animate-bounce" />
            <span>Limited-Time Flash Event</span>
            <span className="bg-amber-400 text-slate-950 px-1.5 py-0.2 rounded font-extrabold text-[10px]">
              {activeDeal?.discount || "35% OFF"}
            </span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-white">
            {activeDeal?.title || "Super Flash Deals Drop"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-xl leading-relaxed">
            {activeDeal?.description ||
              "Exclusive limited-time discount on top trending everyday essentials. Discount applied automatically at checkout."}
          </p>
        </div>

        {/* Live Countdown Box */}
        <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md p-4 rounded-2xl border border-white/10 shrink-0">
          <Clock size={20} className="text-amber-400 shrink-0" />
          <div className="flex items-center gap-2 text-center">
            <div className="bg-[#111827] px-3 py-2 rounded-xl border border-slate-800 min-w-[50px]">
              <span className="block font-mono text-xl sm:text-2xl font-black text-white">
                {String(timeLeft.hours).padStart(2, "0")}
              </span>
              <span className="block text-[9px] uppercase font-bold text-slate-400">Hours</span>
            </div>
            <span className="text-amber-400 font-bold text-lg">:</span>
            <div className="bg-[#111827] px-3 py-2 rounded-xl border border-slate-800 min-w-[50px]">
              <span className="block font-mono text-xl sm:text-2xl font-black text-white">
                {String(timeLeft.minutes).padStart(2, "0")}
              </span>
              <span className="block text-[9px] uppercase font-bold text-slate-400">Mins</span>
            </div>
            <span className="text-amber-400 font-bold text-lg">:</span>
            <div className="bg-[#111827] px-3 py-2 rounded-xl border border-slate-800 min-w-[50px]">
              <span className="block font-mono text-xl sm:text-2xl font-black text-amber-400">
                {String(timeLeft.seconds).padStart(2, "0")}
              </span>
              <span className="block text-[9px] uppercase font-bold text-slate-400">Secs</span>
            </div>
          </div>
        </div>
      </div>

      {/* Deal Products Grid */}
      {dealProducts.length > 0 && (
        <div className="relative z-10 pt-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {dealProducts.map((product) => {
            const originalPrice = Number(product.price || 0);
            const dealPrice = (originalPrice * 0.7).toFixed(2);

            return (
              <div
                key={product.id}
                className="bg-white/5 hover:bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/10 transition group flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square rounded-xl overflow-hidden bg-black/40 mb-3">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800";
                      }}
                    />
                    <span className="absolute top-2 left-2 bg-rose-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow">
                      FLASH DEAL
                    </span>
                  </div>

                  <h4 className="font-semibold text-xs sm:text-sm text-white truncate">
                    {product.name}
                  </h4>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">
                    {product.category}
                  </p>
                </div>

                <div className="pt-3 mt-3 border-t border-white/10 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-base sm:text-lg font-black text-emerald-400">
                      ${dealPrice}
                    </span>
                    <span className="text-[11px] text-slate-400 line-through ml-1.5">
                      ${originalPrice.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => onAddToCart?.(product)}
                    className="p-2 sm:px-3 sm:py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center gap-1 shadow-md shadow-emerald-500/30 cursor-pointer"
                    title="Add to Cart at Flash Price"
                  >
                    <ShoppingBag size={14} />
                    <span className="hidden sm:inline">Add</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer link to Shop */}
      <div className="relative z-10 pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
        <span className="text-xs text-slate-400 flex items-center gap-1.5">
          <Sparkles size={13} className="text-amber-400" />
          Quantities reserved automatically in cart
        </span>
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-xs font-bold text-amber-300 hover:text-white transition"
        >
          <span>Explore all flash items</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </section>
  );
}
