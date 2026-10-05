import React, { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PackageX, Search, SlidersHorizontal } from "lucide-react";
import ProductCard from "../components/ProductCard";

export default function Shop({ products = [], loading = false, onAddToCart }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("featured");

  const categories = useMemo(() => {
    const unique = [...new Set(products.map(product => product.category).filter(Boolean))];
    return ["All", ...(unique.length ? unique : ["Electronics", "Accessories", "Home"])];
  }, [products]);

  const requestedCategory = searchParams.get("category");
  const selectedCategory = categories.includes(requestedCategory) ? requestedCategory : "All";

  const filteredProducts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = products.filter(product => {
      const categoryMatch = selectedCategory === "All" || product.category === selectedCategory;
      const searchMatch = !query || `${product.name || ""} ${product.description || ""} ${product.category || ""}`.toLowerCase().includes(query);
      return categoryMatch && searchMatch;
    });

    if (sortBy === "price-low") filtered.sort((a, b) => Number(a.price) - Number(b.price));
    if (sortBy === "price-high") filtered.sort((a, b) => Number(b.price) - Number(a.price));
    if (sortBy === "rating") filtered.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
    return filtered;
  }, [products, searchQuery, selectedCategory, sortBy]);

  const selectCategory = (category) => {
    const next = new URLSearchParams(searchParams);
    if (category === "All") next.delete("category");
    else next.set("category", category);
    setSearchParams(next);
  };

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-[#faf9f6] text-slate-950">
      <div className="mx-auto max-w-[1440px] px-4 py-9 sm:px-8 sm:py-14 lg:px-12">
        <div className="border-b border-slate-200 pb-8 sm:pb-10">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#748174]">The SwiftShop collection</p>
          <div className="mt-3 flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div><h1 className="font-serif text-4xl tracking-tight sm:text-5xl">Good finds, all in one place.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">A considered mix of useful things for home, work, and everywhere in between.</p></div>
            <div className="relative w-full md:max-w-sm"><Search size={17} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/><input type="search" aria-label="Search products" placeholder="Search products or collections" value={searchQuery} onChange={event=>setSearchQuery(event.target.value)} className="w-full rounded-full border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400"/></div>
          </div>
        </div>

        <div className="flex flex-col gap-5 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1">{categories.map(category => <button key={category} type="button" onClick={() => selectCategory(category)} className={`rounded-full px-4 py-2.5 text-xs font-semibold transition ${selectedCategory === category ? "bg-[#202a24] text-white" : "border border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-950"}`}>{category}</button>)}</div>
          <label className="flex shrink-0 items-center gap-2 text-xs font-semibold text-slate-600"><SlidersHorizontal size={15}/><span>Sort</span><select value={sortBy} onChange={event=>setSortBy(event.target.value)} className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs text-slate-800 outline-none"><option value="featured">Featured</option><option value="rating">Top rated</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option></select></label>
        </div>

        <div className="mb-5 flex items-center justify-between text-xs text-slate-500"><span>{loading ? "Finding your collection..." : `${filteredProducts.length} ${filteredProducts.length === 1 ? "piece" : "pieces"}`}</span>{selectedCategory !== "All" && <button onClick={() => selectCategory("All")} className="font-semibold text-slate-700 underline underline-offset-4">Clear collection</button>}</div>

        {loading ? <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index}><div className="aspect-[4/4.5] animate-pulse rounded-2xl bg-[#eeece7]"/><div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-[#eeece7]"/><div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-[#eeece7]"/></div>)}</div> : filteredProducts.length ? <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4 lg:gap-y-10">{filteredProducts.map(product => <ProductCard key={product.id} product={product} onAddToCart={onAddToCart}/>)}</div> : <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 text-center"><PackageX className="text-slate-300" size={34}/><h2 className="mt-4 font-serif text-2xl">Nothing here just yet</h2><p className="mt-2 max-w-sm text-sm text-slate-500">Try another search or collection to find what you’re looking for.</p><button onClick={() => { setSearchQuery(""); selectCategory("All"); }} className="mt-5 rounded-full bg-[#202a24] px-5 py-2.5 text-xs font-bold text-white">Show everything</button></div>}
      </div>
    </main>
  );
}
