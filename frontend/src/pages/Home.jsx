import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function Home({ products, onAddToCart }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="bg-indigo-900 text-white rounded-3xl p-8 sm:p-12 mb-10">
        <h1 className="text-3xl sm:text-5xl font-extrabold mb-4">Handcrafted Goods for Everyday Life.</h1>
        <p className="text-indigo-100 text-sm mb-6 max-w-lg">Discover curated minimalist essentials engineered to last.</p>
        <Link to="/shop" className="inline-flex items-center gap-2 bg-white text-indigo-950 font-bold px-6 py-3 rounded-xl text-xs">
          Shop Catalog <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}