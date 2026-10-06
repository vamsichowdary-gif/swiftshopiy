import React, { useState } from "react";
import {
  Package,
  Plus,
  Edit2,
  Trash2,
  X,
  Search,
  RefreshCw,
  Star,
  Image as ImageIcon,
  Check,
  AlertCircle,
} from "lucide-react";
import { createAdminProduct, updateAdminProduct, deleteAdminProduct } from "./api";

const INITIAL_FORM = {
  name: "",
  category: "Electronics",
  price: "",
  rating: "5.0",
  reviews: "0",
  image: "",
  description: "",
};

export default function Products({
  products = [],
  token,
  onRefresh,
  loading = false,
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [successToast, setSuccessToast] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const categories = [
    "All",
    "Electronics",
    "Accessories",
    "Home",
    "Apparel",
    "Footwear",
    "Lifestyle",
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCat =
      categoryFilter === "All" ||
      (p.category || "").toLowerCase() === categoryFilter.toLowerCase();
    const matchesSearch =
      !searchTerm ||
      (p.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData(INITIAL_FORM);
    setFormError("");
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      category: product.category || "Electronics",
      price: product.price || "",
      rating: product.rating != null ? String(product.rating) : "5.0",
      reviews: product.reviews != null ? String(product.reviews) : "0",
      image: product.image || "",
      description: product.description || "",
    });
    setFormError("");
    setModalOpen(true);
  };

  const showToast = (msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(""), 4000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setSubmitting(true);

    // Client-side validations
    if (!formData.name.trim()) {
      setFormError("Product name is required.");
      setSubmitting(false);
      return;
    }
    const parsedPrice = parseFloat(formData.price);
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      setFormError("Please enter a valid price (greater than or equal to 0).");
      setSubmitting(false);
      return;
    }
    if (!formData.image.trim()) {
      setFormError("Please provide an image URL for the product.");
      setSubmitting(false);
      return;
    }
    if (!formData.description.trim()) {
      setFormError("Description is required.");
      setSubmitting(false);
      return;
    }

    try {
      if (editingProduct) {
        await updateAdminProduct(token, editingProduct.id, formData);
        showToast(`Successfully updated "${formData.name}"`);
      } else {
        await createAdminProduct(token, formData);
        showToast(`Successfully created "${formData.name}"`);
      }

      setModalOpen(false);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Product save error:", err);
      const msg =
        err.response?.data?.message ||
        (err.response?.data?.errors
          ? Object.values(err.response.data.errors).flat().join(" ")
          : null) ||
        err.message ||
        "Failed to save product. Please check required fields.";
      setFormError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deleteAdminProduct(token, id);
      showToast(`Deleted "${name}" from inventory.`);
      if (onRefresh) onRefresh();
    } catch (err) {
      console.error("Delete error:", err);
      alert(
        err.response?.data?.message || "Failed to delete product. Please retry."
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-xl text-xs font-semibold animate-in fade-in slide-in-from-bottom-2">
          <Check size={16} />
          {successToast}
        </div>
      )}

      {/* Header and Controls */}
      <div className="bg-[#131b2e] border border-[#1e293b] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Package size={20} className="text-amber-400" />
              Product Catalog & Inventory
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Add new products, update catalog details, prices, images, or remove items
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onRefresh}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#1e293b] hover:bg-[#28354f] text-slate-200 text-xs font-semibold rounded-xl transition border border-[#2b3a56] cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl transition shadow-md shadow-blue-900/40 cursor-pointer"
            >
              <Plus size={16} />
              Add Product
            </button>
          </div>
        </div>

        {/* Categories and Search Filter */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 pt-3 border-t border-[#1e293b]">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {categories.map((cat) => {
              const active = categoryFilter === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                    active
                      ? "bg-blue-600 text-white shadow-md shadow-blue-900/30"
                      : "bg-[#0e1424] text-slate-400 hover:text-slate-200 hover:bg-[#1a233a] border border-[#1e293b]"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="relative min-w-[240px]">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              placeholder="Search product name or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#0e1424] text-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 border border-[#1e293b] focus:outline-none focus:border-blue-500 placeholder-slate-500"
            />
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#131b2e] border border-[#1e293b] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#0e1424] text-slate-400 border-b border-[#1e293b]">
                <th className="py-3.5 px-4 font-semibold">Product</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">Price</th>
                <th className="py-3.5 px-4 font-semibold">Rating & Reviews</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="hover:bg-[#1a233a]/40 transition group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#0e1424] border border-[#1e293b] overflow-hidden shrink-0 flex items-center justify-center">
                          {p.image ? (
                            <img
                              src={p.image}
                              alt={p.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.style.display = "none";
                              }}
                            />
                          ) : (
                            <ImageIcon size={20} className="text-slate-600" />
                          )}
                        </div>
                        <div className="min-w-0 max-w-sm">
                          <p className="font-bold text-white truncate text-sm">
                            {p.name}
                          </p>
                          <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                            {p.description}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#0e1424] text-slate-300 border border-[#1e293b]">
                        {p.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-white text-sm">
                      ${parseFloat(p.price || 0).toFixed(2)}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                        <Star size={13} fill="currentColor" />
                        <span>{parseFloat(p.rating || 5.0).toFixed(1)}</span>
                        <span className="text-[11px] text-slate-400 font-normal">
                          ({p.reviews || 0} reviews)
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-2 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-[#1e293b] border border-transparent hover:border-[#2b3a56] transition"
                          title="Edit product"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id, p.name)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-[#1e293b] border border-transparent hover:border-[#2b3a56] transition"
                          title="Delete product"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <Package className="mx-auto text-slate-600 mb-2" size={32} />
                    <p className="font-semibold text-slate-300 text-sm">
                      No products found
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      {searchTerm
                        ? `No products matching "${searchTerm}"`
                        : "Click 'Add Product' above to create one."}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#131b2e] border border-[#1e293b] rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 border-b border-[#1e293b] flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {editingProduct
                    ? "Update item details in PostgreSQL catalog"
                    : "Create a new product listing with pricing and photos"}
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#1e293b] transition"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              {formError && (
                <div className="flex items-center gap-2 text-rose-400 bg-rose-950/40 border border-rose-800/60 p-3 rounded-xl">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Product Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ergonomic Office Chair"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full bg-[#0e1424] text-slate-200 px-3.5 py-2.5 rounded-xl border border-[#1e293b] focus:outline-none focus:border-blue-500 placeholder-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full bg-[#0e1424] text-slate-200 px-3 py-2.5 rounded-xl border border-[#1e293b] focus:outline-none focus:border-blue-500"
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Home">Home</option>
                    <option value="Apparel">Apparel</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Lifestyle">Lifestyle</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Price ($ USD) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="99.99"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full bg-[#0e1424] text-slate-200 px-3.5 py-2.5 rounded-xl border border-[#1e293b] focus:outline-none focus:border-blue-500 placeholder-slate-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Initial Rating (0 - 5.0)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="5.0"
                    value={formData.rating}
                    onChange={(e) =>
                      setFormData({ ...formData, rating: e.target.value })
                    }
                    className="w-full bg-[#0e1424] text-slate-200 px-3.5 py-2.5 rounded-xl border border-[#1e293b] focus:outline-none focus:border-blue-500 placeholder-slate-600"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Reviews Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.reviews}
                    onChange={(e) =>
                      setFormData({ ...formData, reviews: e.target.value })
                    }
                    className="w-full bg-[#0e1424] text-slate-200 px-3.5 py-2.5 rounded-xl border border-[#1e293b] focus:outline-none focus:border-blue-500 placeholder-slate-600"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Product Image URL *
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="w-full bg-[#0e1424] text-slate-200 px-3.5 py-2.5 rounded-xl border border-[#1e293b] focus:outline-none focus:border-blue-500 placeholder-slate-600"
                />
                {formData.image && (
                  <div className="mt-2 flex items-center gap-2 p-2 bg-[#0e1424] rounded-xl border border-[#1e293b]">
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-10 h-10 object-cover rounded-lg bg-slate-900"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <span className="text-[11px] text-slate-400">
                      Image preview
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">
                  Description *
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Detail the product specs, features, and warranty..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-[#0e1424] text-slate-200 px-3.5 py-2.5 rounded-xl border border-[#1e293b] focus:outline-none focus:border-blue-500 placeholder-slate-600 resize-none"
                />
              </div>

              <div className="pt-3 border-t border-[#1e293b] flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-[#0e1424] hover:bg-[#1a233a] text-slate-300 font-semibold border border-[#1e293b] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold transition shadow-md shadow-blue-900/30 cursor-pointer disabled:opacity-50"
                >
                  {submitting
                    ? "Saving..."
                    : editingProduct
                    ? "Save Changes"
                    : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
