import React from "react";
import { ArrowUpRight, ShoppingBag, Star } from "lucide-react";

export default function ProductCard({ product, onAddToCart }) {
  const price = Number(product.price || 0).toFixed(2);
  const rating = Number(product.rating);

  return (
    <article className="group min-w-0">
      <div className="relative overflow-hidden rounded-2xl bg-[#eeece7]">
        <img
          src={product.image || "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"}
          alt={product.name || "Product"}
          loading="lazy"
          onError={(event) => { event.currentTarget.src = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"; }}
          className="aspect-[4/4.5] w-full object-cover transition duration-500 group-hover:scale-[1.04]"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-700 backdrop-blur">
          {product.category || "Selected"}
        </span>
        <button
          type="button"
          onClick={() => onAddToCart?.(product)}
          className="absolute bottom-3 right-3 grid h-11 w-11 place-items-center rounded-full bg-white text-slate-900 shadow-lg transition hover:bg-slate-950 hover:text-white"
          aria-label={`Add ${product.name} to cart`}
        >
          <ShoppingBag size={17} />
        </button>
      </div>
      <div className="flex items-start justify-between gap-3 pt-4">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-900">{product.name}</h3>
          <p className="mt-1 line-clamp-1 text-xs text-slate-500">{product.description}</p>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-500">
            <Star size={12} className="fill-amber-400 text-amber-400" />
            <span>{Number.isFinite(rating) ? rating.toFixed(1) : "New"}</span>
            {product.reviews > 0 && <span>({product.reviews})</span>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1 text-sm font-bold text-slate-900">
          ${price}<ArrowUpRight size={14} className="text-slate-400 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-slate-900" />
        </div>
      </div>
    </article>
  );
}
