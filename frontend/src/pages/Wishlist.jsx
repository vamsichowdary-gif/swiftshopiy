import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Heart, ShoppingBag, Trash2, ArrowRight, ArrowUpRight, Sparkles } from "lucide-react";

export default function Wishlist({
  wishlist = [],
  onAddToCart,
  onRemoveFromWishlist,
  onClearWishlist,
}) {
  const navigate = useNavigate();

  const handleMoveAllToCart = () => {
    wishlist.forEach((item) => {
      onAddToCart?.(item);
    });
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#faf9f6] text-slate-950 py-10 px-4 sm:px-8 lg:px-12">
      <div className="mx-auto max-w-[1440px]">
        {/* Header */}
        <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/70 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600 mb-2">
              <Heart size={12} className="fill-rose-500 text-rose-500" /> Saved Pieces
            </div>
            <h1 className="font-serif text-3xl font-semibold tracking-tight sm:text-4xl">
              My Wishlist
            </h1>
            <p className="mt-1.5 text-xs text-slate-500">
              {wishlist.length === 0
                ? "Items saved to your wishlist will appear here."
                : `You have ${wishlist.length} ${wishlist.length === 1 ? "saved item" : "saved items"} ready to review.`}
            </p>
          </div>

          {wishlist.length > 0 && (
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={handleMoveAllToCart}
                className="inline-flex items-center gap-2 rounded-full bg-[#202a24] px-5 py-2.5 text-xs font-bold text-white transition hover:bg-[#3b4b3f]"
              >
                <ShoppingBag size={14} /> Add All to Bag
              </button>
              <button
                type="button"
                onClick={onClearWishlist}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-600 transition hover:border-rose-300 hover:text-rose-600"
              >
                <Trash2 size={13} /> Clear
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {wishlist.length === 0 ? (
          <div className="mx-auto my-16 max-w-md rounded-3xl border border-slate-200/80 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-rose-50 text-rose-500">
              <Heart size={28} className="fill-rose-100 text-rose-500" />
            </div>
            <h2 className="font-serif text-2xl font-semibold text-slate-900">Your wishlist is empty</h2>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Save your favorite pieces by tapping the heart icon while exploring our catalog. They will be saved here for your next shopping session.
            </p>
            <div className="mt-6 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
              <Link
                to="/shop"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-[#202a24] px-6 py-3 text-xs font-bold text-white transition hover:bg-[#3b4b3f]"
              >
                Explore Shop <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 lg:gap-y-10">
            {wishlist.map((item) => {
              const price = Number(item.price || 0).toFixed(2);
              return (
                <article
                  key={item.id}
                  className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white transition hover:shadow-md"
                >
                  <div className="relative aspect-[4/4.5] w-full overflow-hidden bg-[#eeece7]">
                    <img
                      src={
                        item.image ||
                        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80"
                      }
                      alt={item.name}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80";
                      }}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />

                    {item.category && (
                      <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-700 backdrop-blur">
                        {item.category}
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => onRemoveFromWishlist?.(item.id)}
                      title="Remove from wishlist"
                      aria-label={`Remove ${item.name} from wishlist`}
                      className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/90 text-rose-500 shadow-sm backdrop-blur transition hover:bg-rose-500 hover:text-white"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div>
                      <h3 className="truncate text-sm font-semibold text-slate-900">{item.name}</h3>
                      {item.description && (
                        <p className="mt-1 line-clamp-1 text-xs text-slate-500">{item.description}</p>
                      )}
                      <p className="mt-2 text-sm font-bold text-slate-900">${price}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => onAddToCart?.(item)}
                      className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#202a24] py-2.5 text-xs font-bold text-white transition hover:bg-[#3b4b3f]"
                    >
                      <ShoppingBag size={14} /> Add to Bag
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
