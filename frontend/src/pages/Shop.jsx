import React, { useState, useMemo } from "react";
import { Search, Star, Loader2, PackageX } from "lucide-react";

export default function Shop({ products = [], loading = false, onAddToCart }) {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Dynamically derive categories from data, defaulting if empty
  const categories = useMemo(() => {
    const unique = Array.from(new Set((products || []).map((p) => p.category).filter(Boolean)));
    return ["All", ...(unique.length > 0 ? unique : ["Electronics", "Accessories", "Home"])];
  }, [products]);

  // Memoize filtered results to avoid recalculations on outside re-renders
  const filteredProducts = useMemo(() => {
    const list = Array.isArray(products) ? products : [];
    const query = searchQuery.trim().toLowerCase();
    return list.filter((item) => {
      const matchesCat = selectedCategory === "All" || item.category === selectedCategory;
      const matchesSearch = !query || item.name?.toLowerCase().includes(query);
      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Search & Categories Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
          <input
            type="text"
            placeholder="Search catalog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100 rounded-full border border-transparent focus:border-slate-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-1 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-medium transition cursor-pointer whitespace-nowrap ${
                selectedCategory === cat
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-2" />
          <span className="text-xs">Loading items...</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        /* Empty State */
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 text-center">
          <PackageX className="w-10 h-10 stroke-1 text-slate-300 mb-3" />
          <p className="text-sm font-medium text-slate-700">No products found</p>
          <p className="text-xs text-slate-400 mt-1 max-w-xs">
            {searchQuery
              ? `No matches for "${searchQuery}". Try adjusting your search or filter.`
              : "There are currently no items available in this category."}
          </p>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((p) => {
            const price = typeof p.price === "number" ? p.price.toFixed(2) : Number(p.price || 0).toFixed(2);
            const rating = typeof p.rating === "number" ? p.rating.toFixed(1) : p.rating || "N/A";

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
              >
                <img
                  src={p.image || "https://placehold.co/600x400?text=No+Image"}
                  alt={p.name || "Product image"}
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.src = "https://placehold.co/600x400?text=Image+Unavailable";
                  }}
                  className="h-56 w-full object-cover bg-slate-50"
                />

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-1 text-amber-500 text-xs mb-1 font-semibold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{rating}</span>
                    </div>
                    <h3 className="font-semibold text-slate-900 line-clamp-1">{p.name}</h3>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">{p.description}</p>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900">${price}</span>
                    <button
                      type="button"
                      onClick={() => onAddToCart?.(p)}
                      className="bg-slate-900 hover:bg-indigo-600 active:scale-95 text-white text-xs font-semibold px-4 py-2 rounded-xl transition cursor-pointer"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}