import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { ArrowDownRight, ArrowRight, Check, ChevronRight, Sparkles, Truck } from "lucide-react";
import ProductCard from "../components/ProductCard";
import FlashDealsSection from "../components/FlashDealsSection";

const fallbackCategories = ["Electronics", "Accessories", "Home"];
const fallbackHeroImage = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1400&q=85";

export default function Home({ products = [], onAddToCart }) {
  const collections = useMemo(() => {
    const names = [...new Set(products.map((product) => product.category).filter(Boolean))];
    return (names.length ? names : fallbackCategories).map((name) => ({
      name,
      product: products.find((item) => item.category === name),
    }));
  }, [products]);

  const featured = useMemo(() => [...products]
    .sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0) || Number(b.reviews || 0) - Number(a.reviews || 0))
    .slice(0, 4), [products]);

  const heroProduct = featured[0] || products[0];

  return (
    <main className="overflow-hidden bg-[#faf9f6] text-slate-950">
      <div className="bg-[#202a24] px-4 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.16em] text-white sm:text-xs">
        Complimentary shipping on orders over $100 <span className="mx-2 text-white/40">·</span> Thoughtful finds for everyday
      </div>

      <div className="mx-auto max-w-[1440px] px-4 pb-16 pt-5 sm:px-8 lg:px-12 lg:pt-8">
        <section className="relative grid min-h-[560px] overflow-hidden rounded-[28px] bg-[#eae8e1] md:grid-cols-[0.9fr_1.1fr] lg:min-h-[650px]">
          <div className="relative z-10 flex flex-col items-start justify-center px-7 py-12 sm:px-12 lg:px-16 lg:py-16">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-slate-900/10 bg-white/55 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-600">
              <Sparkles size={13} /> The SwiftShop edit
            </div>
            <h1 className="max-w-xl font-serif text-5xl font-medium leading-[0.98] tracking-[-0.055em] sm:text-6xl lg:text-[76px]">
              Good things, for <span className="italic text-[#647365]">every day.</span>
            </h1>
            <p className="mt-6 max-w-md text-sm leading-7 text-slate-600 sm:text-base">
              Useful objects. Thoughtful details. Meet the pieces that make your everyday feel a little more considered.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/shop" className="inline-flex items-center gap-3 rounded-full bg-[#202a24] px-6 py-3.5 text-xs font-bold text-white transition hover:bg-[#3b4b3f]">
                Shop the collection <ArrowRight size={15} />
              </Link>
              <a href="#featured" className="inline-flex items-center gap-2 px-3 py-3 text-xs font-semibold text-slate-600 hover:text-slate-950">
                Explore bestsellers <ArrowDownRight size={14} />
              </a>
            </div>
            <div className="mt-12 flex items-center gap-3 border-t border-slate-900/10 pt-5 text-xs text-slate-600">
              <span className="grid h-7 w-7 place-items-center rounded-full bg-white"><Check size={14} /></span>
              Carefully selected for daily life
            </div>
          </div>
          <div className="relative min-h-[320px] md:min-h-full">
            <img
              src={heroProduct?.image || fallbackHeroImage}
              alt={heroProduct?.name || "A SwiftShop everyday essential"}
              onError={(event) => { event.currentTarget.src = fallbackHeroImage; }}
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent md:bg-gradient-to-r md:from-[#eae8e1]/10 md:via-transparent md:to-black/10" />
            {heroProduct && <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between rounded-2xl border border-white/30 bg-white/85 p-4 backdrop-blur-md sm:bottom-8 sm:left-8 sm:right-8 sm:p-5">
              <div><p className="text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">In the spotlight</p><p className="mt-1 text-sm font-semibold text-slate-950">{heroProduct.name}</p></div>
              <div className="text-right"><p className="text-xs text-slate-500">From</p><p className="text-lg font-bold">${Number(heroProduct.price || 0).toFixed(2)}</p></div>
            </div>}
          </div>
          {heroProduct && <button onClick={() => onAddToCart?.(heroProduct)} className="absolute right-5 top-5 z-10 rounded-full bg-white/90 px-4 py-2 text-[11px] font-bold text-slate-900 shadow-sm backdrop-blur transition hover:bg-white md:hidden">Quick add</button>}
        </section>

        <section className="grid grid-cols-2 gap-3 border-b border-slate-200 py-7 sm:grid-cols-4 sm:gap-5 sm:py-9">
          {[[Truck, "Shipping over $100 is on us"], [Check, "Simple, secure checkout"], [Sparkles, "A considered edit"], [ArrowRight, "Support when you need it"]].map(([Icon, text]) => <div key={text} className="flex items-center gap-2.5 text-[10px] font-medium text-slate-600 sm:justify-center sm:text-xs"><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#eeece7] text-[#536453]"><Icon size={15}/></span>{text}</div>)}
        </section>

        <section className="py-14 sm:py-20">
          <div className="mb-7 flex items-end justify-between gap-4 sm:mb-9">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#748174]">Find your next favorite</p><h2 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">Shop by collection</h2></div>
            <Link to="/shop" className="hidden items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-950 sm:flex">All collections <ChevronRight size={15}/></Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 sm:gap-5">
            {collections.slice(0, 3).map(({ name, product }, index) => <Link key={name} to={`/shop?category=${encodeURIComponent(name)}`} className="group relative min-h-[230px] overflow-hidden rounded-2xl bg-[#e8e6df] sm:min-h-[300px]">
              {product?.image && <img src={product.image} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" />}
              <div className={`absolute inset-0 ${product?.image ? "bg-gradient-to-t from-black/65 via-black/5 to-transparent" : index === 1 ? "bg-gradient-to-br from-[#e1d8ca] to-[#bcc4b8]" : "bg-gradient-to-br from-[#dedbd2] to-[#b7bdb1]"}`} />
              <div className={`absolute inset-x-0 bottom-0 flex items-end justify-between p-5 sm:p-6 ${product?.image ? "text-white" : "text-slate-900"}`}><div><p className="text-[9px] font-bold uppercase tracking-[0.18em] opacity-75">Collection 0{index + 1}</p><h3 className="mt-1 font-serif text-2xl">{name}</h3></div><span className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-slate-900 transition group-hover:-rotate-45"><ArrowRight size={16}/></span></div>
            </Link>)}
          </div>
        </section>

        {/* Dynamic Flash Deals Section - Controlled by Admin */}
        <FlashDealsSection products={products} onAddToCart={onAddToCart} />

        <section id="featured" className="scroll-mt-28 py-4 sm:py-8">
          <div className="mb-7 flex items-end justify-between gap-4 sm:mb-9">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#748174]">Customer favorites</p><h2 className="mt-2 font-serif text-3xl tracking-tight sm:text-4xl">The everyday edit</h2></div>
            <Link to="/shop" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-950">Shop all <ArrowRight size={14}/></Link>
          </div>
          {featured.length ? <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 sm:gap-x-6 lg:grid-cols-4">{featured.map(product => <ProductCard key={product.id} product={product} onAddToCart={onAddToCart}/>)}</div> : <div className="rounded-2xl border border-dashed border-slate-300 py-16 text-center text-sm text-slate-500">Our collection is loading. Check back in a moment.</div>}
        </section>

        <section className="mt-16 overflow-hidden rounded-[26px] bg-[#dfe4dc] sm:mt-24">
          <div className="grid items-center gap-8 px-7 py-10 sm:px-12 sm:py-14 md:grid-cols-[1fr_auto] lg:px-16">
            <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#536453]">A better way to browse</p><h2 className="mt-3 max-w-xl font-serif text-3xl leading-tight tracking-tight sm:text-4xl">The right thing is easier to find.</h2><p className="mt-3 max-w-lg text-sm leading-6 text-slate-600">Search the full edit, explore by collection, and keep your favorites close.</p></div>
            <Link to="/shop" className="inline-flex w-fit items-center gap-3 rounded-full bg-[#202a24] px-6 py-3.5 text-xs font-bold text-white transition hover:bg-[#3b4b3f]">Explore SwiftShop <ArrowRight size={15}/></Link>
          </div>
        </section>
      </div>
    </main>
  );
}
